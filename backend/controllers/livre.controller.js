const LivreModel = require("../models/livre.model");
const UtilisateurModel = require("../models/utilisateur.model");
const mongoose = require("mongoose");

module.exports.getLivres = async (req, res) => {
  try {
    const livres = await LivreModel.find();

    // Calcul de la moyenne pour chaque livre
    const livresAvecNoteMoyenne = livres
      .sort((a, b) => b.calculerNoteMoyenne() - a.calculerNoteMoyenne())
      .map((livre) => {
        const noteMoyenne = livre.calculerNoteMoyenne();
        return {
          ...livre.toObject(), // Convertir l'objet Mongoose en objet JavaScript
          noteMoyenne: noteMoyenne,
        };
      });

    res.status(200).json({ livres: livresAvecNoteMoyenne });
  } catch (err) {
    console.error("Erreur lors de la récupération des livres :", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des livres" });
  }
};

module.exports.getLivre = async (req, res) => {
  const livreId = req.params.id;

  LivreModel.findById(livreId)
    .populate("auteur") // La méthode populate permet de charger les données de l'auteur
    .exec()
    .then((livre) => {
      if (!livre) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      res.status(200).json({
        message: "Détails du livre",
        livre: livre,
        noteMoyenne: livre.calculerNoteMoyenne(),
      });
    })
    .catch((erreur) => {
      console.error("Erreur lors de la récupération du livre :", erreur);
      res.status(500).json({
        message: "Livre inouvable.",
        erreur: erreur.message,
      });
    });
};

module.exports.recherche = async (req, res) => {
  try {
    const { q } = req.query;

    const query = {};

    if (q) {
      // Recherche par nom ou prénom d'auteur
      const auteurRecherche = await UtilisateurModel.findOne({
        $or: [{ nom: new RegExp(q, "i") }, { prenom: new RegExp(q, "i") }],
      });

      if (auteurRecherche) {
        console.log(auteurRecherche);
        query.auteur = new mongoose.Types.ObjectId(auteurRecherche._id);
      } else {
        // Utilisation d'une expression régulière insensible à la casse pour rechercher le texte dans les champs pertinents
        query.$or = [
          { categorie: new RegExp(q, "i") },
          { titre: new RegExp(q, "i") },
          { description: new RegExp(q, "i") },
        ];
      }
    }

    const livres = await LivreModel.find(query);
    if (livres.length > 0) {
      res.status(200).json({ livres });
    } else {
      //   res.status(401).json({ message: "Aucun resultat" });
      res.json({ message: "Aucun resultat" });
    }
  } catch (err) {
    console.error("Erreur lors de la recherche des livres :", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche des livres." });
  }
};

// module.exports.recherche = async (req, res) => {
//   try {
//     const { categorie, nom, prenom, motcle } = req.query;

//     // Construisez la requête en fonction des critères de recherche
//     const query = {};
//     if (categorie) {
//       query.categorie = new RegExp(categorie, "i");
//     }
//     if (nom) {
//       const auteur = await UtilisateurModel.findOne({
//         nom: new RegExp(nom, "i"),
//       });
//       if (auteur) {
//         console.log(auteur);
//         query.auteur = auteur._id;
//       }
//     }
//     if (prenom) {
//   const auteur = await UtilisateurModel.findOne({
//     prenom: new RegExp(prenom, "i"),
//   });
//   if (auteur) {
//     console.log(auteur);
//     query.auteur = auteur._id;
//   }
//     }
//     if (nom && prenom) {
//       const auteur = await UtilisateurModel.findOne({
//         nom: new RegExp(nom, "i"),
//         prenom: new RegExp(prenom, "i"),
//       });
//       if (auteur) {
//         console.log(auteur);
//         query.auteur = auteur._id;
//       }
//     }
//     if (motcle) {
//       // Utilisez une expression régulière pour rechercher le mot-clé dans les champs pertinents
//       query.$or = [
//         { titre: new RegExp(motcle, "i") }, // Recherche insensible à la casse dans le titre
//         { description: new RegExp(motcle, "i") }, // Recherche insensible à la casse dans la description
//       ];
//     }

//     // Exécutez la recherche en fonction de la requête
//     const livres = await LivreModel.find(query);

//     res.status(200).json({ livres });
//   } catch (err) {
//     console.error("Erreur lors de la recherche des livres :", err);
//     res
//       .status(500)
//       .json({ message: "Erreur lors de la recherche des livres." });
//   }
// };

module.exports.getLivreParAuteur = async (req, res) => {
  try {
    const id = req.params.id;
    const livres = await LivreModel.find({
      auteur: new mongoose.Types.ObjectId(id),
    });

    if (livres.length > 0) {
      console.log("Livres de l'auteur :", livres);
      res.status(200).json(livres);
    } else {
      res.status(200).json({ message: "L'auteur n'a aucun livre enregistré." });
    }
  } catch (err) {
    console.error("Erreur lors de la recherche des livres :", err);
    res.status(500).json({ message: "Auteur Introuvable" });
  }
};

module.exports.setLivres = async (req, res) => {
  const { titre, auteur, contenu, description, prix, categorie, isValid } =
    req.body;

  const existLivre = await LivreModel.findOne({ titre, auteur });
  const utilisateurId = await UtilisateurModel.findById(auteur);

  const file = req.file;
  console.log("flie");

  console.log(file);

  if (!titre || !auteur || !description || !file || !prix || !categorie) {
    return res.status(401).json({
      message: "Veuillez remplir tous les champs SVP!",
      titre,
      auteur,
      description,
      prix,
      categorie,
      file,
    });
  } else {
    if (existLivre) {
      return res.status(401).json({ message: "Ce livre existe déjà." });
    } else {
      console.log(utilisateurId);

      if (!utilisateurId) {
        return res.json({ message: "Père introuvable" });
      }

      if (file) {
        // Création d'un nouveau dans la bd
        const livre = await LivreModel.create({
          titre,
          auteur: utilisateurId,
          contenu: file.path,
          description,
          prix,
          categorie,
          isValid: false,
          nombreLecture: 0,
        });

        await UtilisateurModel.findByIdAndUpdate(
          utilisateurId._id, // Utilisez _id pour mettre à jour l'utilisateur spécifique
          { $addToSet: { livres: livre } },
          { new: true }
        );

        res.send({
          message:
            "Votre livre à été enregistré avec succès! Nous mènerons quelques vérifications puis publierons votre",
          livre,
        });
      }
    }
  }
};

module.exports.editLivre = async (req, res) => {
  const livre = await LivreModel.findById(req.params.id);
  console.log(livre);
  if (!livre) {
    res.status(400).json({ message: "Ce livre n'existe pas!" });
  } else {
    const updateLivre = await LivreModel.findByIdAndUpdate(livre, req.body, {
      new: true,
    });

    res.status(200).json(updateLivre);
  }
};

module.exports.deleteLivre = async (req, res) => {
  const livre = await LivreModel.findById(req.params.id);

  if (!livre) {
    res.status(400).json({ message: "Ce livre n'existe pas!" });
  } else {
    await LivreModel.findByIdAndRemove(livre);

    res.status(200).json("Livre supprimé!");
  }
};

module.exports.likeLivre = async (req, res) => {
  try {
    await UtilisateurModel.findByIdAndUpdate(
      req.params.id, // Utilisez _id pour mettre à jour l'utilisateur spécifique
      { $addToSet: { favoris: req.body.livreId } },
      { new: true }
    ).then((data) => {
      res.status(200).json({ message: "Livre ajouté à mes favoris.", data });
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

module.exports.disLikeLivre = async (req, res) => {
  try {
    await UtilisateurModel.findByIdAndUpdate(
      req.params.id, // Utilisez _id pour mettre à jour l'utilisateur spécifique
      { $pull: { favoris: req.body.livreId } },
      { new: true }
    ).then((data) => {
      res.status(200).json({ message: "Livre enlevé de mes favoris.", data });
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

module.exports.nombreLecture = async (req, res) => {
  try {
    const livre = await LivreModel.findById(req.params.id);
    if (!livre) {
      return res.status(401).json({ message: "Le livre n'existe pas" });
    }

    livre.nombreLecture = parseInt(livre.nombreLecture) + 1;
    await livre.save();

    res.json({ message: "Nombre ajouté", success: true, livre });
  } catch (err) {
    console.error("Erreur lors de l'ajout du nombre :", err);
    res.status(500).json({ message: "Erreur lors de l'ajout du nombre" });
  }
};

module.exports.evaluerLivre = async (req, res) => {
  try {
    const { note, commentaire } = req.body;
    const utilisateurId = req.user;

    const livre = await LivreModel.findById(req.params.id);

    if (!livre) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    if (!note || !commentaire) {
      return res
        .status(404)
        .json({ message: "Veuillez rentrer une note et un commentatire svp!" });
    }

    livre.evaluations.push({
      utilisateur: utilisateurId,
      note: note,
      commentaire: commentaire,
    });

    await livre.save();

    res.status(200).json({ message: "Évaluation ajoutée avec succès" });
  } catch (err) {
    console.error("Erreur lors de l'ajout de l'évaluation :", err);
    res.status(500).json({ message: "Erreur lors de l'ajout de l'évaluation" });
  }
};
