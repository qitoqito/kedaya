const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东微信签到"
        this.cron = "6 6 * * *"
        this.task = 'local'
    }

    async main(p) {
        let cookie = p.cookie;
        let dict = this.haskey(this.userDict, `${this.userPin(cookie)}`) || {}
        if (dict.wq_skey || dict.wqskey) {
            let wqskey = dict.wqskey || `wq_skey=${dict.wq_skey}; wq_uin=${dict.wq_uin};`
            let draw = await this.curl({
                    'url': `https://wq.jd.com/activep3/singjd/DrawQuery?share_token=&g_ty=ls&g_tk=628500224`,
                    cookie: wqskey,
                    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001f37) NetType/WIFI Language/zh_CN',
                    referer: 'https://wqsh.jd.com/'
                }
            )
            console.log(draw)
        }
        else {
            console.log('没有wqskey,跳过运行...')
        }
    }
}

module.exports = Main;
