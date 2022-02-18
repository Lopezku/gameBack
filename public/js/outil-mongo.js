const MongoClient = require("mongodb").MongoClient;

/**
 * Utilitaire pour gérer les connexions avec :
 * MongoDB Node.JS Driver (version 3.0)
 * Reference : http://mongodb.github.io/node-mongodb-native/3.0/
 * API : http://mongodb.github.io/node-mongodb-native/3.0/api/
 */

class OutilMongoDB {
  constructor(host, port, nomBase) {
    this.host = process.env.URL_MONGO || "";
    this.port = port || 27017;
    this.nomBase = nomBase || "WebsocketForm";
    this.instanceMongoClient = null;
  }

  instanceCollection(nomCollection) {
    this.instanceMongoClient
      .db(this.nomBase)
      .collection(nomCollection)
      .then((refCollection) => {
        return Promise.resolve(refCollection); // retourne une référence à la base de données sélectionnée
      })
      .catch((err) => {
        console.log(
          `Impossible de récupérer l'instance de la collection "${nomCollection}"`,
          err
        );
        return Promise.reject(err); // retourne une référence à la base de données sélectionnée
      });
  }

  utiliserBase(nomBase) {
    this.nomBase = nomBase || this.nomBase; // Inutilisé pour le moment
    if (
      this.instanceMongoClient &&
      this.instanceMongoClient.isConnected(this.nomBase)
    ) {
      return Promise.resolve(this.instanceMongoClient.db(this.nomBase)); // retourne une référence à la base de données sélectionnée
    } else {
      return this.etablirConnexion(nomBase);
    }
  }

  etablirConnexion(nomBase) {
    return MongoClient.connect(`mongodb://${this.host}:${this.port}/`)
      .then((instanceMongoClient) => {
        console.log(
          `Connecté au serveur mongodb sur mongodb://${this.host}:${this.port}/`
        );
        this.instanceMongoClient = instanceMongoClient;
        return this.instanceMongoClient.db(nomBase); // retourne une référence à la base de données sélectionnée
      })
      .catch((erreurDeConnexion) => {
        console.log(`Échec de connexion au serveur mongodb`, erreurDeConnexion);
        return erreurDeConnexion;
      });
  }
}

module.exports = OutilMongoDB;
