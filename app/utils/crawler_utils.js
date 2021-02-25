
function normalize_curency(input) {
    result = input.split('-')[0].trim(); // Just use the first value if the price in range "eg: ₫2.000 - ₫3.000"
    result = result.replace(/₫/g, ''); // Remove đ character
    result = result.replace('.', ''); // Remove separator
    return parseInt(result);
}

function extractImage(image) {
    let regex = /(url\(\")(.+)(\"\))$/;
    // let demo = 'url("https://cf.shopee.vn/file/96bcdcbad2884af151f00ee34e2d69de_tn")'
    let result = image.match(regex);

    if (result != null && result.length > 0) {
        return result[2];
    }
    return "";

}



module.exports = {
    normalize_curency: normalize_curency,
    extractImage: extractImage
}