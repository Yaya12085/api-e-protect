const multer = require("multer");
const path = require("path");

const MIME_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const cheminRelatif = "../uploads/livres/";
    callback(null, path.resolve(__dirname, cheminRelatif));
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    // callback(null, name + Date.now() + "." + extension);
    // callback(null, new Date().getDate() +"_"+ new Date().getMonth() +"_"+ new Date().getFullYear() +"_"+ new Date().getHours() +":"+ new Date().getMinutes()+":"+ new Date().getSeconds() + name);
    callback(null, Date.now() + "_" + name);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (MIME_TYPES[file.mimetype]) {
      callback(null, true);
    } else {
      console.log("Que les fichier Word et pdf sont autorisés");
      console.log(MIME_TYPES[file.mimetype]);
      callback(null, false);
    }
  },
  //   limits: {
  //     fileSize: 1024 * 1024 * 2,
  //   },
});

module.exports = upload;
