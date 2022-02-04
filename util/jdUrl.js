let urls = require('url');
let qs = require('querystring');
let CryptoJS = require('crypto-js');

function lite(functionId, body, type = 'post', cookie = '') {
    let params = {
        functionId: functionId,
        body: typeof (body) == 'string' ? body : JSON.stringify(body),
        appid: 'lite-android',
        client: 'apple',
        uuid: CryptoJS.MD5('' + new Date().getTime()).toString(),
        clientVersion: '8.3.6',
        t: new Date().getTime(),
    }
    let m = Object.keys(params).sort().map(d => params[d]).join("&")
    let sign = CryptoJS.HmacSHA256(m, '12aea658f76e453faf803d15c40a72e0').toString()
    params.sign = sign
    if (type == 'post') {
        let p = {
            'url': `https://api.m.jd.com/api?functionId=${functionId}`,
            'form': Object.keys(params).map(function(key) {
                return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
            }).join("&")
        }
        if (cookie) {
            p.cookie = cookie
        }
        return p
    }
    else {
        return `https://api.m.jd.com/api?${Object.keys(params).map(function(key) {
            return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
        }).join("&")}`
    }
}
module.exports = {
    lite,
}
