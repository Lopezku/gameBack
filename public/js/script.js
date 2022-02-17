"use strict";
let playersConnected = [];
window.document.addEventListener("DOMContentLoaded", () => {
  const playersList = window.document.querySelector("ul");
  const questionDiv = window.document.getElementById("question");
  let clickOnAnswer;
  const playerNickname = localStorage.getItem("nickname");
  const playerToken = localStorage.getItem("token");
  // On créé une instance de WebSocket
  const socket = io("http://localhost:7000");
  socket.on("requestNickname", () => {
    socket.emit("responseNickname", { playerNickname, playerToken });
  });
  socket.on("listPlayer", (updatedPlayersConnected) => {
    console.log(
      "🚀 ~ file: script.js ~ line 35 ~ socket.on ~ updatedPlayersConnected",
      updatedPlayersConnected
    );
    playersList.innerHTML = "";
    //removeAllChildNodes(playersList)
    //removechild
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
    clickOnAnswer = false;
    options.forEach((option, index) => {
      const optionButton = window.document.createElement("button");
      optionButton.id = option;
      //optionButton.style.display.flex-direction: column";
      optionButton.innerText = option;
      /*optionButton.disabled = true;*/
      questionDiv.appendChild(optionButton);

      optionButton.addEventListener("click", () => {
        console.log({ playerNickname, counterRound, index });
        //clickOnAnswer = true;
        const buttons = document.querySelectorAll("button");
        buttons.forEach((button) => {
          button.disabled = true;
        });
        optionButton.style.backgroundColor = "red";
        socket.emit("sendResponse", { playerNickname, counterRound, index });
      });
    });
  });

  socket.on("endGame", ({ winner, maxScore, allScores }) => {
    console.log(
      "🚀 ~ file: script.js ~ line 44 ~ socket.on ~ allScores",
      allScores
    );

    for (const scorePlayer in allScores) {
      const playerScore = window.document.createElement("p");
      playerScore.id = "scoreBoard";
      playerScore.innerHTML = `${scorePlayer} a obtenu ${allScores[scorePlayer].scorePlayer}`;
      window.document.body.appendChild(playerScore);
    }
    if (playerNickname === winner) {
      alert(`${playerNickname} you win with ${maxScore}`);
    } else {
      alert(
        `${playerNickname} you loose, pas de score. Le winner est : ${winner} avec ${maxScore}`
      );
    }
  });
  //divElement.parentNode.removeChild(divElement);
});
