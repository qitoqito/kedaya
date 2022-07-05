const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "框架测试"
        this.cron = "6 6 6 6 6"
        this.help = 1
        this.task = 'test'
        this.readme = "这里是测试信息"
    }

    async prepare() {
        if (this.proxy) {
            console.log("proxy检测")
            let ip = await this.curl({
                url: 'https://api.ipify.org/?format=json'
            })
            console.log("外网IP:", ip.ip)
            let tbIp = await this.curl({
                url: 'http://pv.sohu.com/cityjson?',
            })
            console.log("搜狐IP:", this.match(/"cip"\s*:\s*"([^\"]+)"/, tbIp))
            console.log("\n")
        }
        let s = await this.curl({
            'url': 'https://wq.jd.com/activep3/singjd/queryexpirejingdou?_=1637926089761&g_login_type=0&callback=jsonpCBKC&g_tk=353098972&g_ty=ls&sceneval=2&g_login_type=1',
        })
        console.log("JSONP测试,如果输出字典,框架正常")
        console.log(s, "\n")
        console.log("\n")
        console.log("JSON测试,如果输出字典,框架正常")
        let s2 = await this.curl({
            url: 'https://api.m.jd.com/client.action?functionId=queryMaterialProducts&client=wh5'
        })
        console.log(s2)
        for (let cookie of this.cookies['help']) {
            this.shareCode.push({
                user: this.userName(cookie)
            })
        }
    }

    async main(p) {
        let cookie = p.cookie;
        this.print('框架测试', p.user)
        console.log(this.profile)
        if (this.profile.custom) {
            this.print(`custom: ${this.profile.custom}`, p.user)
        }
    }
}

module.exports = Main;
