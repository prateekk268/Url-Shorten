const express = require('express') // import express package
const bodyParser = require('body-parser') // import body-parser package
const mongoose = require('mongoose') // import mongoose package
const route = require("./routes/route.js") // import route folder

const app = express() // instatiate the express app


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// declare DataBase string URI and Establishing a database connection

mongoose.connect("mongodb+srv://prateekk268:9H5uc2BUpHihC2id@cluster1.gv5vx.mongodb.net/group71Database?retryWrites=true&w=majority", {useNewUrlParser : true})
.then( () => console.log("MongoDb is connected .."))
.catch( err => console.log(err))


app.use('/', route)

const PORT = process.env.PORT || 3000
// listen for incoming requests 
app.listen(PORT, () => console.log(`server started, listen PORT ${PORT}`))