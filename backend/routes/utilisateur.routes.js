const express = require("express");
const {
  getUtilisateurs,
  getUtilisateur,
  editUtilisateur,
  deleteUtilisateur,
  registerUtilisateur,
  loginUtilisateur,
  utilisateurInfo,
  validerCompte,
  refusValidationCompte,
  bloquerCompte,
  debloquerCompte,
  changementRoleUtilisateur,
  demandeResetMdp,
  resetMdp,
} = require("../controllers/utilisateur.controller");
const router = express.Router();

const verifyToken = require("../middleware/verify.token");

//Liste de tous les utilisateurs
router.get("/", getUtilisateurs);

// Enregistrer un utilisateur
router.post("/register", registerUtilisateur);

// Connexion
router.post("/login", loginUtilisateur);

// Récupération de l'utilisateur connecté
router.get("/user", verifyToken, utilisateurInfo);

// Obtenir un utilisateur spécifique grace a son ID
router.get("/:id", getUtilisateur);

// Modification d'un utilisateur
router.put("/:id", editUtilisateur);

// Validation d'un compte auteur
router.put("/valider-compte/:id", validerCompte);

// Refus de validation d'un compte auteur
router.put("/refus-validation-compte/:id", refusValidationCompte);

// Bloquer un compte utilisateur
router.put("/bloquer-compte/:id", bloquerCompte);

// Débloquer un compte utilisateur
router.put("/debloquer-compte/:id", debloquerCompte);

// Changement role utilisateur
router.put("/role-utilisateur/:id", changementRoleUtilisateur);

// Demande reinitialisation
router.post("/reset-password", demandeResetMdp);

// Reinitialisation
router.post("/reset-password/:token", resetMdp);

// Suppression d'utilisateur
router.delete("/:id", deleteUtilisateur);

module.exports = router;
