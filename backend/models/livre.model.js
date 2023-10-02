const mongoose = require("mongoose");
const utilisateur = require("./utilisateur.model");

const livreSchema = mongoose.Schema(
  {
    titre: { type: String, required: true },
    auteur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateur" },
    contenu: { type: String, required: true },
    description: { type: String, required: true },
    prix: { type: String, required: true },
    categorie: { type: String, required: true },
    isValid: { type: Boolean, required: true },
    evaluations: [
      {
        utilisateur: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Utilisateur",
        },
        note: Number,
        commentaire: String,
      },
    ],
    nombreLecture: { type: Number, required: false },
  },
  {
    timestamps: true, // Met la date exact à laquelle chaque apprenant est créé t ausssi editée
  }
);

livreSchema.methods.calculerNoteMoyenne = function () {
  if (this.evaluations.length === 0) {
    return 0; // Aucune évaluation, note moyenne de 0
  }
  const totalNotes = this.evaluations.reduce(
    (acc, evaluation) => acc + evaluation.note,
    0
  );
  return totalNotes / this.evaluations.length;
};

module.exports = mongoose.model("livre", livreSchema);
