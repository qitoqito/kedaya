const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东左侧店铺抽奖"
        this.cron = "2 0,22 * * *"
        this.task = 'local'
        this.import = ['jdUrl']
        this.readme = `正确填写环境变量 filename_expand=id1|id2`
    }

    async prepare() {
        if (this.custom) {
            this.code = this.getValue('custom')
        }
        else if (this.expand) {
            this.code = [...this.getValue('expand'), ...this.code]
        }
        if (this.code.length<1) {
            console.log("请先填写左侧店铺签到ID")
            this.jump = 1
        }
        this.code = this.unique(this.code)
    }

    async main(p) {
        let cookie = p.cookie;
        let gifts = []
        for (let form of this.code) {
            if (!isNaN(form)) {
                form = this.modules.jdUrl.app('sign', {
                    "vendorId": form.toString(),
                    "sourceRpc": "shop_app_sign_home"
                }).form
            }
            let s = await this.curl({
                    url: 'https://api.m.jd.com/client.action',
                    form,
                    cookie
                }
            )
            console.log(s.result)
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
