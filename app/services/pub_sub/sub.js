const { connect, StringCodec } = require("nats");
const process = require('process');

// create a codec
const sc = StringCodec();
// create a simple subscriber and iterate over messages
// matching the subscription

let channel = process.argv[2]
console.log('process: ',channel);
(async () => {

    // to create a connection to a nats-server:
    const nc = await connect({ servers: "nats://192.168.1.47:24222" });

    const sub = nc.subscribe(channel);

    for await (const m of sub) {
        console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
    }
    console.log("subscription closed");
    // we want to insure that messages that are in flight
    // get processed, so we are going to drain the
    // connection. Drain is the same as close, but makes
    // sure that all messages in flight get seen
    // by the iterator. After calling drain on the connection
    // the connection closes.
    await nc.drain();
})();


