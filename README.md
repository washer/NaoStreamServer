# Nao Stream Server

## Server side

### Dependencies

To run the server, node.js is required. It can be found at http://nodejs.org.
A yarn.lock file is supplied, but not required.

Apart from that, all dependencies are managed internally

### Setup and execution

First thing to do when starting the server is navigating to the root of the project (where this file is loacted) in a terminal. If you have yarn installed, go ahead and type
```
yarn
```
in the terminal. Otherwise, type
```
npm install
```
Both of these will install the dependencies required to run the application - it's just a matter of preference.

At this point, the server should be ready to be started.

To start the application, all that is required is to run

```
npm start
```

By default, this will start the application on port 3000. This port is the one that will be used for api calls, while the streaming will happen elsewhere (more on that later). If you want to run in on another port than 3000, you can do the following

```
PORT=3030 npm start
```

This would start the application on port 3030.

### Configuration
Inside the project is a folder called configs, with a file inside of it labelled stream_config.json. There are 3 values that can be configured:

* "stream_secret"

    This is an arbitrary secret used in the url to stream to, to prevent hijacking of the stream. It is the only required configuration of the server.

* "websocket_port"

    This port is used for sending data between the frontend and backend. It defaults to port 8084, and does not require any custom configuration (unless there is a port conflict).

* "stream_port"

    This is the port used when streaming video data to the server. It defaults to port 8082, and does not require any custom configuration (unless there is a port conflict).

********************************************************

## Client side

The main functionality of the app is the video streaming. It is done by ffmpeg streaming to a websocket, which is then received and displayed by the server.

### Dependencies

You will need to have ffmpeg installed to stream to the server, so head to http://ffmpeg.org/ to download the appropriate version for you OS.

### Execution

To stream data to the server, you need to run ffmpeg. The exact command will differ based on OS, amongst other things.
Here is the command that i have used locally for testing, followed by a breakdown of the parameters.

```
ffmpeg -s 640x480 -f video4linux2 -i /dev/video0 -f mpeg1video \
-b:v 800k -r 30 http://pelt.dk:8082/secretsauce/640/480/
```

* -s 640x480: -s is size. Specifies the dimensions of the video being streamed.
* -f video4linux2: -f is force. This forces ffmpeg to use the video4linux api to format the video file.
* -i /dev/video0: -i is for input. Makes ffmpeg use /dev/video0 (the default video input on ubuntu - in this case my webcam on my laptop) as the video input.
* -f mpeg1video: -f is force. Similar to the previous force parameter, it forces ffmpeg to use the MPEG-1 codec for compression of the video.
* -b:v 800k: -b is bitrate. Specifies the bitrate used for the video (the v in b:v is simply explicly stating that it is for video, as opposed to b:a for audio).
* -r 30: -r is framerate. Specifies the framerate to stream the video in.
* http://pelt.dk:8082/secretsauce/640/480/ is the url to send the stream data to.
    * pelt.dk is my personal domain.
    * 8082 is the stream_port, as set in the stream_config.json file.
    * Secretsauce is my test stream_secret (which is set in the stream_config.json file).
    * /640/480/ is the size of the video we are sending

Documentation for ffmpeg command line tool can be found here: http://ffmpeg.org/ffmpeg.html.

Some testing will be required to find the correct configuration to run on a mac, but this section will be updated when such a configuration is found.

When ffmpeg is streaming to the correct url, we should be able to see the video stream. If we are running the server on localhost:3000, and sending stream data to localhost:8082, we should be able to go to localhost:3000/ in a browser to see the video data.
As of now, there are some issues with actually running the server locally, but those will hopefully be fixed shortly.
