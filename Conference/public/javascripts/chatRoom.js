function appendChat(msg){
$chatWindow = $('#chatresponse');
var $messageLine = '<div class="comment"><a class="avatar"><img src="http://i60.tinypic.com/34ik10y.png"></a><div class="content"><a class="author">'
    + msg.substring(0,msg.indexOf(':'))
    + '</a><div class="metadata"><span class="date">'
    + new Date().toLocaleTimeString()
    + '</span></div><div class="text">'
    + msg.substring(msg.indexOf(':')+1)
    + '</div></div></div>';
$chatWindow.append($messageLine);
//document.getElementById('scrollable').scrollTop=document.getElementById('scrollable').scrollHeight;
}
function sendChat(){
	sendMessage("chatMessage",{roomNumber: roomNumber, text: userName+":"+document.getElementById('chat_message').value});
}
function pressToSend(event){
	if(document.getElementById('chat_message').value!=''&&event.keyCode==13){
		sendChat();
        document.getElementById('chat_message').value='';
	}
}
socket.on('chatMessage',function(message){
   appendChat(message);
   scrollDown('scrollable');
 });
function scrollDown(divId){
    var a = document.getElementById(divId);
    a.scrollTop=a.scrollHeight;
}