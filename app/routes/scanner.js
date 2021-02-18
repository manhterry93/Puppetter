var express = require('express');
let shopeeScaner = require('../services/crawler/shopee');

var router = express.Router();

/**
 * Scan flash sale
 */
router.post('/flash_sale', function (req, res) {
    let body = req.body;
    console.log('body: ', body);
    let href = body['href'];
    let price = body['price'];
    let interval = body['interval'] ?? 3600;
    // shopeeScaner.cancelAllSubscribers();
    shopeeScaner.scheduleScanFlashSale(interval);
    res.statusCode = 200;
    res.send('Scheduled for scan flash sale \nInterval: ' + interval);
});

module.exports =router;