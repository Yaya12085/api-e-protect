const mongoose = require("mongoose");
const utilisateur = require("./utilisateur.model");
const livre = require("./livre.model");

const transactionSchema = mongoose.Schema(
  {
    date_paiement: { type: Date, required: true },
    auteur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur" },
    livre: { type: mongoose.Schema.Types.ObjectId, ref: "livre" },
    type: { type: String, required: true },
    montant: { type: Number, required: true },
    statut: { type: String, required: true },
  },
  {
    timestamps: true, // Met la date exact à laquelle chaque transaction est créé et ausssi editée
  }
);

module.exports = mongoose.model("transaction", transactionSchema);
