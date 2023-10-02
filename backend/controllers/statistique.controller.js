const LivreModel = require("../models/livre.model");
const UtilisateurModel = require("../models/utilisateur.model");
const TransactionModel = require("../models/transaction.model");
const mongoose = require("mongoose");

const getStatistique = (filterBy) => {
  if (filterBy === "month") {
    return [
      {
        name: "Jan",
        total: 0,
      },
      {
        name: "Feb",
        total: 0,
      },
      {
        name: "Mar",
        total: 0,
      },
      {
        name: "Apr",
        total: 0,
      },
      {
        name: "May",
        total: 0,
      },
      {
        name: "Jun",
        total: 0,
      },
      {
        name: "Jul",
        total: 0,
      },
      {
        name: "Aug",
        total: 0,
      },
      {
        name: "Sep",
        total: 0,
      },
      {
        name: "Oct",
        total: 0,
      },
      {
        name: "Nov",
        total: 0,
      },
      {
        name: "Dec",
        total: 0,
      },
    ];
  } else if (filterBy === "day") {
    const daysOfWeek = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    return daysOfWeek.map((day) => ({ name: day, total: 0 }));
  } else if (filterBy === "hours") {
    return Array.from({ length: 24 }, (_, i) => ({
      name: i.toString(),
      total: 0,
    }));
  }
};

module.exports.nombreVenteParAuteur = async (req, res) => {
  try {
    const { filterBy } = req.query;
    const auteurId = req.params.id;
    const graphData = getStatistique(filterBy);

    const auteur = await UtilisateurModel.findById(auteurId);
    const ventes = await TransactionModel.find({
      auteur: new mongoose.Types.ObjectId(auteurId),
      type: "Vente",
      statut: "Succes",
    });

    ventes.forEach((vente) => {
      const date = new Date(vente.date_paiement);

      if (filterBy === "month") {
        const month = date.getMonth();
        graphData[month].total++;
      } else if (filterBy === "day") {
        const dayOfWeek = date.getDay();
        graphData[dayOfWeek].total++;
      } else if (filterBy === "hours") {
        const hours = date.getHours();
        graphData[hours].total++;
      }
    });
    res.json({
      success: true,
      graphData,
    });
  } catch (err) {
    res.status(401).json({ err });
  }
};

module.exports.nombreVenteParLivreParAuteur = async (req, res) => {
  try {
    const { filterBy, livreId } = req.query;
    const auteurId = req.params.id;
    const graphData = getStatistique(filterBy);

    const auteur = await UtilisateurModel.findById(auteurId);
    const livre = await LivreModel.findById(livreId);

    const ventes = await TransactionModel.find({
      auteur: new mongoose.Types.ObjectId(auteurId),
      livre: new mongoose.Types.ObjectId(livreId),
      type: "Vente",
      statut: "Succes",
    });

    // res.json({
    //   ventes,
    //   livre,
    //   auteur,
    // });

    ventes.forEach((vente) => {
      const date = new Date(vente.date_paiement);

      if (filterBy === "month") {
        const month = date.getMonth();
        graphData[month].total++;
      } else if (filterBy === "day") {
        const dayOfWeek = date.getDay();
        graphData[dayOfWeek].total++;
      } else if (filterBy === "hours") {
        const hours = date.getHours();
        graphData[hours].total++;
      }
    });
    res.json({
      success: true,
      graphData,
    });
  } catch (err) {
    res.status(401).json({ err });
  }
};
