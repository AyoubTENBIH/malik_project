const socket = io();

socket.on("data", (data) => {

  document.getElementById("temp").innerText = data.temp;
  document.getElementById("gaz").innerText = data.gaz;
  document.getElementById("current").innerText = data.courant;
  document.getElementById("voltage").innerText = data.tension;
  document.getElementById("piezo").innerText = data.piezo;

});