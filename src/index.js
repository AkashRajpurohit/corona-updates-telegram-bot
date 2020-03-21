require('dotenv').config();
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')

const getInformation = require('./utils/getInformation')
const getStateInformationInMd = require('./utils/getStateInformationInMd')

let cache = {}

const getData = async () => {
    if (
        Object.keys(cache).length == 0 ||
        moment().diff(moment(cache['lastUpdatedAt']), 'minutes') > 15
    ) {
        const results = await getInformation()
        cache = results
        return results
    } else {
        return cache
    }
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.start(({ reply }) => reply('Welcome! Please use the /help command to check the features provided by me'))

bot.help(({ reply }) => reply('Use /info to check the latest information regarding the Covid19 Virus in India \nUse /dev to know more about the developer'))

bot.command('/info', async ({ reply }) => {
    return reply('What do you want to view', Markup
        .keyboard([
            ['📊 Current Situation in India'],
            ['📰 New Articles Shared by Government']
        ])
        .oneTime()
        .resize()
        .extra()
    )
})

bot.command('dev', ({ replyWithMarkdown }) => {
    replyWithMarkdown(`
        Hello, I'm Akash Rajpurohit.\nYou can find me at: [https://t.me/AkashRajpurohit](https://t.me/AkashRajpurohit)\n\nOther Links:\n\nWebsite: [https://akashwho.codes](https://akashwho.codes)\nGithub: [https://github.com/AkashRajpurohit](https://github.com/AkashRajpurohit)\nLinkedIn: [https://linkedin.com/in/AkashRajpurohit](https://linkedin.com/in/AkashRajpurohit)
    `)
})

bot.hears('📊 Current Situation in India', async ({ replyWithMarkdown }) => {
    const { stateData } = await getData()
    const output = getStateInformationInMd(stateData)
    replyWithMarkdown(output)
})

bot.hears('📰 New Articles Shared by Government', async ({ reply }) => {
    const { documentLinks } = await getData()

    const docTitles = documentLinks.map((doc, index) => `${index + 1}. ${doc.title}`)

    return reply('Which article?', Extra.markup(
        Markup.keyboard(docTitles, {
          wrap: (_, index) => (index + 1) / 2
        })
    ))
})

bot.hears(/(\d+)/, async ({ replyWithDocument }) => {
    const { documentLinks } = await getData()

    const msgFromUser = ctx.message.text.slice(3).trim()

    if(msgFromUser === "") return

    const index = ctx.match[0] - 1

    if(documentLinks[index].title === msgFromUser) {
        replyWithDocument(documentLinks[index].link)
    }
})

bot.catch((err) => console.log(err))

bot.launch()
    .then(() => console.log('Bot started'))
    .catch((err) => {
        console.log("Bot launch failed: ", err)
        process.exit(1)
    })