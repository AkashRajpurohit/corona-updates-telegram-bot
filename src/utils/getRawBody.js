const request = require('request-promise')

module.exports = async (url) => {
    const html = await request(url)
    return html
}