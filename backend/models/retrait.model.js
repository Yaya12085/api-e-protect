const mongoose = require("mongoose");
const utilisateur = require("./utilisateur.model");

const retraitSchema = mongoose.Schema(
  {
    auteur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur" },
    date_retrait: { type: Date, required: true },
    montant: { type: Number, required: true },
    moyen_paiement: { type: String, required: true },
    statut: { type: String, required: true },
  },
  {
    timestamps: true, // Met la date exact à laquelle chaque transaction est créé et ausssi editée
  }
);

module.exports = mongoose.model("retrait", retraitSchema);
