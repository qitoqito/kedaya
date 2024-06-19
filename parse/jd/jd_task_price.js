const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东保价"
        this.cron = "38 */10 * * *"
        this.import = ['jdAlgo']
        this.task = 'local'
        this.interval = 5000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': 'd2f64',
            'type': 'web',
            "version": "3.1",
        })
    }

    async main(p) {
        let cookie = p.cookie
        let s = await this.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=mlproprice_skuOnceApply_jsf&appid=price_protection&loginType=2&body={"onceBatchId":"","couponConfirmFlag":null,"type":"25"}&client=apple&clientVersion=&x-api-eid-token=jdd03C3HUEKC6G2V5WV6SOXJV5E4J2ILKIIHLPARTU7DKUSMS72ICFUVMMF7ZVZXDON6VLTUCVU2GNZ2RZRMVIDXGF2FBMUAAAAMQFQIBMFAAAAAACIQ46Z6H2VWO6MX&h5st=&t=1718726274981`,
                cookie
            }
        )
        if (this.haskey(s, 'data.succAmount')) {
            console.log(`保价: ${s.data.succAmount}`, p.user)
        }
        else {
            console.log(this.haskey(s, 'data.onceApplyNoSuccessTips') || s)
        }
    }
}

module.exports = Main;
