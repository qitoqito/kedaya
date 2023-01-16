const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东击鼓迎春"
        this.cron = ["1 0 1-4,14-20,22-31 * *", "1 0,20-23 21 * *", "1 0,20 5 * *"]
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            appId: "5a721",
            type: 'app',
            version: "400"
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=party_welcome&body={"area":"0_0_0_0","uuid":"${this.uuid(16, 'nc')}"}&client=apple&clientVersion=11.4.2&appid=signed_wh5&build=168451&osVersion=13.7&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&partner=&t=1673853464447`,
                cookie
            }
        )
        if (this.haskey(s, 'data.result.award')) {
            for (let i of this.haskey(s, 'data.result.award')) {
                if (i.type == 2) {
                    this.print(`红包: ${i.amount}`, p.user)
                }
                else if (i.type == 1) {
                    this.print(`优惠券: ${i.amount} ${i.usageThreshold}`, p.user)
                }
                else if (i.type == 5) {
                    console.log(p.user, `祝福语: ${i.text1} ${i.text2}`)
                }
                else {
                    this.print(`未知类型: ${i.ype}`, p.user)
                    console.log("获得", i)
                }
            }
        }
        else {
            console.log(this.haskey(s, 'data.bizMsg') || s)
        }
        for (let i of Array(3)) {
            let r = await this.algo.curl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=party_lottery&body={"area":"0_0_0_0","uuid":"${this.uuid(16, 'nc')}"}&client=apple&clientVersion=11.4.2&appid=signed_wh5&build=168451&osVersion=13.7&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&partner=&t=1673853500510`,
                    cookie
                }
            )
            if (this.haskey(r, 'data.bizMsg').includes("用完")) {
                break
            }
            if (this.haskey(r, 'data.result.award')) {
                for (let i of this.haskey(r, 'data.result.award')) {
                    if (i.type == 2) {
                        this.print(`红包: ${i.amount}`, p.user)
                    }
                    else if (i.type == 1) {
                        this.print(`优惠券: ${i.amount} ${i.usageThreshold}`, p.user)
                    }
                    else if (i.type == 5) {
                        console.log(p.user, `祝福语: ${i.text1} ${i.text2}`)
                    }
                    else {
                        this.print(`未知类型: ${i.ype}`, p.user)
                        console.log("获得", i)
                    }
                }
            }
            else {
                console.log(this.haskey(s, 'data.bizMsg') || s)
            }
            await this.wait(1000)
        }
    }
}

module.exports = Main;
