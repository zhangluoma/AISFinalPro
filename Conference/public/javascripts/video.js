    function generateVideoFrame(peerId){
        var box = document.createElement("div");
        box.setAttribute("class","thumbnail");
        var box2 = document.createElement("div");
        box2.setAttribute("class","col-lg-6");
        box2.appendChild(box);
        box2.setAttribute("id","video:"+peerId);
        document.getElementById("videoFrames").appendChild(box2);
        return box;
    }
    var webrtc = new SimpleWebRTC({
        localVideoEl: 'localVideo',
        remoteVideoEl: '',
        autoRequestMedia: true,
        debug: false,
        detectSpeakingEvents: true,
        autoAdjustMic: false
    });
    webrtc.on('readyToCall', function () {
                var mainV = document.getElementById("mainVideo");
                console.log(mainV.parentNode.offsetWidth);
                clickActive("videoLabel");
                sendVideoRequest();
                mainV.style.width=0.975*mainV.parentNode.offsetWidth+"px";
                mainV.style.height=0.7*mainV.parentNode.offsetWidth+"px";
            });
    webrtc.on('localStream', function (stream) {
    });
    // we did not get access to the camera
    webrtc.on('localMediaError', function (err) {
    });
    webrtc.on('videoAdded', function (video, peer) {
        console.log('video added', peer);
        var remotes = generateVideoFrame(webrtc.getDomId(peer));
        if (remotes) {
            var container = document.createElement('div');
            //container.style.textAlign="center";
            container.className = 'videoContainer';
            container.id = 'container_' + webrtc.getDomId(peer);
            container.appendChild(video);

            // suppress contextmenu
            video.oncontextmenu = function () { return false; };

            // resize the video on click
            // show the remote volume
            var vol = document.createElement('meter');
            vol.id = 'volume_' + peer.id;
            vol.className = 'volume';
            vol.min = -45;
            vol.max = -20;
            vol.low = -40;
            vol.high = -25;
            container.appendChild(vol);
            
            // show the ice connection state
            if (peer && peer.pc) {
                var connstate = document.createElement('div');
                connstate.className = 'connectionstate';
                container.appendChild(connstate);
                peer.pc.on('iceConnectionStateChange', function (event) {
                    switch (peer.pc.iceConnectionState) {
                    case 'checking': 
                        connstate.innerText = 'Connecting to peer...';
                        break;
                    case 'connected':
                    case 'completed': // on caller side
                        //$(vol).show();
                        connstate.innerText = 'Connection established.';
                        break;
                    case 'disconnected':
                        //connstate.innerText = 'Disconnected.';
                        break;
                    case 'failed':
                        connstate.innerText = 'Connection failed.';
                        break;
                    case 'closed':
                        connstate.innerText = 'Connection closed.';
                        console.log("video:"+webrtc.getDomId(peer));
                        var currFrame = document.getElementById("video:"+webrtc.getDomId(peer));
                        currFrame.parentNode.removeChild(currFrame);
                        break;
                    }
                });
            }
            remotes.appendChild(container);
            container.style.width=0.975*container.parentNode.offsetWidth+"px";
            container.style.height=0.7*container.parentNode.offsetWidth+"px";
        }
    });
    webrtc.on('videoRemoved', function (video, peer) {
          console.log('video removed ', peer);
          var remotes = document.getElementById('remotes');
          var el = document.getElementById(peer ? 'container_' + webrtc.getDomId(peer) : 'localScreenContainer');
          if (remotes && el) {
              remotes.removeChild(el);
          }
      });