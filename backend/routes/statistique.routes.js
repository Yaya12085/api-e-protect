const express = require("express");
const {
  nombreVenteParAuteur,
  nombreVenteParLivreParAuteur,
} = require("../controllers/statistique.controller");
const router = express.Router();

//Liste des Statistiques de vente par auteur
router.get("/nombre-vente-par-auteur/:id", nombreVenteParAuteur);

//Liste des Statistiques de vente de chaque livre par auteur
router.get("/nombre-vente-par-livre/:id", nombreVenteParLivreParAuteur);

module.exports = router;
