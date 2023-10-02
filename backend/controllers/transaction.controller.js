const TransactionModel = require("../models/transaction.model");
const LivreModel = require("../models/livre.model");
const UtilisateurModel = require("../models/utilisateur.model");
const mongoose = require("mongoose");

module.exports.getTransactions = async (req, res) => {
  TransactionModel.find()
    .populate("auteur")
    .populate("client")
    .populate("livre")
    .exec()
    .then((transactions) => {
      if (!transactions) {
        return res.status(404).json({ message: "Père non trouvé" });
      }

      res.status(200).json({
        transactions,
      });
    })
    .catch((erreur) => {
      console.error("Erreur lors de la récupération des transactions :", err);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des transactions" });
    });
};

module.exports.getTransaction = async (req, res) => {
  const transactionId = req.params.id;

  TransactionModel.findById(transactionId)
    .populate("auteur")
    .populate("client")
    .populate("livre")
    .exec()
    .then((transaction) => {
      if (!transaction) {
        return res.status(404).json({ message: "Transaction non trouvée" });
      }

      res.status(200).json({
        message: "Détails de la transaction",
        transaction: transaction,
      });
    })
    .catch((erreur) => {
      console.error(
        "Erreur lors de la récupération de la transaction :",
        erreur
      );
      res.status(500).json({
        message: "Transaction introuvable.",
        erreur: erreur.message,
      });
    });
};

module.exports.setTransaction = async (req, res) => {
  try {
    const { auteur, client, livre, type, montant, statut } = req.body;

    const clientId = await UtilisateurModel.findById(client);
    const auteurId = await UtilisateurModel.findById(auteur);
    const livreId = await LivreModel.findById(livre);

    if (!auteur || !client || !livre || !montant || !statut) {
      return res
        .status(401)
        .json({ message: "Veuillez remplir tous les champs !" });
    }

    if (!clientId || !auteurId || !livreId) {
      return res.status(401).json({ message: "Propriété manquante" });
    }

    // Création d'un tableau de transactions
    const transactions = [
      {
        date_paiement: new Date().toISOString(),
        auteur: auteurId,
        client: clientId,
        livre: livreId,
        type: "Vente",
        montant: parseInt(montant),
        statut, // Utilisez la casse correcte ici
      },
      {
        date_paiement: new Date().toISOString(),
        auteur: auteurId,
        client: clientId,
        livre: livreId,
        type: "Achat",
        montant: parseInt(montant),
        statut,
      },
    ];

    if (statut === "Succes") {
      auteurId.solde =
        parseInt(auteurId.solde) +
        (parseInt(montant) - parseInt(montant) * 0.04);
    }

    await UtilisateurModel.findByIdAndUpdate(auteurId._id, auteurId, {
      new: true,
    });

    TransactionModel.insertMany(transactions)
      .then((transaction) => {
        console.log("Transactions insérées avec succès :", transaction);
        res.status(200).json({
          message: "Transactions insérées avec succès",
          transactions: transaction,
        });
      })
      .catch((erreur) => {
        console.error("Erreur lors de l'insertion des transactions :", erreur);
        res.status(500).json({
          message: "Erreur lors de l'insertion des transactions",
          erreur: erreur.message,
        });
      });
  } catch (err) {
    res.status(401).json(err);
  }
};

module.exports.editTransaction = async (req, res) => {
  try {
  } catch (err) {
    res.status(401).json(err);
  }
};

module.exports.deleteTransaction = async (req, res) => {
  try {
  } catch (err) {
    res.status(401).json(err);
  }
};

module.exports.venteTransaction = async (req, res) => {
  TransactionModel.find({ type: "Vente" })
    .populate("auteur")
    .populate("client")
    .populate("livre")
    .exec()
    .then((ventes) => {
      if (ventes.length === 0) {
        return res.status(404).json({
          message: "Aucune transaction de vente trouvée",
        });
      }

      res.status(200).json({ ventes: ventes });
    })
    .catch((erreur) => {
      console.error("Erreur lors de la récupération des ventes", erreur);
      res.status(500).json({
        message: "Erreur lors de la récupération des ventes",
        erreur: erreur.message,
      });
    });
};

module.exports.achatTransaction = async (req, res) => {
  TransactionModel.find({ type: "Achat" })
    .populate("auteur")
    .populate("client")
    .populate("livre")
    .exec()
    .then((achats) => {
      if (achats.length === 0) {
        return res.status(404).json({
          message: "Aucun transaction trouvée avec le statut spécifié",
        });
      }

      res.status(200).json({ achats: achats });
    })
    .catch((erreur) => {
      console.error("Erreur lors de la récupération des achats :", erreur);
      res.status(500).json({
        message: "Erreur lors de la récupération des achats",
        erreur: erreur.message,
      });
    });
};

