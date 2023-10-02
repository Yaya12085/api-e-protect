const UtilisateurModel = require("../models/utilisateur.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
const crypto = require("crypto");

const envoyerEmail = require("../middleware/envoie.mail");

module.exports.loginUtilisateur = async (req, res) => {
  const { email, mdp } = req.body;

  const utilisateur = await UtilisateurModel.findOne({ email });

  if (!email || !mdp) {
    res.send({ message: "Veuillez remplir tous les champs" });
  } else {
    if (utilisateur && (await bcrypt.compare(mdp, utilisateur.mdp))) {
      if (!utilisateur.isValidate) {
        return res.json({
          message:
            "Veuillez patienter 2 jours pour la vérification de votre compte",
        });
      } else {
        if (utilisateur.statusComte === false) {
          return res.json({
            message:
              "Votre compte est bloquer. Veuillez contacter le service client pour plus d'information!",
          });
        } else {
          // Créez un JWT
          jwt.sign(
            { utilisateur },
            secretKey,
            { expiresIn: "1h" },
            (err, token) => {
              if (err) {
                return res
                  .status(500)
                  .json({ message: "Erreur lors de la création du token" });
              }
              return res.json({ token });
            }
          );
        }
      }
    } else {
      return res
        .status(401)
        .json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
    }
  }
};

module.exports.utilisateurInfo = async (req, res) => {
  res.send({
    message: "Ressource protégée. Utilisateur : " + req.user,
  });
};

module.exports.registerUtilisateur = async (req, res) => {
  const { nom, prenom, email, mdp, nationalite, telephone, role, isValidate } =
    req.body;

  // Vérifiez si l'utilisateur existe déjà
  const existUtilisateur = await UtilisateurModel.findOne({ email });

  if (
    !nom ||
    !prenom ||
    !email ||
    !mdp ||
    !nationalite ||
    !telephone ||
    !role
  ) {
    return res.send({ message: "Veuillez remplir tous les champs SVP!" });
  } else {
    if (existUtilisateur) {
      return res.send({ message: "Adresse e-mail déja utilisée !" });
    } else {
      // Hash du mot de passe avant de le stocker
      const hashedPassword = await bcrypt.hash(mdp, 10);

      if (role === "Auteur") {
        // Création d'un nouvel utilisateur dans la bd
        const utilisateur = await UtilisateurModel.create({
          nom,
          prenom,
          email,
          mdp: hashedPassword,
          nationalite,
          telephone,
          role,
          isValidate: false,
          asPaid: false,
          statusCompte: true,
          solde: 0,
          token_reset_password: "",
          token_expiry_date_time: "",
        });

        res.send({
          message:
            "Vous êtes enregistré avec succès! Vous compte sera en cours de vérification sous quelques jours",
          utilisateur,
        });
      } else {
        // Création d'un nouvel utilisateur dans la bd
        const utilisateur = await UtilisateurModel.create({
          nom,
          prenom,
          email,
          mdp: hashedPassword,
          nationalite,
          telephone,
          role,
          isValidate: true,
          asPaid: false,
          statusCompte: true,
          solde: 0,
          token_reset_password: "",
          token_expiry_date_time: "",
        });

        res.send({
          message: "Vous êtes enregistré avec succès",
          utilisateur,
        });
      }
    }
  }
};

module.exports.getUtilisateurs = async (req, res) => {
  const utilisateur = await UtilisateurModel.find();
  res.status(200).json(utilisateur);
};

module.exports.getUtilisateur = async (req, res) => {
  UtilisateurModel.findById(req.params.id)
    .populate("livres")
    .exec()
    .then((utilisateur) => {
      if (!utilisateur) {
        return res.status(404).json({ message: "Père non trouvé" });
      }

      res.status(200).json({
        utilisateur,
      });
    })
    .catch((erreur) => {
      console.error("Erreur lors de la recherche d'utilisateur :", erreur);
      res.status(500).json({
        message: "Utilisateur introuvable",
        erreur: erreur.message,
      });
    });
};

module.exports.editUtilisateur = async (req, res) => {
  const { nom, prenom, email, mdp, nationalite, telephone, role, isValidate } =
    req.body;
  const utilisateur = await UtilisateurModel.findById(req.params.id);
  if (
    !nom ||
    !prenom ||
    !email ||
    !mdp ||
    !nationalite ||
    !telephone ||
    !role ||
    !isValidate
  ) {
    res.status(400).json({
      message: "Veuillez remplir tous les champs",
      utilisateur,
    });
  } else {
    if (!utilisateur) {
      res.status(400).json({ message: "Cet utilisateur n'existe pas!" });
    } else {
      // Hachez le nouveau mot de passe
      bcrypt.hash(mdp, 10, async (err, hash) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Erreur de hachage du mot de passe" });
        } else {
          utilisateur.nom = nom;
          utilisateur.prenom = prenom;
          utilisateur.email = email;
          utilisateur.mdp = hash;
          utilisateur.nationalite = nationalite;
          utilisateur.telephone = telephone;
          utilisateur.role = role;
          utilisateur.isValidate = isValidate;

          const updateUtilisateur = await UtilisateurModel.findByIdAndUpdate(
            utilisateur._id,
            utilisateur,
            { new: true }
          );

          res.status(200).json(updateUtilisateur);
        }
      });
    }
  }
};

