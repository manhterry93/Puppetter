const puppeteer = require('puppeteer');


(async () => {
    const browser = await puppeteer.launch({
        headless: true, defaultViewport: null, args: [
            '--window-size=1920,1080',
        ]
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('https://shopee.vn/flash_sale', { waitUntil: 'networkidle2' });
    await scrapeInfiniteScrollItems(page, extractItems, 100);
    // await page.screenshot({ path: 'full.png', fullPage: true });

    let data = await page.evaluate(() => {

        let products = [];
        let product_wrapper = document.querySelectorAll('.flash-sale-item-card');
        product_wrapper.forEach((product) => {
            let dataJson = {};
            try {
            dataJson.href = product.querySelector('.flash-sale-item-card-link').getAttribute('href');

            image_element = product.querySelector('.flash-sale-item-card__animated-image').style['background-image'];
            console.log('image: ', image_element)
            dataJson.image = image_element;

            dataJson.title = product.querySelector('.flash-sale-item-card__item-name').innerText;

            dataJson.price = product.querySelector('.flash-sale-item-card__original-price').querySelector('.item-price-number').innerText;
            dataJson.salePrice = product.querySelector('.flash-sale-item-card__current-price').querySelector('.item-price-number').innerText;
            } catch (err) {
                console.log('error: ', err);
            }
            products.push(dataJson)

        });
        return products;
    });


    console.log(JSON.stringify(data));
    // console.log(data);
    await browser.close();
})();


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