let CryptoJS = require('crypto-js');
let request = require("request")

function bytes(arr = '') {
    return arr
}

function bytes2bin(bytes) {
    let s = []
    for (let i of bytes.split('')) {
        let v = i.charCodeAt()
        s = s.concat(
            [(v & 128) >> 7, (v & 64) >> 6, (v & 32) >> 5, (v & 16) >> 4, (v & 8) >> 3, (v & 4) >> 2, (v & 2) >> 1,
                v & 1
            ])
    }
    return s
}

function bin2bytes(arr) {
    let arr1 = Array.from({
        length: parseInt(arr.length / 8)
    }).map(d => 0);
    for (let j in arr1) {
        arr1[j] = arr[j * 8] << 7 | arr[j * 8 + 1] << 6 | arr[j * 8 + 2] << 5 | arr[j * 8 + 3] << 4 | arr[j * 8 + 4] << 3 | arr[j * 8 + 5] << 2 | arr[j * 8 + 6] << 1 | arr[j * 8 + 7]
    }
    return bytes(arr1)
}

function sub_12ECC(input) {
    let arr = [0x37, 0x92, 0x44, 0x68, 0xA5, 0x3D, 0xCC, 0x7F, 0xBB, 0xF, 0xD9, 0x88, 0xEE, 0x9A, 0xE9, 0x5A]
    let key2 = [
        '8', '0', '3', '0', '6', 'f',
        '4', '3', '7', '0', 'b', '3',
        '9', 'f', 'd', '5', '6', '3',
        '0', 'a', 'd', '0', '5', '2',
        '9', 'f', '7', '7', 'a', 'd',
        'b', '6'
    ]
    let arr1 = Array.from({
        length: input.length
    }).map(d => 0);
    let r0, r1, r2, r3, r4
    for (i in arr1) {
        r0 = input[i].charCodeAt()
        r2 = arr[i & 0xf]
        r4 = (key2[i & 7]).charCodeAt()
        r0 = r2 ^ r0
        r0 = r0 ^ r4
        r0 = r0 + r2
        r2 = r2 ^ r0
        r1 = (key2[i & 7]).charCodeAt()
        r2 = r2 ^ r1
        arr1[i] = r2 & 0xff
    }
    return bytes(arr1)
}

function sub_10EA4(input) {
    let table = [[0, 0], [1, 4], [2, 61], [3, 15], [4, 56], [5, 40], [6, 6], [7, 59], [8, 62], [9, 58], [10, 17], [11, 2],
        [12, 12], [13, 8], [14, 32], [15, 60], [16, 13], [17, 45], [18, 34], [19, 14], [20, 36], [21, 21],
        [22, 22], [23, 39], [24, 23], [25, 25], [26, 26], [27, 20], [28, 1], [29, 33], [30, 46], [31, 55],
        [32, 35], [33, 24], [34, 57], [35, 19], [36, 53], [37, 37], [38, 38], [39, 5], [40, 30], [41, 41],
        [42, 42], [43, 18], [44, 47], [45, 27], [46, 9], [47, 44], [48, 51], [49, 7], [50, 49], [51, 63], [52, 28],
        [53, 43], [54, 54], [55, 52], [56, 31], [57, 10], [58, 29], [59, 11], [60, 3], [61, 16], [62, 50],
        [63, 48]]
    let arr = bytes2bin(input)
    let arr1 = Array.from({
        length: arr.length
    }).map(d => 0);
    for (let i in arr1) {
        arr1[table[i][1]] = arr[table[i][0]]
    }
    return bin2bytes(arr1)
}

function sub_4B7C(input) {
    let table = [[0, 6, 0, 1], [1, 4, 1, 0], [2, 5, 0, 1], [3, 0, 0, 1], [4, 2, 0, 1], [5, 3, 0, 1], [6, 1, 1, 0],
        [7, 7, 0, 1]]
    let arr = bytes2bin(input)
    let arr1 = [0, 0, 0, 0, 0, 0, 0, 0]
    for (var i in arr1) {
        if (arr[i] == 0) {
            arr1[table[i][1]] = table[i][2];
        }
        else {
            arr1[table[i][1]] = table[i][3];
        }
    }
    return bin2bytes(arr1)
}

function sub_12510(input) {
    let buffer = []
    for (let i = 0; i<input.length; i += 8) {
        let j = input.slice(i, i + 8)
        if (j.length == 1) {
            buffer = buffer.concat(sub_4B7C(j))
        }
        else {
            buffer = buffer.concat(sub_10EA4(j))
        }
    }
    return buffer
}

function sub_126AC(input, random1, random2) {
    let arr = [0, 1, 2]
    if (random2 == 1) {
        arr = [1, 2, 0]
    }
    if (random2 == 2) {
        arr = [2, 0, 1]
    }
    let version = arr[random1]
    if (version == 0) {
        return sub_12510(input)
    }
    if (version == 2) {
        return sub_12ECC(input)
    }
}

class jdSign {
    constructor(params = {}) {
        this.access = 0
        if (process.communal.QITOQITO_JDSIGN) {
            this.access = 1
            this.signUrl = process.communal.QITOQITO_JDSIGN
        }
        else if (process.communal.JD_SIGN_API) {
            this.access = 2
            this.signUrl = process.communal.JD_SIGN_API
        }
        else if (process.communal.JD_SIGN_KRAPI) {
            this.access = 1
            this.signUrl = process.communal.JD_SIGN_KRAPI
        }
    }

    verify() {
        return this.access ? true : false
    }

