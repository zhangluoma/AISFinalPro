var roomNumber = document.getElementById('roomNumber').value;
//var roomPassword = document.getElementById('roomPassword').value;

var socket = io.connect();
socket.on('message',function(message){
   console.log('I receive ',message);
});


function sendMessage(cmd,message){
    console.log('Client sent: ',cmd," -- ", message);
    socket.emit(cmd,message);
}


function sendVideoRequest(){
    //sendMessage('join',roomNumber);
    webrtc.joinRoom(roomNumber);
}


sendMessage('join',roomNumber);