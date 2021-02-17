const puppeteer = require('puppeteer');


(async () => {
    const browser = await puppeteer.launch({
        headless: true, defaultViewport: null, args: [
            '--window-size=1920,1080',
        ]
    });;
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    await page.goto('https://tiki.vn/deal-hot/', { waitUntil: 'networkidle2' });
    await scrapeInfiniteScrollItems(page, extractItems, 100);
    // await page.screenshot({ path: 'full.png', fullPage: true });

    let data = await page.evaluate(() => {

        let products = [];
        let product_wrapper = document.querySelectorAll('.Item__Wrapper-m1oy8w-0');
        product_wrapper.forEach((product) => {
            let dataJson = {};
            try {
                dataJson.href=product.getAttribute('href').trim();
                dataJson.img = product.querySelector('.PictureV2__StyledWrapImage-tfuu67-0 > img').src;
                dataJson.title = product.querySelector('.title').innerText;
                price = product.querySelector('.price').innerText;
                // Remove redurant part
                price = price.replace(/₫/g, '').replace(/\%/g, ' ').replace(/\s+/g, ' ').trim();
                priceArr = price.split(' ');
                dataJson.price = priceArr[0];
                dataJson.originPrice = priceArr[1];
                // dataJson.originPrice = product.querySelector('.original').innerText.replace(/₫/g,'').trim();
            } catch (err) {
                console.log('error: ', err);
            }
            products.push(dataJson)
        });
        return products;
    });



    console.log(JSON.stringify(data));
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