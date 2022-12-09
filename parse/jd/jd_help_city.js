const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "城城分现金助力"
        this.cron = "6 6 6 6 6"
        this.help = '3'
        this.import = ['jdRisk', 'jdUrl']
    }

    async prepare() {
        this.risk = new this.modules.jdRisk()
        for (let i of this.cookies['help']) {
            let params = {
                'url': 'https://api.m.jd.com/client.action',
                'form': 'functionId=city_getHomeDatav1&appid=signed_wh5&body={"lbsCity":"","realLbsCity":"","inviteId":"","headImg":"","userName":"","taskChannel":"1","location":"","safeStr":""}&osVersion=15.1.1&screen=390*844&networkType=wifi&timestamp=1670575798295&d_brand=iPhone&d_model=iPhone13,3&client=iOS&clientVersion=11.3.0&partner=&build=168341&openudid=7b01d4690ef13716984dcfcf96068f36b41f6c51',
                cookie: i
            }
            let s = await this.curl(params)
            try {
                this.shareCode.push(this.compact(s.data.result.userActBaseInfo, ['inviteId', 'nickname']))
            } catch {
            }
        }
    }

    async main(p) {
        let cookie = p.cookie
        console.log(`正在给 ${p.inviter.nickname} 助力`)
        let params = {
            'url': 'https://api.m.jd.com/client.action',
            'form': `functionId=city_getHomeDatav1&appid=signed_wh5&body={"lbsCity":"16","realLbsCity":"1341","inviteId":"${p.inviter.inviteId}","headImg":"","userName":"","taskChannel":"1"}&osVersion=15.1.1&screen=390*844&networkType=wifi&timestamp=1670575798295&d_brand=iPhone&d_model=iPhone13,3&client=iOS&clientVersion=11.3.0&partner=&build=168341&openudid=7b01d4690ef13716984dcfcf96068f36b41f6c51`,
            cookie,
        }
        let s = await this.curl(params)
        let data = this.haskey(s, 'data.result.toasts')
        if (data) {
            let msg = this.haskey(data, '0.msg')
            if (msg) {
                console.log(msg)
                if (msg.includes("用完")) {
                    this.complete.push(p.index)
                }
            }
            else {
                console.log(data)
            }
        }
        else {
            console.log("助力失败")
        }
    }
}

module.exports = Main;
