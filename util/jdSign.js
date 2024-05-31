let CryptoJS = require('crypto-js');

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

    async jdCurl(p) {
        p.headers = {
            'user-agent': 'JD4iPhone/168960%20(iPhone;%20iOS;%20Scale/3.00);jdmall;iphone;version/12.3.1;build/168960;network/wifi;screen/1170x2532;os/15.1.1',
            referer: 'https://cjhy-isv.isvjcloud.com/'
        }
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
                let cs1 = await process.communal.curl({
                        'url': this.signUrl,
                        'form': st
                    }
                )
                if (process.communal.haskey(cs1, 'data.sign')) {
                    if (p.form) {
                        p.form = `functionId=${cs1.data.functionId}&${cs1.data.convertUrl}`
                    }
                    else {
                        form = `functionId=${cs1.data.functionId}&${cs1.data.convertUrl}`
                        p.url = `${spl[0]}?${form}`
                    }
                    return await process.communal.curl(p)
                }
            }
            else if (this.access == 2) {
                var dict = process.communal.query(form, '&', 'split')
                dict.fn = dict.functionId
                let cs2 = await process.communal.curl({
                        'url': this.signUrl,
                        json: dict
                    }
                )
                if (process.communal.haskey(cs2, 'sign')) {
                    if (p.form) {
                        p.form = cs2.params
                    }
                    else {
                        p.url = `${spl[0]}?${cs2.params}`
                    }
                    return await process.communal.curl(p)
                }
            }
        }
        else {
            return {}
        }
    }
}

module.exports = jdSign