module.exports.deleteUtilisateur = async (req, res) => {
  const utilisateur = await UtilisateurModel.findById(req.params.id);

  if (!utilisateur) {
    res.status(400).json({ message: "Ce utilisateur n'existe pas!" });
  } else {
    await UtilisateurModel.findByIdAndRemove(utilisateur);

    res.status(200).json("Utilisateur supprimé!");
  }
};

module.exports.validerCompte = async (req, res) => {
  try {
    const utilisateur = await UtilisateurModel.findById(req.params.id);
    if (utilisateur) {
      utilisateur.isValidate = true;
      utilisateur.statusCompte = true;
      envoyerEmail(
        utilisateur.email,
        "Confirmation de validation de compte",
        `Bonjour ${utilisateur.prenom}. <br>
      Votre compte à été vérifié et approuver. Vous pouvez à présent vous connecter a votre compte auteur sur l'application e-protect`
      );
      const updateUtilisateur = await UtilisateurModel.findByIdAndUpdate(
        utilisateur._id,
        utilisateur,
        { new: true }
      );
      res.status(200).json(updateUtilisateur);
    }
  } catch (err) {
    console.error("Erreur lors de la recherche d'utilisateur :", err);
    res.status(500).json({ message: "Cet utilisateur n'existe pas" });
  }
};

module.exports.refusValidationCompte = async (req, res) => {
  try {
    const utilisateur = await UtilisateurModel.findById(req.params.id);
    if (utilisateur) {
      utilisateur.statusCompte = false;
      envoyerEmail(
        utilisateur.email,
        "Confirmation de validation de compte",
        `Bonjour ${utilisateur.prenom}. <br>
      Votre compte à été vérifié, mais n'a malheureusement pas pu être approuver.`
      );
      const updateUtilisateur = await UtilisateurModel.findByIdAndUpdate(
        utilisateur._id,
        utilisateur,
        { new: true }
      );
      res.status(200).json(updateUtilisateur);
    }
  } catch (err) {
    console.error("Erreur lors de la recherche d'utilisateur :", err);
    res.status(500).json({ message: "Cet utilisateur n'existe pas" });
  }
};

module.exports.bloquerCompte = async (req, res) => {
  try {
    const utilisateur = await UtilisateurModel.findById(req.params.id);
    if (utilisateur) {
      utilisateur.statusCompte = false;
      const updateUtilisateur = await UtilisateurModel.findByIdAndUpdate(
        utilisateur._id,
        utilisateur,
        { new: true }
      );
      res.status(200).json(updateUtilisateur);
    }
  } catch (err) {
    console.error("Erreur lors de la recherche d'utilisateur :", err);
    res.status(500).json({ message: "Cet utilisateur n'existe pas" });
  }
};

module.exports.debloquerCompte = async (req, res) => {
  try {
    const utilisateur = await UtilisateurModel.findById(req.params.id);
    if (utilisateur) {
      utilisateur.statusCompte = true;
      const updateUtilisateur = await UtilisateurModel.findByIdAndUpdate(
        utilisateur._id,
        utilisateur,
        { new: true }
      );
      res.status(200).json(updateUtilisateur);
    }
  } catch (err) {
    console.error("Erreur lors de la recherche d'utilisateur :", err);
    res.status(500).json({ message: "Cet utilisateur n'existe pas" });
  }
};

module.exports.changementRoleUtilisateur = async (req, res) => {
  try {
    const { role } = req.query;
    const utilisateur = await UtilisateurModel.findById(req.params.id);
    if (utilisateur) {
      utilisateur.role = role;
      const updateUtilisateur = await UtilisateurModel.findByIdAndUpdate(
        utilisateur._id,
        utilisateur,
        { new: true }
      );
      res.status(200).json(updateUtilisateur);
    }
  } catch (err) {
    console.error("Erreur lors de la recherche d'utilisateur :", err);
    res.status(500).json({ message: "Cet utilisateur n'existe pas" });
  }
};

