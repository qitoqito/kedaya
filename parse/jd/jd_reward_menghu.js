const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东萌虎兑换"
        // this.cron = "12 21 * * *"
        this.help = 2
        this.task = 'local'
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/api`,
                'form': `appid=china-joy&functionId=collect_bliss_cards_prod&body={"apiMapping":"/api/carveUp/receivePrize"}&t=1643630869103&loginType=2`,
                cookie
            }
        )
        console.log(s.data)
        if (this.haskey(s, 'data.jdNums')) {
            this.notices(`获得奖励: ${this.dumps(s.data.jdNums)}`, p.user)
        }
    }
}

module.exports = Main;
