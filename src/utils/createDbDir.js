const fs = require('fs')
const path = require('path')

module.exports = () => {
    const dir = path.join(__dirname, '..', 'db')

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir)
    }
}