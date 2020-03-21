const cheerio = require('cheerio')
const moment = require('moment')

const getRawBody = require('./getRawBody')

module.exports = async () => {
    const stateData = []
    const newDocumentPdfLinks = []

    try {
        const html = await getRawBody(process.env.DATA_BASE_URL)
        const $ = cheerio.load(html)

        // const tableHeadRow = $('div.table-responsive table thead tr')
        // const tableHeader = []
        // tableHeadRow.children().each((index, row) => {
        //     if(index !== 0) {
        //         tableHeader.push($(row).text().trim())
        //     } 
        // })

        // stateData.push(tableHeader)

        const tableBody = $('div.table-responsive table tbody')
        
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

        const newDocuments = $('img[alt="New"]')

        newDocuments.each((i, doc) => {
            let pdfLink = $(doc).parent().parent().parent().attr('href')
            let pdfTitle = $(doc).parent().parent().parent().text().trim()
            if(pdfLink === undefined) {
                pdfLink = $(doc).parent().attr('href')
                pdfTitle = $(doc).parent().text().trim()
            }

            if(pdfLink !== undefined) {
                newDocumentPdfLinks.push({
                    link: `${process.env.DATA_BASE_URL}${pdfLink}`,
                    title: pdfTitle
                })
            }
        })

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
            documentLinks: []
        }
    }
}