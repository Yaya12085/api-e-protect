// const { response } = require("express");
// const { default: mongoose } = require("mongoose");
const paydunya = require("paydunya");
const LivreModel = require("../models/livre.model");
const UtilisateurModel = require("../models/utilisateur.model");

module.exports.payDunyaConfig = async (req, res, next) => {
  try {
    const { nom, prenom } = req.query;

    const setup = new paydunya.Setup({
      masterKey: process.env.PAYDUNYA_MASTER_KEY,
      privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
      publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
      token: process.env.PAYDUNYA_TOKEN,
      mode: "test",
    });

    // Configuration des informations de votre service/entreprise
    const store = new paydunya.Store({
      name: prenom + " " + nom, // Seul le nom est requis
      //   tagline: "L'élégance n'a pas de prix",
      websiteURL: process.env.URL,
      // logoURL: "http://www.chez-sandra.sn/logo.png",
      cancelURL: `${process.env.SERVER_URL}/api/v3/book/callback`,
      returnURL: `${process.env.SERVER_URL}/api/v3/book/callback`,
    });

    return new paydunya.CheckoutInvoice(setup, store);
  } catch (err) {
    console.error("Failed to create PayDunya invoice", err);
  }
};

module.exports.initialise = async (req, res, next) => {
  let invoice = payDunyaConfig();

  const { id } = req.query;
  const profile = req.user;

  const livre = await LivreModel.findById({ id });

  if (!livre) {
    return res.status(401).json({ message: "Livre indisponible" });
  }

  invoice.addItem("Achat de livre", 1, livre.prix);
  invoice.totalAmount = parseFloat(livre.prix);
  invoice.addCustomData("userId", profile);

  try {
    invoice
      .create()
      .then(() => {
        return res.send({
          success: true,
          message: "Paiement initié. Vous allez être redirigé !",
          url: invoice.url,
        });
      })
      .catch((err) => {
        next({
          success: false,
          message:
            "Une erreur s'est produite avec l'initialisation du paiement",
        });
        return;
      });
  } catch (error) {
    next(error);
  }
};

module.exports.checkPaiement = async (req, res, next) => {
  let invoice = payDunyaConfig();

  const { token } = req.query;

  invoice.confirm(token).then(async (response) => {
    const { status, customData } = invoice;
    const isValid = mongoose.Types.ObjectId.isValid(customData.userId);
    if (!isValid) {
      return res.send({ isValid: false });
    }

    const user = await UtilisateurModel.findById(customData.userId);
    if (!user) {
      return res.send({ user: false });
    }

    let message =
      "Une erreur lors de la validation de votre achat. Veuillez réessayer ou contacter l'assistance pour obtenir de l'aide.";

    if (status === "Completed") {
      user.asPaid = true;
      //On doit récupérer l'id du téléphone
      //   user.phoneId = customData.deviceId;
      await UtilisateurModel.findByIdAndUpdate(user._id, user, { new: true });
      res.send({ urlVerif: "api/v3/book/verified" });
      //   envoyer un push sur le telephone
      await sendOneNotificationPush({
        title: "AChat Réussi",
        body: "Merci de votre achat et bonne lecture.",
        user: customData.userId,
      });
      await sendConfirmationEmail({
        email: user.email,
        subject: "Confirmation de paiement",
        title: "AChat Réussi",
        message: "Bonne lecture",
        otp: "+2250748156488",
      });
      await sendGroupLink({
        email: user.email,
      });
    } else {
      res.send({ message });
      await sendOneNotificationPush({
        title: "Achat échoué",
        body: message,
        user: customData.userId,
      });
      await sendConfirmationEmail({
        email: user.email,
        subject: "Confirmation de paiement",
        title: "Achat échoué",
        message: "Achat échoué",
        otp: "+2250748156488",
      });
    }
  });
};
