const request = require('request-promise')
const moment = require('moment')

module.exports = async () => {
    try {
        const options = {
            uri: 'http://newsapi.org/v2/top-headlines/',
            qs: {
                q: 'corona',
                country: 'in',
                apiKey: process.env.NEWS_API_KEY,
            },
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true
        }

        const resp = await request(options)

        return {
            ...resp,
            lastUpdatedAt: moment().format()
        };
    } catch(e) {
        console.log(e)
    }
}