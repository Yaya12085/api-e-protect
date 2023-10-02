const RetraitModel = require("../models/retrait.model");
const UtilisateurModel = require("../models/utilisateur.model");
const mongoose = require("mongoose");

module.exports.getRetraits = async (req, res) => {
  try {
    RetraitModel.find()
      .populate("auteur")
      .exec()
      .then((retraits) => {
        if (!retraits) {
          return res.status(404).json({ message: "Père non trouvé" });
        }

        res.status(200).json({
          retraits,
        });
      })
      .catch((erreur) => {
        console.error("Erreur lors de la récupération des retraits :", err);
        res
          .status(500)
          .json({ message: "Erreur lors de la récupération des retraits" });
      });
  } catch (err) {
    res.status(401).json({ err });
  }
};

module.exports.getRetrait = async (req, res) => {
  try {
    const retraitId = req.params.id;

    RetraitModel.findById(retraitId)
      .populate("auteur")
      .exec()
      .then((retrait) => {
        if (!retrait) {
          return res.status(404).json({ message: "Retrait non trouvée" });
        }

        res.status(200).json({
          message: "Détails du retrait",
          retrait: retrait,
        });
      })
      .catch((erreur) => {
        console.error("Erreur lors de la récupération du retrait :", erreur);
        res.status(500).json({
          message: "Retrait introuvable.",
          erreur: erreur.message,
        });
      });
  } catch (err) {
    res.status(401).json({ err });
  }
};

module.exports.setRetraits = async (req, res) => {
  try {
    const { auteur, montant, moyen_paiement } = req.body;
    const auteurId = await UtilisateurModel.findById(auteur);
    if (!auteur || !montant || !moyen_paiement) {
      res.json({ message: "Veuillez remplir tous les champs SVP!" });
    } else {
      if (!auteurId) {
        return res.json({ message: "Auteur non trouvé !" });
      }

      if (parseInt(auteurId.solde) < parseInt(montant)) {
        return res.json({
          message: "Le montant du retrait est inférieure à votre solde !",
        });
      }
      auteurId.solde = parseInt(auteurId.solde) - parseInt(montant);
      await UtilisateurModel.findByIdAndUpdate(auteurId._id, auteurId, {
        new: true,
      });

      const retrait = await RetraitModel.create({
        auteur: auteurId,
        date_retrait: new Date().toISOString(),
        montant,
        moyen_paiement,
        statut: "En attente",
      });

      res.send({
        message:
          "Votre retrait à été enregistré avec succès! Nous mènerons quelques vérifications puis publierons votre",
        retrait,
      });
    }
  } catch (err) {
    res.status(401).json({ err });
  }
};

module.exports.getRetraitParAuteur = async (req, res) => {
  try {
    const id = req.params.id;
    const auteur = await UtilisateurModel.findById(id);

    if (!auteur) {
      return res.send({ message: "Auteur introuvable" });
    }

    console.log(auteur);
    const retraits = await RetraitModel.find({
      auteur: new mongoose.Types.ObjectId(id),
    });

    if (retraits.length > 0) {
      console.log(
        `retraits de l'auteur ${auteur.prenom} ${auteur.nom} :`,
        retraits
      );
      res.status(200).json({
        message: `retraits de l'auteur ${auteur.prenom} ${auteur.nom} :`,
        retraits,
      });
    } else {
      res.status(200).json({
        message: `L'auteur ${auteur.prenom} ${auteur.nom} n'a aucune demande de retrait enregistrée.`,
      });
    }
  } catch (err) {
    res.status(401).json({ err });
  }
};

module.exports.changeStatutRetrait = async (req, res) => {
  try {
    const { statut } = req.query;
    const id = req.params.id;
    const retrait = await RetraitModel.findById(id);

    if (!retrait) {
      return res.status(401).json({
        message: `Retrait introuvable`,
      });
    }

    const auteur = await UtilisateurModel.findById(retrait.auteur._id);

    if (!auteur) {
      return res.status(401).json({
        message: `Auteur introuvable`,
      });
    }

    if (!statut) {
      return res.status(401).json({
        message: `Veuillez rentrer un statut SVP!`,
      });
    }

    if (retrait.statut === statut) {
      return res.status(401).json({
        message: `Retrait déjà ${statut}`,
      });
    }

    if (statut === "Annulé") {
      auteur.solde = parseInt(auteur.solde) + parseInt(retrait.montant);
      await auteur.save();
    }

    retrait.statut = statut;
    await retrait.save();
    res.json({
      message: "Statut du retrait changé avec success",
      statut,
      soldeAuteur: auteur.solde,
    });
  } catch (err) {
    res.status(401).json({ err });
  }
};
