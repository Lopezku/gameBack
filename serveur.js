require("dotenv").config();

const gameSet = {
  host: "http://localhost",
  port: "7000",
  socketConnexion: {},
  questions: [
    {
      question: "Qui est Charlemagne?",
      options: ["un peintre", "un empereur", "un clown", "un pompier"],
      answer: 1,
    },
    {
      question: "Qui est pascal OP?",
      options: ["un acteur porno", "un empereur", "un clown", "un pompier"],
      answer: 0,
    },
    {
      question: "Qui a volé l'orange du marchand?",
      options: [
        "un acteur porno",
        "un empereur",
        "un clown",
        "Maigret est sur le coup",
      ],
      answer: 3,
    },
    {
      question: "Qu'est-ce qu'un Physarum polycephalum?",
      options: [
        "un champignon",
        "une maladie",
        "un blob",
        "une plante du Pacifique",
      ],
      answer: 2,
    },
    {
      question: "Quel est l'équivalent de pouet.coin ?",
      options: [
        "pouet[coin]",
        "pouet['coin']",
        "pouet.getCoin()",
        "Aucune des solutions précédentes.",
      ],
      answer: 1,
    },
    {
      question: "Depuis quand sont disponibles les arrow functions ?",
      options: [
        " JavaScript 1.7",
        "ECMAScript 6",
        "ECMAScript 7",
        "ECMAScript 2018",
      ],
      answer: 1,
    },
    {
      question: "Quel est le résultat de parseInt('010',8) ?",
      options: ["1", "2", "8", "10"],
      answer: 2,
    },
    {
      question: "Qui a dit 'Solide comme un roc'?",
      options: ["Faudel", "Goldman", "Depardieu", "Nadiya"],
      answer: 3,
    },
  ],
};
let currentRound;
const mongodb = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const auth = require("./public/js/auth");
const socketioJwt = require("socketio-jwt");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
let firstAnswer = true;
/**
 * Partie HTTP
 */

const app = express();
const router = express.Router();
const server = require("http").createServer(app);
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// On utilise le moteur de rendu pug
app.set("view engine", "pug");
// on indique que chaque url qui commence par /assets trouvera
// une correspondance avec un chemin dans le dossier /public
app.use("/assets", express.static(`${__dirname}/public`));
app.get("/form", (request, response) => {
  return response.render("form", {
    title: "Bienvenue à l'inscription du jeu Socket io",
  });
});

