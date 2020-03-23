module.exports = (article) => {
    let output = `
            <b>${article.title}</b>

            <a href="${article.url}">Read More</a>
        `

    return output
}