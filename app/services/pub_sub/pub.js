const { connect, StringCodec } = require("nats")
const process = require('process');

// create a codec
const sc = StringCodec();
async function publish(channel = "", product = null) {
    // to create a connection to a nats-server:
    const nc = await connect({ servers: "192.168.1.47:24222" });
    console.log('publish for notify: ', product);
    if (!channel) {
        console.log();
    } else {
        if (product == null) // Product null -> test publish
            product = {
                title: "Itto",
                url: "http://xxx.com",
                image: "https://images.ctfassets.net/hrltx12pl8hq/7yQR5uJhwEkRfjwMFJ7bUK/dc52a0913e8ff8b5c276177890eb0129/offset_comp_772626-opt.jpg",
                price: 4000,
                last_update: new Date().getTime()
            };
        let x = JSON.stringify(product);

        nc.publish("product_sale", sc.encode(x));
        // nc.publish(channel, sc.encode("Hỡi các idol !!\nSản phẩm này đang có giá ngon: \n" + href));
    }

    // we want to insure that messages that are in flight
    // get processed, so we are going to drain the
    // connection. Drain is the same as close, but makes
    // sure that all messages in flight get seen
    // by the iterator. After calling drain on the connection
    // the connection closes.
    await nc.drain();
}


module.exports = {
    publish: publish
}