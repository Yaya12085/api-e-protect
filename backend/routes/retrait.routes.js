const express = require("express");
const {
  getRetraits,
  getRetrait,
  getRetraitParAuteur,
  setRetraits,
  changeStatutRetrait,
} = require("../controllers/retrait.controller");
const router = express.Router();

const verifyToken = require("../middleware/verify.token");

// Liste de tous les retraits
router.get("/", getRetraits);

// Obtenir un retrait par son ID
router.get("/:id", getRetrait);

// Enregistrer un retrait
router.post("/", setRetraits);

// Liste des retraits par auteur
router.get("/retrait-par-auteur/:id", getRetraitParAuteur);

// Changer le statut d'un retrait
router.put("/statut-retrait/:id", changeStatutRetrait);

module.exports = router;
