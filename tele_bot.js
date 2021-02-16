const { Telegraf } = require('telegraf')

const bot = new Telegraf("1612550046:AAEPvb1hQEVvNqu61kNyMMhwfCIWhgU93tw");
bot.start((ctx) => ctx.reply('Welcome'));
bot.hears('hi', (ctx) =>{
    console.log('HI: '+ctx.message.chat.id);
    ctx.reply('Hey there')
});
// bot.launch()
// console.log('Telegram bot launched');
module.exports = bot;