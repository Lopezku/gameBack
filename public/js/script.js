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
    playersList.innerHTML = "";
    removeAllChildNodes(playersList);
    updatedPlayersConnected.forEach((player, index) => {
      const playerAvatar = window.document.createElement("img");
      if (index === 0) {
        playerAvatar.src = `/assets/img/avatar-yellow.png`;
      } else {
        playerAvatar.src = `/assets/img/avatar-red.png`;
      }
      playersList.appendChild(playerAvatar);
      const playerItem = window.document.createElement("li");
      playerItem.style.listStyle = "none";
      playerItem.className = "playerContainer";
      playerItem.innerHTML = player;
      playersList.appendChild(playerItem);
    });
    playersConnected = updatedPlayersConnected;
    if (playersConnected.length === 1) {
      console.log("line 69" + playersConnected);
      const waitPlayerParagraph = window.document.createElement("p");
      waitPlayerParagraph.id = "question";
      waitPlayerParagraph.innerText =
        "Veuillez patienter avant l'arrivée d'un deuxième joueur";
      divAnswers.appendChild(waitPlayerParagraph);
      //socket.emit("Veuillez patienter pour l'arrivée du deuxième joueur");
    }
  });
  socket.on("beginRound", ({ question, options, counterRound }) => {
    if (playersConnected.length === 2) {
      questionDiv.innerHTML = question;
      clickOnAnswer = false;
      //removeAllChildNodes(answers);
      removeAllChildNodes(answers);
      options.forEach((option, index) => {
        const optionButton = window.document.createElement("button");
        optionButton.id = option;
        optionButton.innerText = option;
        divAnswers.appendChild(optionButton);

        optionButton.addEventListener("click", (e) => {
          console.log({ playerNickname, counterRound, index });
          optionButton.style.backgroundColor = "#63f05e";
          const buttons = document.querySelectorAll("button");
          buttons.forEach((button) => {
            button.disabled = true;
          });
          e.preventDefault();
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
    removeAllChildNodes(answers);

    for (const [player, scorePlayer] of Object.entries(allScores)) {
      console.log(
        "🚀 ~ file: script.js ~ line 80 ~ socket.on ~ allScores",
        scorePlayer
      );
      const playerScore = window.document.createElement("p");
      playerScore.id = "scoreBoard";
      playerScore.innerHTML = `${player} a obtenu ${scorePlayer}`;
      divAnswers.appendChild(playerScore);
    }
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
