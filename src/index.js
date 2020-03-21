require('dotenv').config();
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const getInformation = require('./utils/getInformation');

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

bot.hears('📊 Current Situation in India', (ctx) => {
    ctx.reply('return stats')
})

bot.hears('📰 New Articles Shared by Government', (ctx) => {
    ctx.reply('return list of articles')
})

bot.launch()
    .then(() => console.log('Bot started'))
    .catch((err) => {
        console.log("Bot launch failed: ", err)
        process.exit(1)
    })