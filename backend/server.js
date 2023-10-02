const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const port = 5002;

const corsOptions = {
  origin: "http://localhost:3002",
  optionsSuccessStatus: 200, // certaines implémentations d'anciens navigateurs (IE11, divers SmartTVs) ne renvoient pas correctement les codes de statut 204
};

// Connexion à la db
connectDB();

const app = express();

app.use(cors(corsOptions));

// Middleware qui permet de traiter les données de la request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/utilisateur", require("./routes/utilisateur.routes"));
app.use("/livre", require("./routes/livre.routes"));
app.use("/api/v3/book", require("./routes/paydunya.routes"));
app.use("/transaction", require("./routes/transaction.routes"));
app.use("/retrait", require("./routes/retrait.routes"));
app.use("/statistique", require("./routes/statistique.routes"));

// Lancement du server
app.listen(port, () => console.log("Le serveur a démarré au port " + port));
