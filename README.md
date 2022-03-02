<h1>Bienvenue A qui veut gagner de l'argent en masse</h1>
<p>Le principe est simple. Vous devez répondre à 10 questions de type QCM sur la culture générale, le JS et un peu de tout...
Pour cela, vous devez lancer le jeu sur https://jerome-app.herokuapp.com/
Le jeu est <strong>limité à deux joueurs</strong>. Dès qu'un joueur se connecte, un message lui indique qu'il doit attendre un autre joueur pour jouer en temps réel.
Dès qu'un deuxième joueur se connecte, vous pouvez jouer. Que le meilleur gagne!
</p>
<p>Si vous n'êtes pas inscrit, créez-vous un profil avec <strong>un Pseudonyme, un mot de passe et la couleur de votre avatar (4 possibles)</strong>. Une fois connecté(e), vous pourrez voir le tableau des scores de tous les participants par ordre décroissant avec le nombre de points, la date d'inscription et le nombre de minutes connectés au jeu.</p>
<p>Le jeu a été fait en PUG, css et JS. J'ai utilisé socket.io pour le jeu en temps réel et <strong>Mongo Cloud Atlas </strong>pour sauvegarder les données des joueurs: <strong>pseudonyme, mot de passe crypté, date d'inscription, score maximum (uniquement), durée de jeu (cumulée)</strong>.
Les variables d'environnement sont dans le <strong>fichier .env</strong>. Si vous installez le jeu en local alors vous devez juste vous placer à la racine du jeu (là où est le README.md), faire <code>npm i</code>
Puis changer les <strong>urls heroku par localhost</strong> si vous voulez le tester en local.
<code>npm start</code>, vous permettra de lancer le jeu en localhost.</p>
<p>Source pour les questions: Alsacréations</p>
<p>Pour le code: Node, Stackoverflow, MDN et Socket.io</p>
