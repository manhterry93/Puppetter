const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });;
    const page = await browser.newPage();
    await page.goto('https://zshop.vn/lenovo-thinkpad-t14-2020-14-inch-amd-ryzen-7-pro-4750u-16gb-512gb-fhd.html', { waitUntil: 'networkidle2' });
    //   await waitTillHTMLRendered(page)
    await waitTillHTMLRendered(page);
    //   await page.pdf({path: 'hn.pdf', format: 'A4'});
    await page.screenshot({path: 'full.png', fullPage: true});
    await browser.close();
})();


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