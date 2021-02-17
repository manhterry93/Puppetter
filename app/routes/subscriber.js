var express = require('express');
let shopeeScaner = require('../services/crawler/shopee');

var router = express.Router();

router.post('/', function (req, res) {
    let body = req.body;
    console.log('body: ', body);
    if (body == null || body['href'] == null) {
        res.statusCode = 400;
        res.send('Body must have \"href\" field');
    } else {
        let href = body['href'];
        let price = body['price'];
        let interval = body['interval'] ?? 3600;
        shopeeScaner.cancelAllSubscribers();
        shopeeScaner.subscriberForProduct(href, price, interval);
        res.statusCode = 200;
        res.send('Subscribe for ' + 'https://shopee.vn/' + href + '\n Price: ' + price + '\nInterval: ' + interval);
    }
});

router.get('/clear', function (req, res) {
    shopeeScaner.cancelAllSubscribers();
    res.statusCode = 200;
    res.send('Clear all subscribers ');
});

module.exports = router;