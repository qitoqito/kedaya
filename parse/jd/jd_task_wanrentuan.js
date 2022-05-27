const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东万人团红包"
        this.cron = "22 0,13 * * *"
        this.task = 'local'
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/`,
                'form': `appid=wh5&clientVersion=1.0.0&functionId=wanrentuan_superise_send&body=undefined&loginType=2&loginWQBiz=interact`,
                cookie
            }
        )
        if (this.haskey(s, 'data.result.hongBaoResult.hongBao.disCount')) {
            console.log(`获得红包: ${s.data.result.hongBaoResult.hongBao.disCount}`)
            this.notices(`获得红包: ${s.data.result.hongBaoResult.hongBao.disCount}`, p.user)
        }
        else {
            console.log("什么也没有")
        }
    }
}

module.exports = Main;
