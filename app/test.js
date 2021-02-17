let bot = require('./bot/tele_bot');
let shopeeScaner= require('./services/crawler/shopee');

const schedule = require('node-schedule');
(async () => {
    await enableTelebot();
    shopeeScaner.subscriberForProduct("Sạc-Dự-Phòng-TOPK-I1006-10000mAh-Cho-iPhone-Huawei-Samsung-Xiaomi-Oppo-Vivo-Realme-Hai-Cổng-Dung-Lượng-Có-Màn-Hình-Điện-Tử-i.142005723.7820680886", 170000);
})();


async function enableTelebot() {
    await bot.launch();
    bot.telegram.sendMessage('-1001462115842',"Xin chào các idol, Minerva đã khởi động thành công");
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

function scheduleForCrawler() {
    // console.log('schedule ');
    // const job = schedule.scheduleJob('*/30 * * * * *', function (fireDate) {
    //     console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
    // });
}
