let bot = require('./tele_bot');
// require('./shopee');
const schedule = require('node-schedule');
(async () => {
    await enableTelebot();
    // bot.telegram.sendMessage('-1001462115842',"hello idols");
})();




async function enableTelebot() {
    await bot.launch();
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

function scheduleForCrawler() {
    console.log('schedule ');
    const job = schedule.scheduleJob('*/30 * * * * *', function (fireDate) {
        console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
    });
}