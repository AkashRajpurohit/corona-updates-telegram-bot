const cheerio = require('cheerio')
const moment = require('moment')
const _ = require('lodash')

const getRawBody = require('./getRawBody')

const isPdfLink = require('./isPdfLink')

module.exports = async () => {
    const stateData = []
    let newDocumentPdfLinks = []

    try {
        const html = await getRawBody(process.env.DATA_BASE_URL)
        const $ = cheerio.load(html)

        const table = $('div.content div.table-responsive table')

        const tableHead = $(table).find('thead')

        tableHead.children().each((_, elem) => {
            const titles = []
            const rows = $(elem).find('th')

            rows.each((i, row) => {
                if(i !== 0) {
                    titles.push($(row).text().trim())
                } 
            })

            stateData.push(titles)
        })

        const tableBody = $(table).find('tbody')
        
        tableBody.children().each((_, element) => {
            const perStateData = []
            const rows = $(element).find('td')

            if(rows.length === stateData[0].length) {
                perStateData.push("Total number of confirmed cases in India")
            }
            rows.each((i, row) => {
                if(i !== 0) {
                    perStateData.push($(row).text().trim())
                } 
            })

            if(perStateData.length !== 0) {
                stateData.push(perStateData)
            }
        })

        let allPdfLinksOnPage = [];

        $('a').each((_ ,link) => {
            const linkAttr = $(link).attr('href')
            if(isPdfLink(linkAttr)) {
                const linkTitle = $(link).text().trim()

                allPdfLinksOnPage.push({
                    link: linkAttr,
                    title: linkTitle
                })
            }
        })

        newDocumentPdfLinks = _.uniqBy(allPdfLinksOnPage, 'link')
        
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