module.exports.venteTransactionParAuteur = async (req, res) => {
  try {
    const id = req.params.id;
    const auteur = await UtilisateurModel.findById(id);

    await TransactionModel.find({
      auteur: new mongoose.Types.ObjectId(id),
      type: "Vente",
    })
      .populate("auteur")
      .populate("client")
      .populate("livre")
      .exec()
      .then((ventes) => {
        if (ventes.length === 0) {
          return res.status(404).json({
            message: `Aucune transaction de vente trouvée pour l'${auteur.role} ${auteur.prenom} ${auteur.nom}`,
          });
        }

        res.status(200).json({ ventes, nombre: ventes.length });
      })
      .catch((erreur) => {
        console.error("Erreur lors de la récupération des ventes :", erreur);
        res.status(500).json({
          message: "Erreur lors de la récupération des ventes",
          erreur: erreur.message,
        });
      });
  } catch (err) {
    res.status(401).json({ message: "Auteur non trouvé !", err });
  }
};

module.exports.achatTransactionParUtilisateur = async (req, res) => {
  try {
    const id = req.params.id;
    const auteur = await UtilisateurModel.findById(id);

    await TransactionModel.find({
      client: new mongoose.Types.ObjectId(id),
      type: "Achat",
    })
      .populate("auteur")
      .populate("client")
      .populate("livre")
      .exec()
      .then((achats) => {
        if (achats.length === 0) {
          return res.status(404).json({
            message: `Aucune transaction d'achat trouvée pour l'${auteur.role} ${auteur.prenom} ${auteur.nom}`,
          });
        }

        res.status(200).json({ achats, nombre: achats.length });
      })
      .catch((erreur) => {
        console.error("Erreur lors de la récupération des achats :", erreur);
        res.status(500).json({
          message: "Erreur lors de la récupération des achats",
          erreur: erreur.message,
        });
      });
  } catch (err) {
    res.status(401).json({ message: "Auteur non trouvé !", err });
  }
};

module.exports.sommeVente = async (req, res) => {
  try {
    const auteur = await UtilisateurModel.findById(req.params.id);
    if (!auteur) {
      return res.status(500).json({ message: "Auteur non trouvé !" });
    }
    TransactionModel.aggregate([
      {
        $match: {
          type: "Vente",
          auteur: new mongoose.Types.ObjectId(req.params.id),
          statut: "Succes",
        },
      },
      {
        $group: {
          _id: null, // Pour obtenir une seule ligne de résultat
          totalMontantVente: { $sum: "$montant" },
        },
      },
    ])
      .then((resultats) => {
        if (resultats.length === 0) {
          return res.status(404).json({
            auteurId: req.params.id,
            totalMontantVente: 0,
            auteur: auteur.nom + " " + auteur.prenom,
          });
        }

        const totalMontantVente = resultats[0].totalMontantVente;

        res.status(200).json({
          auteurId: req.params.id,
          totalMontantVente: totalMontantVente,
          auteur: auteur.nom + " " + auteur.prenom,
        });
      })
      .catch((erreur) => {
        console.error(
          "Erreur lors du calcul du total des montants de vente pour l'auteur :",
          erreur
        );
        res.status(500).json({
          message:
            "Erreur lors du calcul du total des montants de vente pour l'auteur",
          erreur: erreur.message,
        });
      });
  } catch (err) {
    res.status(401).json({ message: "Auteur non trouvé !", err });
  }
};

module.exports.allSommeVente = async (req, res) => {
  // Obtenez la somme des montants de vente pour chaque auteur
  const montantsVenteParAuteur = await TransactionModel.aggregate([
    {
      $match: { type: "Vente", statut: "Succes" }, // Filtrer uniquement les transactions de type "vente"
    },
    {
      $group: {
        _id: "$auteur",
        totalMontantVente: { $sum: "$montant" },
      },
    },
  ]);

  // Obtenez tous les auteurs
  const tousLesAuteurs = await UtilisateurModel.find(
    { role: "Auteur" },
    { _id: 1, nom: 1, prenom: 1 }
  );

  const resultatsFinaux = [];

  // Parcour de tous les auteurs et fusion des montants de vente correspondants
  tousLesAuteurs.forEach((auteur) => {
    const montantVenteAuteur = montantsVenteParAuteur.find((item) =>
      item._id.equals(auteur._id)
    );
    const totalMontantVente = montantVenteAuteur
      ? montantVenteAuteur.totalMontantVente
      : 0;

    resultatsFinaux.push({
      _id: auteur._id,
      auteur: auteur.nom + " " + auteur.prenom,
      totalMontantVente: totalMontantVente,
    });
  });

  res.status(200).json({ resultats: resultatsFinaux });
};
