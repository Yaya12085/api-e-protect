const express = require("express");
const {
  getLivres,
  getLivre,
  getLivreParAuteur,
  setLivres,
  editLivre,
  deleteLivre,
  recherche,
  likeLivre,
  disLikeLivre,
  evaluerLivre,
  nombreLecture,
} = require("../controllers/livre.controller");
const router = express.Router();

const upload = require("../middleware/uploads");
const verifyToken = require("../middleware/verify.token");

//Liste de tous les livres
router.get("/liste", getLivres);

//Effectuer une recherche
router.get("/recherche", recherche);

// Obtenir un livre spécifique grace a son ID
router.get("/:id", getLivre);

// Obtenir la liste des livres d'auteur grâce à son ID
router.get("/liste-livre-par-auteur/:id", getLivreParAuteur);

// Enregistrer un livre
router.post("/enregistrer", upload.single("contenu"), setLivres);

//Modifier livre
router.put("/:id", editLivre);

//Supprimer livre
router.delete("/:id", deleteLivre);

// Mettre en favoris un livre avec l'id de l'utilisateur en paramètre
router.patch("/like-livre/:id", likeLivre);

// Enlever en favoris un livre avec l'id de l'utilisateur en paramètre
router.patch("/dislike-livre/:id", disLikeLivre);

// Evaluer un livre (note, commentaire)
router.post("/evaluations/:id", verifyToken, evaluerLivre);

// Nombre de lecture par livre
router.post("/nombre-lecture/:id", nombreLecture);

module.exports = router;
