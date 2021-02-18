
function normalize_curency(input) {
    result = input.split('-')[0].trim(); // Just use the first value if the price in range "eg: ₫2.000 - ₫3.000"
    result = result.replace(/₫/g, ''); // Remove đ character
    result = result.replace('.', ''); // Remove separator
    return parseInt(result);
}


module.exports = {
    normalize_curency: normalize_curency
}