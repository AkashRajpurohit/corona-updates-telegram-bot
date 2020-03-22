const cheerio = require('cheerio')
const moment = require('moment')

const getRawBody = require('./getRawBody')

const isPdfLink = (link) => {
    return link.slice(link.length - 4) === '.pdf' || link.slice(link.length - 3) === '.PDF'
}

module.exports = async (page) => {
    try {
        const html = await getRawBody(process.env.DATA_BASE_URL + page)

        const $ = cheerio.load(html)

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

        return allPdfLinksOnPage

    } catch(e) {
        console.log("error getting links from the page: ", page)
        console.log(e)
        return []
    }
}