"use strict";
let playersConnected = [];
window.document.addEventListener("DOMContentLoaded", () => {
  const playersList = window.document.querySelector("ul");
  const questionDiv = window.document.getElementById("question");
  let clickOnAnswer;
  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
  const divAnswers = window.document.getElementById("answers");
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
    removeAllChildNodes(playersList);
    updatedPlayersConnected.forEach((player) => {
      const playerItem = window.document.createElement("li");
      playerItem.style.listStyle = "none";
      playerItem.id = player;
      playerItem.innerHTML = player;
      playersList.appendChild(playerItem);
    });
    playersConnected = updatedPlayersConnected;
    console.log(
      "🚀 ~ file: script.js ~ line 35 ~ socket.on ~ playersConnected",
      playersConnected
    );
  });
  socket.on("beginRound", ({ question, options, counterRound }) => {
    if (playersConnected) {
      questionDiv.innerHTML = question;
      clickOnAnswer = false;
      //removeAllChildNodes(answers);
      removeAllChildNodes(answers);
      options.forEach((option, index) => {
        const optionButton = window.document.createElement("button");
        optionButton.id = option;
        optionButton.innerText = option;
        divAnswers.appendChild(optionButton);

        optionButton.addEventListener("click", () => {
          console.log({ playerNickname, counterRound, index });
          optionButton.style.backgroundColor = "#63f05e";
          const buttons = document.querySelectorAll("button");
          buttons.forEach((button) => {
            button.disabled = true;
          });
          return socket.emit("sendResponse", {
            playerNickname,
            counterRound,
            index,
          });
        });
      });
    }
  });

  socket.on("endGame", ({ winner, maxScore, allScores }) => {
    for (const [player, scorePlayer] of Object.entries(allScores)) {
      const playerScore = window.document.createElement("p");
      playerScore.id = "scoreBoard";
      playerScore.innerHTML = `${player} a obtenu ${scorePlayer}`;
      divAnswers.appendChild(playerScore);
    }
    console.log("joueur current line 72 client", playerNickname);
    console.log("joueur winner", winner);
    if (playerNickname === winner[0]) {
      alert(`${playerNickname} you win with ${maxScore}`);
    } else if (winner === null || winner === "egality") {
      alert(`${playerNickname}, il n'y a pas de gagnant`);
    } else {
      alert(
        `${playerNickname}: you loose. Le winner est : ${winner[0]} avec ${maxScore}`
      );
    }
  });
});
