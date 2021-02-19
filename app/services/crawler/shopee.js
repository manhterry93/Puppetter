const puppeteer = require('puppeteer');
var fs = require('fs');
let bot = require('.././bot/tele_bot');
const schedule = require('node-schedule');
let curency_util = require('../../utils/crawler_utils');
const { time } = require('console');
let db = require('../db/db');
const moment = require('moment');
const crawler_utils = require('../../utils/crawler_utils');
let current_time = '';

const JOB_FLASH_SALE = 'flash_sale_job';

function scheduleScanFlashSale(interval) {
    schedule.cancelJob(JOB_FLASH_SALE);
    let time_cron = '*/' + interval + ' * * * * *';
    const job = schedule.scheduleJob(JOB_FLASH_SALE, '0 0 * ? * *', (date) => {
        console.log('job: ' + JOB_FLASH_SALE + " triggered");
        scanFlashSale();
    });
}

async function scanFlashSale(saveToDb = true, isHeadless = true) {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome'
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('https://shopee.vn/flash_sale', { waitUntil: 'networkidle2' });
    await scrapeInfiniteScrollItems(page, extractItems, 100);

    const current = moment().utc().format('YYYY-MM-DD hh:mm:ss');
    console.log('time: ' + current);
    let normalizeCurency = (price) => crawler_utils.normalize_curency(price);
    await page.exposeFunction("normalizeCurency", normalizeCurency);
    let data = await page.evaluate(async (time) => {
        let products = [];
        let product_wrapper = document.querySelectorAll('.flash-sale-item-card');
        for (const product of product_wrapper) {
            let dataJson = {};
            try {
                dataJson.href = product.querySelector('.flash-sale-item-card-link').getAttribute('href').split('/')[1];

                image_element = product.querySelector('.flash-sale-item-card__animated-image').style['background-image'];
                dataJson.image = image_element;

                dataJson.title = product.querySelector('.flash-sale-item-card__item-name').innerText;

                dataJson.price = product.querySelector('.flash-sale-item-card__original-price').querySelector('.item-price-number').innerText;
                dataJson.salePrice = product.querySelector('.flash-sale-item-card__current-price').querySelector('.item-price-number').innerText;
            } catch (err) {
                console.log('error: ', err);
            }
            dataJson.last_update = time;
            dataJson.price = await normalizeCurency(dataJson.price);
            if (Boolean(dataJson.href) && !dataJson.href.startsWith('https://shopee.vn') && dataJson.href.length > 0) {
                // Just add product, not event, card,...               
                products.push(dataJson)
            }
        }
        return products;
    }, current);

    browser.close();
    console.log('Loading products done => Saving to db ');
    if (saveToDb) db.saveProductList(data);
}

async function get_product_detail(page, href) {
    console.log('get_product_detail: ' + ('https://shopee.vn/' + href));
    if (href.startsWith('https://shopee.vn')) return;
    await page.goto('https://shopee.vn/' + href, { waitUntil: 'networkidle2', timeout: 20000 });
    // Get info about: price, vote, vote count, sold amount, stock, sale count, is Flash sale
    var _href = href;
    const current = moment().utc().format('YYYY-MM-DD HH:MM:SS')
    let page_detail = await page.evaluate(() => {

        let product = {};
        let rate = document.getElementsByClassName('_527vrE');
        product.isFlashSale = rate.length > 0 ? 1 : 0

        if (rate.length > 0) {
            console.log('Is flash sale');
        } else {
            console.log('not flash sale');
        }

        // Rate
        rated = document.getElementsByClassName('_22cC7R');
        product.rated = rated.length > 0 ? 1 : 0;
        let price = document.querySelector('.AJyN7v').innerText;
        product.price = price;

        product.title = document.querySelector('._3ZV7fL').getElementsByTagName('span')[0].innerText;
        product.stock = document.querySelector('._2_ItKR').querySelector('.items-center').children[1].innerText.split(' ')[0];
        if (product.rated) {
            product.rate = document.querySelector('._22cC7R').innerText;
            let rate_elements = document.querySelectorAll('._3WXigY');
            product.rate_count = rate_elements[1].innerText;
        }
        return product;
    });
    page_detail.last_update = current;
    page_detail.url = 'https://shopee.vn/' + href;
    page_detail.price = curency_util.normalize_curency(page_detail.price);
    console.log(JSON.stringify(page_detail));
    return page_detail;
}
/**
    Subscribe for product pricing
    @param product_href link of product (not include "https://shopee.vn/")
    @param min_price the min price, when product price is below or equal this value, TeleBot will notice user
    @param interval in second
    */
async function subscriberForProduct(product_href, min_price = 10000, interval = 300) {
    let time_cron = '*/' + interval + ' * * * * *';
    console.log('time cron: ' + time_cron);
    const job = schedule.scheduleJob('0 */30 * ? * *', (date) => {
        onJobDone(date, product_href, min_price);
    });
}

/**
 * Cancel all subscribers
 */
function cancelAllSubscribers() {
    for (const job in schedule.scheduledJobs) schedule.cancelJob(job);
}
async function onJobDone(detail, product_href, min_price = 10000) {
    console.log('on job trigger: ' + product_href);
    const browser = await puppeteer.launch({
        headless: true, defaultViewport: null, args: [
            '--window-size=1920,1080',
        ]
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    let product_detail = await get_product_detail(page, product_href);

    console.log('price: ' + product_detail.price);
    if (product_detail.price <= min_price) {
        bot.telegram.sendMessage("-1001462115842", "Hỡi các idol, sản phẩm này đang giá ngon\n" + product_detail.url);
    }
    db.saveProductDetail(product_detail);
    await browser.close();
}

async function scrapeInfiniteScrollItems(
    page,
    extractItems,
    itemTargetCount,
    scrollDelay = 1000,
) {
    let items = [];
    try {
        let previousHeight;
        while (items.length < itemTargetCount) {
            items = await page.evaluate(extractItems);
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await page.waitFor(scrollDelay);
        }
    } catch (e) { }
    return items;
}


function extractItems() {
    const extractedElements = document.querySelectorAll('#boxes > div.box');
    const items = [];
    for (let element of extractedElements) {
        items.push(element.innerText);
    }
    return items;
}


const waitTillHTMLRendered = async (page, timeout = 30000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while (checkCounts++ <= maxChecks) {
        let html = await page.content();
        let currentHTMLSize = html.length;

        let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

        console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0; //reset the counter

        if (countStableSizeIterations >= minStableSizeIterations) {
            console.log("Page rendered fully..");
            break;
        }

        lastHTMLSize = currentHTMLSize;
        await page.waitFor(checkDurationMsecs);
    }
};

module.exports = {
    scanFlashSale: scanFlashSale,
    get_product_detail: get_product_detail,
    subscriberForProduct: subscriberForProduct,
    cancelAllSubscribers: cancelAllSubscribers,
    scheduleScanFlashSale: scheduleScanFlashSale
}