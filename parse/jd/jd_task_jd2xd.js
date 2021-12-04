const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东7天内过期京豆兑换成喜豆"
        this.cron = "12 23 */2 * *"
        this.help = 2
        this.task = 'all'
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': 'https://wq.jd.com/activep3/singjd/queryexpirejingdou?_=1637926089761&g_login_type=0&callback=jsonpCBKC&g_tk=353098972&g_ty=ls&sceneval=2&g_login_type=1',
                cookie
            }
        )
        let sum = 0
        for (let i of s?.expirejingdou || []) {
            sum += i.expireamount
        }
        if (sum) {
            let ss = await this.curl({
                'url': `https://m.jingxi.com/deal/mactionv3/jd2xd?use=${sum}&pingouchannel=1&bizkey=pingou&g_ty=ls&sceneval=2&g_login_type=1`,
                cookie
            })
            console.log(`成功兑换 ${sum}个喜豆`)
            this.notices(`成功兑换 ${sum}个喜豆`, p.user)
        }
        else {
            console.log("最近7天没有过期京豆")
        }
    }
}

module.exports = Main;
