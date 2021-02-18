const { Client } = require('pg')
const client = new Client({
    user: 'postgres',
    host: '192.168.1.47',
    database: 'crawler',
    port: '5435',
    password: 'postgres'
});

client.connect()


/**
 * Update product detail, 
 */
function saveProductDetail(product) {
    // Insert or update product detail first
    // let query = 'INSERT INTO public.product (href, title, rated, rate, rate_count, stock) ' +
    //     `VALUES (${product.url}, ${product.title}, ${product.rated ?? 0}, ${product.rate ?? 0}, ${product.rate_count ?? 0}, ${product.stock})` +
    //     'ON CONFLICT (href) DO UPDATE ' +
    //     `SET title=${product.title} , rated=${product.rated}, rate=${product.rate}, ` +
    //     ` rate_count = ${product.rate_count}, stock=${product.stock}`;
    query = {
        text: 'INSERT INTO public.product (href, title, rated, rate, rate_count, stock) ' +
            `VALUES ($1, $2, $3, $4, $5, $6)` +
            'ON CONFLICT (href) DO UPDATE ' +
            `SET title=$2 , rated=$3, rate=$4, ` +
            ` rate_count = $5, stock=$6`,
        values: [product.url, product.title, product.rated ?? 0, product.rate ?? 0, product.rate_count ?? 0, product.stock]
    }
    client.query(query, (err, res) => {
        if (err) { // query = {
            //     text: 'INSERT INTO public.product (href, title, rated, rate, rate_count, stock) ' +
            //         `VALUES (${product.href}, ${product.title}, ${product.rated ?? 0}, ${product.rate ?? 0}, ${product.rate_count ?? 0}, ${product.stock})` +
            //         'ON CONFLICT (href) DO UPDATE ' +
            //         `SET title=${product.title} , rated=${product.rated}, rate=${product.rate}, ` +
            //         ` rate_count = ${product.rate_count}, stock=${product.stock}`,
            //     values: [product.href, product.title, product.rated ?? 0, product.rate ?? 0, product.rate_count ?? 0, product.stock]
            // }
            console.log(err.stack);
        } else {
            // Success, save the price history
            query = {
                text: 'INSERT INTO public.product_price (price, product_href, is_flash_sale)' +
                    `VALUES ($1, $2, $3)`,
                values: [product.price, product.url, product.isFlashSale]
            }
            client.query(query, (err, res) => {
                if (err) {
                    console.log('Insert to product.price error: ', err.stack);
                }
            });
        }
    })
}

module.exports = {
    saveProductDetail: saveProductDetail
}