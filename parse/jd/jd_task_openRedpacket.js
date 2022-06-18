const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东热爱奇旅开红包"
        this.cron = "12 12 12 12 12"
        this.task = 'local'
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=promote_mainDivideRedPacket`,
                'form': `functionId=promote_mainDivideRedPacket&client=m&clientVersion=-1&appid=signed_wh5&body={}`,
                cookie
            }
        )
        if (this.haskey(s, 'data.result.value')) {
            this.print(`分红: ${s.data.result.num} 获得: ${s.data.result.value}`, p.user)
        }
        else {
            console.log(this.haskey(s, 'data.bizMsg') || '什么也没有')
        }
    }
}

module.exports = Main;
