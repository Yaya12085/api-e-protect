const express = require("express");
const serverless = require("serverless-http");

const router = express.Router();

const api = express();

router.get("/", (req, res) => res.send("Hello World!"));

api.use("/.netlify/functions/", router);

module.exports.handler = serverless(api);
