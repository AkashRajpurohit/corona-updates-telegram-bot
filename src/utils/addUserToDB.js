const fs = require('fs')
const path = require('path')

module.exports = (username, isBot) => {
    const users = path.join(__dirname, '..', 'db', 'users.json')

    fs.readFile(users, (err, data) => {
        let jsonData;

        if(!data) {
            jsonData = []
        } else {
            jsonData = JSON.parse(data)
        }

        const userAlreadyAdded = jsonData.filter((user) => user.username === username)

        if(userAlreadyAdded.length === 0) {
            jsonData.push({ username, isBot })

            fs.writeFile(users, JSON.stringify(jsonData), (err) => {
                if(!err) {
                    console.log(`New user ${username} added successfully`)
                }
            })
        }
    })
}