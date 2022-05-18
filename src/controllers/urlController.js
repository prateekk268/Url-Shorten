const urlModel = require('../models/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid')

// validation checking funcion
const isValid = function(value){
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' || value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function (requestBody){
    return Object.keys(requestBody).length>0
}

const baseUrl = 'http:localhost:3000'



// post / url / shorten

const urlShorten = async function (req,res){
    try {
   const data = req.body
   if(!isValidRequestBody(data)) return res.status(400).send({ status : false , message : "Enter the required fields"})

   if (!validUrl.isUri(baseUrl)) {
    return res.status(401).send({status : false, message :'Invalid base URL'})
}

   let {longUrl} = data

   if(!longUrl) return res.status(400).send({status : false, message : "Enter the longurl data"})

   if(!isValid(longUrl)) return res.status(400).send({status : false, message : "provide the longurl in correct format"})

   if(validUrl.isUri(longUrl)){
   
    let url = await urlModel.findOne({longUrl : longUrl})
    if(url) {
        return res.status(200).send({status : true , message : url} )
    } else {
      
        let generate = shortId.generate();
        let uniqueId = generate.toLowerCase();  

          //checking if the code already exists
          let used = await urlModel.findOne({ urlCode: uniqueId })
          if (used) {
              return res.status(400).send({ status: false, messege: "It seems You Have To Hit The Api Again" });
          }

        
          let shortLink = baseurl + `/` + uniqueId;

          //saving data in database
          data["urlCode"] = uniqueId;
          data["shortUrl"] = shortLink;
          let savedData = await urlModel.create(data);
          return res.status(201).send({
              status: true,
              message: "Data saved Successfully",
              data: savedData,
          });
       }
      } else {
        res.status(400).send({ status : false, message : 'Invalid longUrl'})
    }
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message

        })
    } 
}


//GET /:urlCode

const geturl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        if (!isValid(urlCode)) {
            return res.status(400).send({ status: false, messege: "Please Use A Valid Link" })
        } 
            let findUrl = await urlModel.findOne({ urlCode: urlCode })
            return res.status(200).send({status : true, message : findUrl})
           
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message
        })
    }
}






module.exports.urlShorten = urlShorten
module.exports.geturl = geturl

