const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东保价"
        this.cron = "38 */10 * * *"
        this.import = ['jdAlgo']
        this.task = 'local'
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': 'd2f64',
            'type': 'web',
            "version": "3.1",
        })
    }

    async main(p) {
        let cookie = p.cookie
        let body = {
            sid: "",
            type: "25",
            forcebot: "",
        }
        let s = {}
        for (let i = 0; i<3; i++) {
            let t = new Date().getTime()
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/api`,
                    "form": `appid=siteppM&functionId=siteppM_skuOnceApply&forcebot=&t=${t}&body=${this.dumps({
                        sid: "",
                        type: "25",
                        forcebot: "",
                    })}`,
                    cookie,
                    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0',
                    "referer": "https://msitepp-fm.jd.com/",
                }
            )
            console.log(s)
            if (s.flag == true) {
                break
            }
            else if (s.responseMessage == '10分钟内只能申请一次' || s.responseMessage == '不要频繁点我，稍等一下再试吧') {
                console.log(s.responseMessage)
                return
            }
        }
        console.log("等待25s,获取保价订单中");
        await this.wait(25000)
        let p2 = {
            'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_appliedSuccAmount&forcebot=&t=${this.timestamp}`,
            'form': 'body={"sid":"","type":"25","forcebot":"","num":15}',
            cookie: p.cookie
        }
        let s2 = await this.curl(p2)
        console.log(p.user, s2)
        let text
        if (s2.flag) {
            text = `本次保价金额: ${s2.succAmount}`
            this.notices(text, p.user)
        }
        else {
            text = "本次无保价订单"
        }
        console.log(p.user, text)
    }
}

module.exports = Main;
