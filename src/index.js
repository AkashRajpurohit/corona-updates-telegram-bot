require('dotenv').config()
const cheerio = require('cheerio')

const getRawBody = require('./utils/getRawBody')

const data = []

const getData = async () => {
    try {
        const html = await getRawBody(process.env.DATA_BASE_URL)
        const $ = cheerio.load(html)

        const tableBody = $('div.table-responsive table tbody')
        
        tableBody.children().each((index, element) => {
            const perStateData = []
            const rows = $(element).find('td')

            if(rows.length === 5) {
                perStateData.push("Total number of confirmed cases in India")
            }
            rows.each((i, elem) => {
                if(i !== 0) {
                    perStateData.push($(elem).text().trim())
                } 
            })
            data.push(perStateData)
        })
        
        console.log(JSON.stringify(data, null, 2))
    } catch(e) {
        if(e.statusCode === 500) {
            console.log("Cannot load data")
        } else {
            console.log("Error: ", e)
        }
    }
}

getData()