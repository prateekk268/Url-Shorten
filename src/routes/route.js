const express = require('express')
const route = express.Router()
const urlController = require('../controllers/urlController')


route.post("/url/shorten", urlController.createUrl)
route.get("/:urlCode", urlController.getUrl )

module.exports = route