let bot = require('./services/bot/tele_bot');
let shopeeScaner= require('./services/crawler/shopee');

const schedule = require('node-schedule');
(async () => {
    // await enableTelebot();
    // shopeeScaner.subscriberForProduct("Sạc-Dự-Phòng-TOPK-I1006-10000mAh-Cho-iPhone-Huawei-Samsung-Xiaomi-Oppo-Vivo-Realme-Hai-Cổng-Dung-Lượng-Có-Màn-Hình-Điện-Tử-i.142005723.7820680886", 170000);
    test();
})();


async function enableTelebot() {
    await bot.launch();
    bot.telegram.sendMessage('-1001462115842',"Xin chào các idol, Minerva đã khởi động thành công");
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

function test(){
    shopeeScaner.scanFlashSale(false, false);
}
