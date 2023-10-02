const express = require("express");
const {
  payDunyaConfig,
  checkPaiement,
  initialise,
} = require("../controllers/paydunya.controller");
const router = express.Router();

router.get("/", payDunyaConfig);

router.get("/callback", checkPaiement);

router.post("/initialise", initialise);

module.exports = router;
