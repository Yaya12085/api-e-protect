const express = require("express");
const {
  getTransactions,
  getTransaction,
  setTransaction,
  editTransaction,
  deleteTransaction,
  venteTransaction,
  achatTransaction,
  venteTransactionParAuteur,
  achatTransactionParUtilisateur,
  sommeVente,
  allSommeVente,
} = require("../controllers/transaction.controller");
const router = express.Router();

//Liste de toutes les Transactions
router.get("/", getTransactions);

// Obtenir une Transaction spécifique grace a son ID
// router.get("/:id", getTransaction);

// Enregistrer un Transaction
router.post("/", setTransaction);

// Modification
router.put("/:id", editTransaction);

// Suppression de transaction
router.delete("/:id", deleteTransaction);

// Transactions de vente
router.get("/liste/ventes", venteTransaction);

// Transactions d'achat
router.get("/liste/achats", achatTransaction);

// Transactions de vente par auteur
router.get("/liste/ventes/:id", venteTransactionParAuteur);

// Transactions d'achat par utilisateur, auteur
router.get("/liste/achats/:id", achatTransactionParUtilisateur);

// Somme des ventes par auteur
router.get("/somme-vente/:id", sommeVente);

// Somme des vente de tous les auteurs
router.get("/somme-vente", allSommeVente);

module.exports = router;
