let url = require("url");
let bot = require('./services/bot/tele_bot');
var bodyParser = require('body-parser')
let shopeeScaner = require('./services/crawler/shopee');

const express = require('express')
const app = express()
app.use(bodyParser.json())
const port = 3000


// Routers
let subscribers = require('./routes/subscriber');
let scanner = require('./routes/scanner');

app.get('/', (req, res) => {
    console.log('onreqquest: ', req.path);
    res.send('Hello World!')
});

app.use('/scan', scanner);


(async () => {
    await enableTelebot();

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    });
})();

async function enableTelebot() {
    await bot.launch();
    bot.telegram.sendMessage('-1001462115842', "Xin chào các idol, Minerva đã khởi động thành công");
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}