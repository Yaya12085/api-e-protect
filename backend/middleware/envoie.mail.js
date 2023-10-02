const nodemailer = require("nodemailer");

// Fonction d'envoi d'e-mail
async function envoyerEmail(destinataire, sujet, contenu) {
  // Créez un transporteur de messagerie
  const transporteur = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "konetryphene20@gmail.com",
      pass: "ynnncujadkbvhdlu",
    },
    tls: {
      rejectUnauthorized: false, // Ignorer les erreurs de certificat
    },
  });

  // Configurez l'e-mail
  const options = {
    from: "konetryphene20@gmail.com", // Votre adresse e-mail
    to: destinataire, // Adresse e-mail du destinataire
    subject: sujet, // Sujet de l'e-mail
    html: contenu, // Contenu de l'e-mail au format texte
    // Vous pouvez également utiliser 'html' pour le contenu au format HTML
  };

  // Envoyez l'e-mail
  try {
    const info = await transporteur.sendMail(options);
    console.log("E-mail envoyé :", info.response);
  } catch (erreur) {
    console.error("Erreur lors de l'envoi de l'e-mail :", erreur);
  }
}

module.exports = envoyerEmail;
