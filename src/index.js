require('dotenv').config();
// const getInformation = require('./utils/getInformation');
const Telegraf = require('telegraf')

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.start((ctx) => ctx.reply('Welcome'))

bot.launch()
    .then(() => console.log('Bot started'))
    .catch((err) => {
        console.log("Bot launch failed: ", err)
        process.exit(1)
    })