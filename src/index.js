require('dotenv').config()
const cheerio = require('cheerio')

const getRawBody = require('./utils/getRawBody')

const getData = async () => {
    try {
        const html = await getRawBody(process.env.DATA_BASE_URL)
        const $ = cheerio.load(html)

        console.log($)
    } catch(e) {
        if(e.statusCode === 500) {
            console.log("Cannot load data")
        } else {
            console.log("Error: ", e)
        }
    }
}

getData()