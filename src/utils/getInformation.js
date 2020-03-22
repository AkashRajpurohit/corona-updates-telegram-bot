const cheerio = require('cheerio')
const moment = require('moment')
const _ = require('lodash')

const getRawBody = require('./getRawBody')

const getAllPdfLinksFromPage = require('./getAllPdfLinksFromPage')

module.exports = async () => {
    const stateData = []
    let newDocumentPdfLinks = []

    try {
        const html = await getRawBody(process.env.DATA_BASE_URL)
        const $ = cheerio.load(html)

        const tableBody = $('div.content div.table-responsive table tbody')
        
        tableBody.children().each((_, element) => {
            const perStateData = []
            const rows = $(element).find('td')

            if(rows.length === 5) {
                perStateData.push("Total number of confirmed cases in India")
            }
            rows.each((i, row) => {
                if(i !== 0) {
                    perStateData.push($(row).text().trim())
                } 
            })

            stateData.push(perStateData)
        })

        let allMenuLinks = []

        $('.menu .menu-ee .dropdown').each((_, button) => {
            allMenuLinks.push($(button).find('.dropbtn a').attr('href'))
        })

        for(let page of allMenuLinks) {
            const allPdfLinksOnPage = await getAllPdfLinksFromPage(page)
            
            newDocumentPdfLinks.push(...allPdfLinksOnPage)
        }

        newDocumentPdfLinks = _.uniqBy(newDocumentPdfLinks, 'link')

        return {
            stateData,
            documentLinks: newDocumentPdfLinks,
            lastUpdatedAt: moment().format()
        }

    } catch(e) {
        if(e.statusCode === 500) {
            console.log("Cannot load data")
        } else {
            console.log("Error: ", e)
        }

        return {
            stateData: [],
            documentLinks: [],
            lastUpdatedAt: moment().format()
        }
    }
}