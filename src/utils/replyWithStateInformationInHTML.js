const wait = require('./wait')

module.exports = async (data, reply) => {
    let output = ''
    const title = data[0]

    for(let i = 1; i < data.length - 1; i++) {
        for(let j = 0; j < data[i].length; j++) {
            output += `${title[j]}: <b>${data[i][j]}</b> \n\n`
        }

        output += '------------------------------------ \n\n'

        if(i % 6 === 0) {
            await reply(output)
            await wait(4)
            output = ''
        }
    }

    if(output !== '') {
        await reply(output)
        await wait(4)
        output = ''
    }

    output += `<b>${data[data.length - 1][0]}</b> \n\n`

    for(let i = 1; i < data[data.length - 1].length; i++) {
        output += `${title[i]}: <b>${data[data.length - 1][i]}</b> \n\n`
    }

    await reply(output)
}