module.exports.demandeResetMdp = async (req, res) => {
  const { email } = req.body;

  try {
    // Vérifier si l'utilisateur avec cet e-mail existe
    const utilisateur = await UtilisateurModel.findOne({ email });

    if (!utilisateur) {
      return res
        .status(404)
        .json({ message: "Aucun utilisateur avec cet e-mail n'a été trouvé." });
    }

    // Générer un jeton de réinitialisation de mot de passe
    const token = crypto.randomBytes(20).toString("hex");

    // Enregistrer le jeton dans la base de données avec une expiration
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1); // Le jeton expire dans 1 heure
    utilisateur.token_reset_password = token;
    utilisateur.token_expiry_date_time = expiration;

    await utilisateur.save();

    // Envoyer un e-mail au client avec le lien de réinitialisation
    const resetLink = `https://votre-site.com/reset-password/${token}`;
    envoyerEmail(
      utilisateur.email,
      "Réinitialisation de mot de passe",
      `<html>\n 
        <head>\n 
            <title>Réinitialisation de mot de passe</title>\n 
            <style>\n 
                /* Inclusion de la police personnalisée */\n 
                @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400&display=swap');\n 
            </style>\n 
        </head>\n 
        <body style=\font-family: 'Roboto', Arial, sans-serif;\>\n 
              <div tyle=background-color: #f3f3f3; padding: 100px 200px; text-align: center;\> 
            <table cellpadding=\0\ cellspacing=0 width=100% style=\max-width: 600px; margin: auto; border-collapse: collapse;\>\n 
                <tr>\n 
                    <td style=\background-color: #f3f3f3; padding: 20px; text-align: center;\>\n 
                        <h2 style=\color: #333;\>E-PROTECT</h2>\n 
                    </td>\n 
                </tr>\n 
                <tr>\n 
                    <td style=\padding: 20px;\>\n 
                        <p>Bonjour ${utilisateur.prenom},</p>\n 
                        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Si vous n'avez pas effectué cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>\n 
                        <p>Sinon, vous pouvez réinitialiser votre mot de passe en cliquant sur le bouton ci-dessous :</p>\n 
                        <p style=\text-align: center;\>\n 
                            <a href=\https://votre-site.com/reset-password/${token}  style=\display: inline-block; background-color: #B60520; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\>Réinitialiser le mot de passe</a>\n 
                        </p>\n 
                        <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur ou juste cliquer dessus :</p>\n 
                        <p><a href=\https://votre-site.com/reset-password/${token} \>https://votre-site.com/reset-password/${token}</a></p>\n 
                        <p>Merci,</p>\n 
                        <p>E-protect</p>\n 
                    </td>\n 
                </tr>\n 
            </table>\n 
              </div> 
        </body>\n 
      </html>`
    );
    res.json({
      success: true,
      message: "Lien envoyer avec succès !",
      utilisateur,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la demande de réinitialisation de mot de passe :",
      error
    );
    res.status(500).json({
      message:
        "Une erreur s'est produite lors de la demande de réinitialisation de mot de passe.",
    });
  }
};

module.exports.resetMdp = async (req, res) => {
  const { token } = req.params;
  const { newMdp } = req.body;

  try {
    // Vérifier si le jeton est valide et n'a pas expiré
    const utilisateur = await UtilisateurModel.findOne({
      token_reset_password: token,
    });

    if (!utilisateur) {
      return res.status(400).json({
        message: "Aucun utilisateur n'a été trouvé",
      });
    }

    if (!utilisateur.token_reset_password) {
      return res.status(400).json({
        message:
          "Le jeton de réinitialisation de mot de passe est invalide ou a expiré.",
      });
    }

    if (utilisateur.token_expiry_date_time < new Date()) {
      return res.status(400).json({
        message: "Le jeton de réinitialisation de mot de passe a expiré.",
      });
    }

    const hashedPassword = await bcrypt.hash(newMdp, 10);
    utilisateur.mdp = hashedPassword;
    utilisateur.token_expiry_date_time = "";
    utilisateur.token_reset_password = "";
    await utilisateur.save();

    return res
      .status(200)
      .json({ message: "Mot de passe réinitialisé avec succès.", utilisateur });
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation du mot de passe :",
      error
    );
    res.status(500).json({
      message:
        "Une erreur s'est produite lors de la réinitialisation du mot de passe.",
    });
  }
};
