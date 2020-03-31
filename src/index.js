require('dotenv').config();
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')

const getInformation = require('./utils/getInformation')
const replyWithStateInformationInHTML = require('./utils/replyWithStateInformationInHTML')
const getLatestNews = require('./utils/getLatestNews')
const addUserToDB = require('./utils/addUserToDB')
const acknowledgeAdmin = require('./utils/acknowlegdeAdmin')
const wait = require('./utils/wait')

require('./utils/createDbDir')()

let cache = {}
let newsCache = {}

const getData = async () => {
    if (
        Object.keys(cache).length == 0 ||
        moment().diff(moment(cache['lastUpdatedAt']), 'minutes') > 60
    ) {
        const results = await getInformation()
        cache = results
        return results
    } else {
        return cache
    }
}

const getNews = async () => {
    if (
        Object.keys(newsCache).length == 0 ||
        moment().diff(moment(newsCache['lastUpdatedAt']), 'minutes') > 30
    ) {
        const results = await getLatestNews()
        newsCache = results
        return results
    } else {
        return newsCache
    }
}

const shouldAcknowledgeAdmin = (ctx, command) => {
    const { message : { chat, from } } = ctx
    const { username, is_bot } = from
    const { id } = chat

    if(id.toString() !== process.env.ADMIN_CHAT_ID && username !== 'AkashRajpurohit') {
        addUserToDB(username, is_bot)
        acknowledgeAdmin(username, command)
    }
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.start(async (ctx) => {
    await ctx.reply('Welcome! Please use the /help command to check the features provided by me')

    shouldAcknowledgeAdmin(ctx, '/start')
})

bot.help(({ reply }) => reply('Use /info to check the latest information regarding the Covid19 Virus in India \nUse /dev to know more about the developer'))

bot.command('/info', async (ctx) => {
    await ctx.reply('What do you want to view', Markup
        .keyboard([
            ['📊 Current Situation in India'],
            ['📰 New Articles Shared by Government'],
            ['📖 Read Latest News']
        ])
        .oneTime()
        .resize()
        .extra()
    )

    shouldAcknowledgeAdmin(ctx, '/info')
})

bot.command('dev', async (ctx) => {
    await ctx.replyWithMarkdown(`
        Hello, I'm Akash Rajpurohit.\nYou can find me at: [https://t.me/AkashRajpurohit](https://t.me/AkashRajpurohit)\n\nOther Links:\n\nWebsite: [https://akashwho.codes](https://akashwho.codes)\nGithub: [https://github.com/AkashRajpurohit](https://github.com/AkashRajpurohit)\nLinkedIn: [https://linkedin.com/in/AkashRajpurohit](https://linkedin.com/in/AkashRajpurohit)
    `)

    shouldAcknowledgeAdmin(ctx, '/dev')
})

bot.hears('📊 Current Situation in India', async (ctx) => {
    await ctx.reply('Getting the latest data... Please wait')
    const { stateData } = await getData()

    await replyWithStateInformationInHTML(stateData, ctx.replyWithHTML)

    shouldAcknowledgeAdmin(ctx, '📊 Current Situation in India')
})

bot.hears('📰 New Articles Shared by Government', async (ctx) => {
    await ctx.reply('Collecting all new articles by government... Please wait')
    const { documentLinks } = await getData()
    const docTitles = documentLinks.map((doc, index) => `${index + 1}. ${doc.title}`)

    shouldAcknowledgeAdmin(ctx, '📰 New Articles Shared by Government')

    return ctx.reply('Choose an article you wish to read', Extra.markup(
        Markup.keyboard(docTitles, {
          wrap: (_, index) => (index + 1) / 2
        })
    ))
})

bot.hears('📖 Read Latest News', async (ctx) => {
    await ctx.reply('Fetching latest news!')
    const { articles } = await getNews()

    if(articles && articles.length > 0) {
        const url = articles[0].url
        await ctx.replyWithHTML(url)
        await wait(2)
        
        await ctx.reply('Click next to see next news', Extra.HTML().markup((m) =>
            m.inlineKeyboard([
                m.callbackButton('Next', '1')
            ])
        ))
    } else {
        await ctx.reply('Sorry, cannot find news at the moment. Try again later or report the problem to @AkashRajpurohit')
    }

    shouldAcknowledgeAdmin(ctx, '📖 Read Latest News')
})

bot.hears(/(\d+)/, async ({ replyWithDocument, message, match }) => {
    const { documentLinks } = await getData()

    const msgFromUser = message.text.slice(3).trim()

    if(msgFromUser === "") return

    const index = match[0] - 1

    if(documentLinks[index].title === msgFromUser) {
        replyWithDocument(documentLinks[index].link)
    }
})

bot.action(/.+/, async ({ answerCbQuery, reply, replyWithHTML, match }) => { 
    const articleIndex = parseInt(match[0])

    await answerCbQuery(`Loading next news`)

    const { articles } = await getNews()

    if(articleIndex < articles.length) {
        const url = articles[articleIndex].url
        await replyWithHTML(url)
        await wait(2)

        if(articleIndex + 1 < articles.length) {

            await reply('Click next to see next news', Extra.HTML().markup((m) =>
                m.inlineKeyboard([
                    m.callbackButton('Next', (articleIndex + 1).toString())
                ])
            ))
        } else {
            await reply('Finished')
        }
    }
})

bot.catch((err) => console.log(err))

bot.launch()
    .then(() => console.log('Bot started'))
    .catch((err) => {
        console.log("Bot launch failed: ", err)
        process.exit(1)
    })