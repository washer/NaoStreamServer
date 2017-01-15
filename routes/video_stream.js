'use strict';

// TODO USE CONFIGS FOR SECRETS & PORTS etc.

const ws                 = require('ws');
const http               = require('http');

const STREAM_SECRET      = 'secretsauce';
const STREAM_PORT        = 8082;
const WEBSOCKET_PORT     = 8084;
const STREAM_MAGIC_BYTES = 'arty' // Must be 4 bytes

let width  = 320;
let height = 240;
let socketServer;

const init = () => {
    // Websocket Server
    socketServer = new ws.Server({ port: WEBSOCKET_PORT });

    socketServer.on('connection', listen);

    socketServer.broadcast = function(data, opts) {
        for (var i in this.clients) {
            if (this.clients[i].readyState === 1) {
                this.clients[i].send(data, opts);
            } else {
                console.log('Error: Client (' + i + ') not connected.');
            }
        }
    };

    // HTTP Server to accept incomming MPEG Stream
    http.createServer(initServer).listen(STREAM_PORT);

    console.log('Listening for MPEG Stream on http://127.0.0.1:'+STREAM_PORT+'/<secret>/<width>/<height>');
    console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
};

const initServer = (req, res) => {
    let params = req.url.substr(1).split('/');

    if (params[0] === STREAM_SECRET) {
        res.connection.setTimeout(0);

        width = (params[1] || 320) | 0;
        height = (params[2] || 240) | 0;

        console.log(
            'Stream Connected: ' + req.socket.remoteAddress +
            ':' + req.socket.remotePort + ' size: ' + width + 'x' + height
        );
        req.on('data', function(data) {
            socketServer.broadcast(data, {
                binary: true
            });
        });
    } else {
        console.log(
            'Failed Stream Connection: ' + req.socket.remoteAddress +
            req.socket.remotePort + ' - wrong secret.'
        );
        res.end();
    }
}

const listen = (socket) => {
    // Send magic bytes and video size to the newly connected socket
    // struct { char magic[4]; unsigned short width, height;}
    let streamHeader = new Buffer(8);
    streamHeader.write(STREAM_MAGIC_BYTES);
    streamHeader.writeUInt16BE(width, 4);
    streamHeader.writeUInt16BE(height, 6);
    socket.send(streamHeader, {
        binary: true
    });

    console.log('New WebSocket Connection (' + socketServer.clients.length + ' total)');

    socket.on('close', function(code, message) {
        console.log('Disconnected WebSocket (' + socketServer.clients.length + ' total)');
    });
}

module.exports = {
    init
}
