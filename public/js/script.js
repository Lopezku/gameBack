"use strict";
let playersConnected = [];
window.document.addEventListener("DOMContentLoaded", () => {
  /* jeu de boules*/
  const canvas = window.document.querySelector("canvas");
  const playersList = window.document.querySelector("ul");
  const questionDiv = window.document.getElementById("question");

  const updateOrCreateSquare = (square) => {
    let divElement = window.document.getElementById(square.id);
    if (!divElement) {
      divElement = window.document.createElement("div");
      divElement.id = square.id;
      window.document.body.appendChild(divElement);
    }
    divElement.style.top = square.top;
    divElement.style.left = square.left;
    divElement.style.width = square.width;
    divElement.style.height = square.height;
    divElement.style.position = square.position;
    divElement.style.backgroundColor = square.backgroundColor;
    //return divElement;
  };
  const playerNickname = localStorage.getItem("nickname");
  const playerToken = localStorage.getItem("token");
  // On créé une instance de WebSocket
  const socket = io("http://localhost:7000");
  socket.on("requestNickname", () => {
    socket.emit("responseNickname", { playerNickname, playerToken });
  });
  socket.on("updateOrCreateSquare", (square) => {
    const squareElement = updateOrCreateSquare(square);
  });
  socket.on("listPlayer", (updatedPlayersConnected) => {
    console.log(
      "🚀 ~ file: script.js ~ line 35 ~ socket.on ~ updatedPlayersConnected",
      updatedPlayersConnected
    );
    playersList.innerHTML = "";
    updatedPlayersConnected.forEach((player) => {
      const playerItem = window.document.createElement("li");
      playerItem.style.listStyle = "none";
      playerItem.id = player;
      playerItem.innerHTML = player;
      playersList.appendChild(playerItem);
    });
    playersConnected = updatedPlayersConnected;
  });
  socket.on("beginRound", ({ question, options, counterRound }) => {
    questionDiv.innerHTML = question;
    options.forEach((option, index) => {
      const optionButton = window.document.createElement("button");
      optionButton.id = option;
      optionButton.innerText = option;
      questionDiv.appendChild(optionButton);
      optionButton.addEventListener("click", () => {
        console.log({ playerNickname, counterRound, index });
        socket.emit("sendResponse", { playerNickname, counterRound, index });
      });
    });
  });

  socket.on("endGame", ({ winner, maxScore }) => {
    if (playerNickname === winner) {
      alert(`${playerNickname} you win with ${maxScore}`);
    } else {
      alert(
        `${playerNickname} you loose, pas de score. Le winner est : ${winner} avec ${maxScore}`
      );
    }
  });

  socket.on("destroySquare", (square) => {
    const divElement = window.document.getElementById(square.id);
    if (divElement) {
      divElement.parentNode.removeChild(divElement);
    }
  });

  /*   socket.on("destroyPlayer", (playerFront) => {
    const divElement = window.document.getElementById(playerFront);
    if (divElement) {
      divElement.parentNode.removeChild(divElement);
    }
  }); */
  window.addEventListener("mousemove", (e) => {
    const position = {
      x: e.clientX,
      y: e.clientY,
    };
    socket.emit("mousemove", position);
  });
});
