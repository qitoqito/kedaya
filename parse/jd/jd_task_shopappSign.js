const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东左侧店铺抽奖"
        this.cron = "40 0,22 * * *"
        this.task = 'local'
    }

    async prepare() {
        this.code = [
            `functionId=sign&body=%7B%22vendorId%22%3A%221000384306%22%2C%22sourceRpc%22%3A%22shop_app_sign_home%22%7D&uuid=ee1ab6b0cbc40569f43c1c7d5&client=apple&clientVersion=10.0.10&st=1646574191229&sv=100&sign=6a31bae4fb168e1734c8f386828f3ffe`,
            `functionId=sign&body=%7B%22vendorId%22%3A%221000002690%22%2C%22sourceRpc%22%3A%22shop_app_sign_home%22%7D&uuid=c9f5b086fb1400180decea5c1&client=apple&clientVersion=10.0.10&st=1646574191232&sv=111&sign=1bca2f55108f009c0835668c1b9533f5`
        ]
        if (this.custom) {
            this.code = this.getValue('custom')
        }
        else if (this.expand) {
            this.code = [...this.getValue('expand'), ...this.code]
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let gifts = []
        for (let form of this.code) {
            let s = await this.curl({
                    url: 'https://api.m.jd.com/client.action',
                    form,
                    cookie
                }
            )
            if (this.haskey(s, 'result.signReward')) {
                console.log(s.result.signReward.name)
                gifts.push(s.result.signReward.name)
            }
            else {
                console.log("什么也没有")
            }
            await this.wait(500)
        }
        if (gifts.length) {
            this.notices(gifts.join("\n"), p.user)
        }
    }
}

module.exports = Main;
