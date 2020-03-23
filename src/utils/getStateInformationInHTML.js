module.exports = (data) => {
    let output = ''
    const title = ['State', 'Confirmed (Indian National)', 'Confirmed (Foreign National)', 'Cured', 'Death']

    for(let i = 0; i < data.length - 1; i++) {
        for(let j = 0; j < data[i].length; j++) {
            output += `<i>${title[j]}:</i> <b>${data[i][j]}</b> \n\n`
        }
        
        output += '---------------------------------------------\n\n'
    }

    output += '<i>Total All Over India</i> \n\n'

    for(let i = 1; i < data[data.length - 1].length; i++) {
        output += `<i>${title[i]}:</i> <b>${data[data.length - 1][i]}</b> \n\n`
    }

    return output
}