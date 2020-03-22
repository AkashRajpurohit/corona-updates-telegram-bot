module.exports = (data, lastUpdated) => {
    let output = ''
    const title = ['State', 'Confirmed (Indian National)', 'Confirmed (Foreign National)', 'Cured', 'Death']

    for(let i = 0; i < data.length - 1; i++) {
        for(let j = 0; j < data[i].length; j++) {
            output += `**${title[j]}:** __${data[i][j]}__ \n\n`
        }
        
        output += '---------------------------------------------\n\n'
    }

    output += 'Total All Over India \n\n'

    for(let i = 1; i < data[data.length - 1].length; i++) {
        output += `**${title[i]}:** __${data[data.length - 1][i]}__ \n\n`
    }

    return output
}