    async curl(p) {
        let array = [
            [
                0,
                0
            ],
            [
                0,
                2
            ],
            [
                1,
                1
            ],
            [
                1,
                2
            ],
            [
                2,
                0
            ],
            [
                2,
                1
            ]
        ]
        if (p.form) {
            var form = p.form
        }
        else {
            var spl = p.url.split('?');
            var form = spl[1]
        }
        let q = process.communal.query(form, '&', 'split')
        let sortKeys = ['appid', 'body', 'client', "clientVersion", 'functionId'];
        let dict = {}
        for (let i of sortKeys) {
            if (q[i]) {
                dict[i] = q[i]
            }
        }
        if (p.url.includes("functionId=") && !form.includes("functionId=")) {
            let functionId = process.communal.match(/(functionId=\w+)/, p.url)
            dict.functionId = functionId
        }
        dict.client = "apple"
        dict.clientVersion = "10.0.10"
        let random1, random2
        [random1, random2] = array[Math.floor((Math.random() * array.length))]
        let sv = `1${random1}${random2}`
        let st = new Date().getTime();
        let body = typeof (dict.body) == 'string' ? dict.body : JSON.stringify(dict.body);
        let enc = new Buffer.from(body).toString('latin1')
        let uuid = CryptoJS.MD5(new Date().getTime()).toString().substring(0, 30 - `${dict.functionId}${enc}`.length % 8)
        let input = `functionId=${dict.functionId}&body=${enc}&uuid=${uuid}&client=${dict.client}&clientVersion=${dict.clientVersion}&st=${st}&sv=${sv}`
        let ret_bytes = sub_126AC(input, random1, random2);
        let base = new Buffer.from(ret_bytes).toString('base64')
        dict.sv = sv
        dict.st = st
        dict.sign = CryptoJS.MD5(base).toString()
        if (p.form) {
            p.form = Object.keys(dict).map(function(key) {
                return encodeURIComponent(key) + "=" + encodeURIComponent(dict[key]);
            }).join("&")
        }
        else {
            p.url = `https://api.m.jd.com/api?${Object.keys(dict).map(function(key) {
                return encodeURIComponent(key) + "=" + encodeURIComponent(dict[key]);
            }).join("&")}`
        }
        return await process.communal.curl(p)
    }

    async jdCurl(p) {
        if (!p.headers) {
            p.headers = {
                'user-agent': 'JD4iPhone/168960%20(iPhone;%20iOS;%20Scale/3.00);jdmall;iphone;version/12.3.1;build/168960;network/wifi;screen/1170x2532;os/15.1.1',
                referer: 'https://m.jd.com'
            }
        }
        else if (p.headers && !p.headers['user-agent']) {
            p.headers['user-agent'] = process.communal.userAgents()['jd']
        }
        let append = p.append ? p.append : ''
        if (this.access) {
            if (p.form) {
                var form = p.form
            }
            else {
                var spl = p.url.split('?');
                var form = spl[1]
            }
            if (this.access == 1) {
                let q = process.communal.query(form, '&', 'split')
                let sortKeys = ['appid', 'body', 'client', "clientVersion", 'functionId'];
                let st = sortKeys.filter(d => q[d]).map(i => `${i}=${q[i]}`).join('&')
                if (p.url.includes("functionId=") && !form.includes("functionId=")) {
                    let functionId = process.communal.match(/(functionId=\w+)/, p.url)
                    st += `&${functionId}`
                }
                let cs1 = await this.wget({
                        'url': this.signUrl,
                        'form': st
                    }
                )
                if (process.communal.haskey(cs1, 'data.sign')) {
                    if (p.form) {
                        p.form = `functionId=${cs1.data.functionId}&${cs1.data.convertUrl}&${append}`
                    }
                    else {
                        form = `functionId=${cs1.data.functionId}&${cs1.data.convertUrl}&${append}`
                        p.url = `${spl[0]}?${form}`
                    }
                    return await process.communal.curl(p)
                }
            }
            else if (this.access == 2) {
                var dict = process.communal.query(form, '&', 'split')
                if (dict.functionId) {
                    dict.fn = dict.functionId
                }
                else if (p.url.includes("functionId=")) {
                    let functionId = process.communal.match(/functionId=(\w+)/, p.url)
                    dict.fn = functionId
                }
                let cs2 = await this.wget({
                        'url': this.signUrl,
                        json: dict
                    }
                )
                if (process.communal.haskey(cs2, 'sign')) {
                    if (p.form) {
                        p.form = `${cs2.params}&${append}`
                    }
                    else {
                        p.url = `${spl[0]}?${cs2.params}&${append}`
                    }
                    return await process.communal.curl(p)
                }
            }
        }
        else {
            return {}
        }
    }

    async wget(params) {
        if (typeof (params) != 'object') {
            params = {
                'url': params
            }
        }
        let method = params.method || ''
        if (params.hasOwnProperty('authorization')) {
            params.headers.authorization = params.authorization
        }
        if (params.hasOwnProperty('form')) {
            params.method = 'POST'
        }
        if (params.hasOwnProperty('json')) {
            params.method = 'POST'
        }
        if (params.hasOwnProperty('body')) {
            if (typeof (params.body) == 'object') {
                params.body = JSON.stringify(params.body)
            }
            params.method = 'POST'
        }
        if (method) {
            params.method = method.toUpperCase()
        }
        return new Promise(resolve => {
            request(params, async (err, resp, data) => {
                try {
                    data = process.communal.jsonParse(data)
                } catch (e) {
                    // console.log(e, resp)
                } finally {
                    resolve(data);
                }
            })
        })
    }
}

module.exports = jdSign
