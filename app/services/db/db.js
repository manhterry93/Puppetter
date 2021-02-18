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
            ` rate_count = $5, stock=$6 , last_update=$7`,
        values: [product.url, product.title, product.rated ?? 0, product.rate ?? 0, product.rate_count ?? 0, product.stock, product.last_update]
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

/**
 * Generate a input key query for SQL ($1,$2,.....)
 * 
 * @param rowCount 
 * @param columnCount 
 * @param startAt 
 */
function expand(rowCount, columnCount, startAt = 1) {
    var index = startAt;
    return Array(rowCount)
        .fill(0)
        .map(
            (v) =>
                `(${Array(columnCount)
                    .fill(0)
                    .map((v) => `$${index++}`)
                    .join(', ')})`,
        )
        .join(', ');
}
/**
 * Flattern Input array to a unique array with all value <br/>
 * eg:
 * [[1, 2], [3, 4]] => [1, 2, 3, 4]
 * 
 */
function flatten(arr) {
    var newArr = [];
    arr.forEach((v) => v.forEach((p) => newArr.push(p)));
    return newArr;
}

function saveProductList(data) {
    // Insert to product table: 4 columns
    let keyQueries = expand(data.length, 4)
    let valueQueries = data.map((product) => [
        'https://shopee.vn/' + product.href,
        product.title,
        product.price,
        product.last_update
    ]);
    let query = `INSERT INTO public.product (href, title, price, last_update) VALUES ${keyQueries} ` +
        'ON CONFLICT (href) DO UPDATE SET title = excluded.title, price = excluded.price, last_update = excluded.last_update'
    client.query(query, flatten(valueQueries), (err, res) => {
        if (err) {
            console.log('error when inserting product list', err.stack)
        }else{
            console.log('write to db done');
        }
    });
}

module.exports = {
    saveProductDetail: saveProductDetail,
    saveProductList: saveProductList
}