app.post("/homeGame", (request, response) => {
  const nickname = request.body.nickname;
  const password = request.body.password;
  //on checke validité du pseudo
  mongodb.MongoClient.connect(
    process.env.URL_MONGO,
    {
      useUnifiedTopology: true,
    },
    (error, client) => {
      if (error) {
        console.error(error);
      } else {
        const db = client.db("WebsocketForm");
        const collection = db.collection("comments");
        collection
          .findOne({ nickname: nickname })
          .then((item) => {
            if (item !== null) {
              bcrypt
                .compare(password, item.password)
                .then((valid) => {
                  if (!valid) {
                    return response.render("index", {
                      title: "Password incorrect",
                    });
                  }

                  if (gameSet.socketConnexion[nickname]) {
                    return response.render("index", {
                      title: "Vous êtes déjà connecté dans un autre navigateur",
                    });
                  }

                  const token = jwt.sign(
                    {
                      exp: Math.floor(Date.now() / 1000) + 60 * 60,
                      userID: nickname,
                    },
                    process.env.TOKEN_KEY
                  );

                  gameSet.socketConnexion[nickname] = { token };
                  mongodb.MongoClient.connect(
                    process.env.URL_MONGO,
                    {
                      useUnifiedTopology: true,
                    },
                    (error, client) => {
                      if (error) {
                        console.error(error);
                      } else {
                        const db = client.db("WebsocketForm");
                        const collection = db.collection("comments");
                        const cursor = collection
                          .find({})
                          .sort({ score: -1 })
                          .limit(5);
                        cursor.toArray((error, documents) => {
                          return response.render("homeGame", {
                            title: "Bienvenue au jeu websocket",
                            nickname: nickname,
                            scores: documents || [],
                            token: token,
                          });
                        });
                      }
                    }
                  );
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              return response.render("index", {
                title: "Password et Identifiant ne correspondent pas",
              });
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  );
});
/*app.use("/homeGame/*", (request, response) => {
  return response.render("game", {
    title: "Qui veut gagner des pépéttes?",
  });
   else {
    return response.render("index", {
      title: "Veuillez vous connecter pour jouer",
    });
  } Middleware auth
});*/
app.get("/homeGame/game", (request, response) => {
  return response.render("game", {
    title: "Qui veut gagner des pépéttes?",
  });
  /* else {
    return response.render("index", {
      title: "Veuillez vous connecter pour jouer",
    });
  } */
});
app.post("/home", (request, response) => {
  const nickname = request.body.nickname;
  const password = request.body.password;
  const passwordHashed = bcrypt.hashSync(password, salt);
  //const password = myModuleEncrypt(request.body.password);
  const avatar = request.body.avatar;
  //on checke validité du pseudo
  mongodb.MongoClient.connect(
    process.env.URL_MONGO,
    {
      useUnifiedTopology: true,
    },
    (error, client) => {
      if (error) {
        console.error(error);
      } else {
        const db = client.db("WebsocketForm");
        const collection = db.collection("comments");
        collection
          .findOne({ nickname })
          .then((item) => {
            if (item !== null || nickname === "") {
              return response.render("form", {
                title: "Ce pseudonyme est vide ou existe déjà",
              });
            } else {
              // On envoi le message à mongodb
              mongodb.MongoClient.connect(
                process.env.URL_MONGO,
                {
                  useUnifiedTopology: true,
                },
                (error, client) => {
                  if (error) {
                    console.error(error);
                  } else {
                    const db = client.db("WebsocketForm");
                    const collection = db.collection("comments");
                    const date = new Date().toLocaleString("fr-FR");
                    collection.insertOne({
                      nickname,
                      password: passwordHashed,
                      date,
                      score: 0,
                      gamingTime: 0,
                    });
                  }
                }
              );
              /* return response.render("home", {
                title: "Inscription bien effectuée",
                nickname: nickname,
              }); */
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  );
  //renvoi tous les scores
  mongodb.MongoClient.connect(
    process.env.URL_MONGO,
    {
      useUnifiedTopology: true,
    },
    (error, client) => {
      if (error) {
        console.error(error);
      } else {
        const db = client.db("WebsocketForm");
        const collection = db.collection("comments");
        const cursor = collection.find({}).sort({ score: -1 }).limit(5);
        const token = jwt.sign(
          {
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            userID: nickname,
          },
          process.env.TOKEN_KEY
        );
        /* customer already connected*/
        if (gameSet.socketConnexion[nickname]) {
          return response.render("index", {
            title: "Vous êtes déjà connecté dans un autre navigateur",
          });
        }

        gameSet.socketConnexion[nickname] = { token };
        cursor.toArray((error, documents) => {
          return response.render("homeGame", {
            title: "Inscription bien effectuée",
            nickname,
            token,
            scores: documents || [],
          });
        });
      }
    }
  );
});
app.get("/", (request, response) => {
  return response.render("index", {
    title: "Bienvenue au jeu websocket",
  });
});
app.get("/*", (request, response) => {
  return response.render("error", {
    title: "Cette page n'existe pas, vous vous êtes trompés de jeu",
  });
});
const httpServer = server.listen(process.env.PORT, () => {
  console.log(`application is running at: ${gameSet.host}:${process.env.PORT}`);
});

/**
 * Partie WebSocket
 */

// convert a connect middleware to a Socket.IO middleware
const io = require("socket.io");
const Server = io.Server;
const ioServer = new Server(httpServer);
//const uuid = require("uuid");

function beginGame(socket) {
  let counterRound = 0;
  const idInterval = setInterval(sendRound, 6000);
  function sendRound() {
    if (counterRound === gameSet.questions.length) {
      clearInterval(idInterval);
      let maxScore = 0;
      let winner = null;
      let allScores = gameSet.socketConnexion;
      console.log("allscores", gameSet.socketConnexion);
      for (const scorePlayer in gameSet.socketConnexion) {
        console.log(
          "🚀 ~ file: serveur.js ~ line 326 ~ sendRound ~ scorePlayer",
          scorePlayer
        );
        //allScores.push()
        if (gameSet.socketConnexion[scorePlayer].scorePlayer > maxScore) {
          maxScore = gameSet.socketConnexion[scorePlayer].scorePlayer;
          winner = scorePlayer;
        }
      }
      //enregistrer scores
      /*mongodb.MongoClient.connect(
        process.env.URL_MONGO,
        {
          useUnifiedTopology: true,
        },
        (error, client) => {
          if (error) {
            console.error(error);
          } else {
            const db = client.db("WebsocketForm");
            const collection = db.collection("comments");
            collection
              .findOne({ nickname: nickname })
              .then((item) => {
                if (item !== null) {
                  bcrypt
                    .compare(password, item.password)
                    .then((valid) => {
                      if (!valid) {
                        return response.render("index", {
                          title: "Password incorrect",
                        });
                      }

                      if (gameSet.socketConnexion[nickname]) {
                        return response.render("index", {
                          title:
                            "Vous êtes déjà connecté dans un autre navigateur",
                        });
                      }

                      const token = jwt.sign(
                        {
                          exp: Math.floor(Date.now() / 1000) + 60 * 60,
                          userID: nickname,
                        },
                        process.env.TOKEN_KEY
                      );

                      gameSet.socketConnexion[nickname] = { token };
                      mongodb.MongoClient.connect(
                        process.env.URL_MONGO,
                        {
                          useUnifiedTopology: true,
                        },
                        (error, client) => {
                          if (error) {
                            console.error(error);
                          } else {
                            const db = client.db("WebsocketForm");
                            const collection = db.collection("comments");
                            const cursor = collection
                              .find({})
                              .sort({ score: -1 })
                              .limit(5);
                            cursor.toArray((error, documents) => {
                              return response.render("homeGame", {
                                title: "Bienvenue au jeu websocket",
                                nickname: nickname,
                                scores: documents || [],
                                token: token,
                              });
                            });
                          }
                        }
                      );
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                } else {
                  return response.render("index", {
                    title: "Password et Identifiant ne correspondent pas",
                  });
                }
              })
              .catch((err) => {
                console.error(err);
              });
          }
        }
      );*/
      socket.emit("endGame", { winner, maxScore, allScores });
    } else {
      ioServer.emit("beginRound", {
        question: gameSet.questions[counterRound].question,
        options: gameSet.questions[counterRound].options,
        counterRound,
      });
      counterRound++;
    }
  }
}

ioServer.on("connection", (socket) => {
  const playersConnected = Object.keys(gameSet.socketConnexion);
  let currentPlayerNickname;
  ioServer.to(socket.id).emit("requestNickname");

  socket.on("responseNickname", (data) => {
    gameSet.socketConnexion[data.playerNickname] = { scorePlayer: 0 };
    currentPlayerNickname = data.playerNickname;
    ioServer.emit("listPlayer", Object.keys(gameSet.socketConnexion));

    socket.on("sendResponse", (data) => {
      console.log("response score");
      if (data.index === gameSet.questions[data.counterRound].answer) {
        if (!firstAnswer) {
          gameSet.socketConnexion[data.playerNickname].scorePlayer += 20;
          firstAnswer = true;
        } else {
          gameSet.socketConnexion[data.playerNickname].scorePlayer += 10;
        }
      }
      console.log(gameSet.socketConnexion);
    });
  });
  /*gestion plus de deux joueurs?*/
  if (playersConnected.length >= 2) {
    beginGame(socket);
  }
  socket.on("disconnect", (data) => {
    delete gameSet.socketConnexion[currentPlayerNickname];
    ioServer.emit("listPlayer", Object.keys(gameSet.socketConnexion));
  });
});
