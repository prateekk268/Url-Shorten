const express = require('express')
const route = express.Router()
const urlController = require('../controllers/urlController')


route.post("/url/shorten", urlController.urlShorten)
route.get("/:urlCode", urlController.geturl )

module.exports = route