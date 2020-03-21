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

bot.start((ctx) => ctx.reply('Welcome! Please use the /help command to check the features provided by me'))

bot.help((ctx) => ctx.reply('List features here in depth'))

bot.command('/info', async (ctx) => {
    return ctx.reply('What do you want to view', Markup
        .keyboard([
            ['📊 Current Situation in India'],
            ['📰 New Articles Shared by Government']
        ])
        .oneTime()
        .resize()
        .extra()
    )
})

bot.hears('📊 Current Situation in India', async (ctx) => {
    const { stateData } = await getData()
    const output = getStateInformationInMd(stateData)
    ctx.replyWithMarkdown(output)
})

bot.hears('📰 New Articles Shared by Government', async (ctx) => {
    const { documentLinks } = await getData()
    
    const docTitles = documentLinks.map((doc, index) => `${index + 1}. ${doc.title}`)

    return ctx.reply('Which article?', Extra.markup(
        Markup.keyboard(docTitles, {
          wrap: (_, index) => (index + 1) / 2
        })
      ))
})

bot.hears(/(\d+)/, async (ctx) => {
    const { documentLinks } = await getData()

    const msgFromUser = ctx.message.text.slice(3)

    if(msgFromUser.trim() === "") return

    const index = ctx.match[0] - 1

    if(documentLinks[index].title === msgFromUser) {
        ctx.replyWithDocument(documentLinks[index].link)
    }
})

bot.catch((err) => console.log(err))

bot.launch()
    .then(() => console.log('Bot started'))
    .catch((err) => {
        console.log("Bot launch failed: ", err)
        process.exit(1)
    })