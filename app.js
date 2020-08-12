var audio1 = new Audio("./beep1.ogg");
var audio2 = new Audio("./beep1.ogg");
var audio_go = new Audio("./cannon.ogg");

var i = 0;
var par = true;

setInterval(function () {
  i++;
  document.querySelector("#tiempo").innerHTML = i;
  if (par) {
    audio1.play();
    par = false;
  } else {
    audio2.play();
    par = true;
  }
  if (i % 5 == 0) {
    audio_go.play();
  }
}, 1000);
