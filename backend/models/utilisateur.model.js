const mongoose = require("mongoose");

const utilisateurSchema = mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true },
    mdp: { type: String, required: true },
    nationalite: { type: String, required: true },
    telephone: { type: String, required: true },
    role: { type: String, required: true },
    isValidate: { type: Boolean, required: false },
    asPaid: { type: Boolean, required: false },
    statusCompte: { type: Boolean, required: false },
    livres: [{ type: mongoose.Schema.Types.ObjectId, ref: "livre" }],
    favoris: { type: [String] },
    solde: { type: Number, required: true },
    token_reset_password: { type: String, required: false },
    token_expiry_date_time: { type: Date, required: false },
  },
  {
    timestamps: true, // Met la date exact à laquelle chaque apprenant est créé t ausssi editée
  }
);

module.exports = mongoose.model("utilisateur", utilisateurSchema);
