let bot = require('./services/bot/tele_bot');
let shopeeScaner= require('./services/crawler/shopee');
const puppeteer = require('puppeteer');

const schedule = require('node-schedule');
(async () => {
    // await enableTelebot();
    // shopeeScaner.subscriberForProduct("Sạc-Dự-Phòng-TOPK-I1006-10000mAh-Cho-iPhone-Huawei-Samsung-Xiaomi-Oppo-Vivo-Realme-Hai-Cổng-Dung-Lượng-Có-Màn-Hình-Điện-Tử-i.142005723.7820680886", 170000);
    // test();
    testProductDetail();
})();


async function enableTelebot() {
    await bot.launch();
    bot.telegram.sendMessage('-1001462115842',"Xin chào các idol, Minerva đã khởi động thành công");
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

function test(){
    // shopeeScaner.scanFlashSale(false, false);
    shopeeScaner.testLogin();
}

async function testProductDetail(){
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome',
        args: ['--user-data-dir=/tmp/puppeteer']
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));   
    await page.goto('https://shopee.vn');
    // await shopeeScaner.get_product_detail(page, 'product/26335071/9513550481',true);
    // browser.close();
}
