const urlModel = require('../models/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid')
const redis = require('redis')
const { promisify } = require('util')


// connection to redis 
const redisClient = redis.createClient(
    10137,
    "redis-10137.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);

redisClient.auth("dwGrLG15PVzsppijhg0JnLUgjee5u5V8", function (err) {
    if (err) throw (err)
});

redisClient.on("connect", async function () {
    console.log('Connected to Redis ..');
});

//  connected setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

// validation checking funcion
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' || value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}





// post / url / shorten

const urlShorten = async function (req, res) {
    try {
        let baseUrl = 'http://localhost:3000'
        let data = req.body

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, message: "Enter the required fields" })

        if (!validUrl.isUri(baseUrl)) {
            return res.status(401).send({ status: false, message: 'Invalid base URL' })
        }

        let { longUrl } = data

        if (!longUrl) return res.status(400).send({ status: false, message: "Enter the longurl data" })

        // if (!isValid(longUrl)) return res.status(400).send({ status: false, message: "provide the longurl in correct format" })

        let cachedData = await GET_ASYNC(`${req.body.longUrl}`)
        if (cachedData) {
            let cache = JSON.parse(cachedData)
            return res.status(200).send({ status: true, redisdata: cache })
        }

        if (validUrl.isUri(longUrl)) {

            let url = await urlModel.findOne({ longUrl: longUrl }).select({_id: 0, createdAt: 0, updatedAt : 0, __v : 0})
            if (url) {
                await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(url))
                return res.status(200).send({ status: true, message: url })
            } else {

                let generate = shortid.generate();
                let uniqueId = generate.toLowerCase();

                //checking if the code already exists
                let used = await urlModel.findOne({ urlCode: uniqueId })
                if (used) {
                    return res.status(400).send({ status: false, messege: "It seems You Have To Hit The Api Again" });
                }


                let shortLink = baseUrl + `/` + uniqueId;

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
            res.status(400).send({ status: false, message: 'Invalid longUrl' })
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
        if (!urlCode) return res.status(400).send({ status: false, msg: "urlcode is required" })
        
        if (!isValid(urlCode)) {
            // return res.status(400).send({ status: false, messege: "Please Use A Valid Link" })
        } else {
            let cachedData = await GET_ASYNC(`${req.params.urlCode}`)
            if (cachedData) {
                let cache = JSON.parse(cachedData)
                return res.status(302).redirect(cache.longUrl)
            }
        }
        let findUrl = await urlModel.findOne({ urlCode: urlCode })
        if (findUrl) {
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(findUrl))
            return res.status(302).redirect(findUrl.longUrl)
        }
        return res.status(404).send({ status: true, message: "cannot find the thing" })

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

