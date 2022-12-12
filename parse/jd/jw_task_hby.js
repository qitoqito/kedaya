const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东微信红包雨"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': 'd983f',
            'type': 'wechat',
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action?g_ty=ls&g_tk=1871805617`,
                'form': `functionId=wxsport_hbrain_draw&body={}&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=7.24.90&build=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&d_name=&lang=zh_CN&_ste=2`,
                cookie,
                ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001f2a) NetType/WIFI Language/zh_CN",
                referer: "https://servicewechat.com/wx91d27dbf599dff74/673/page-frame.html"
            }
        )
        if (this.haskey(s, 'data.prizeInfo.hbPrize')) {
            this.print(`红包: ${s.data.prizeInfo.hbPrize.discount}`, p.user)
        }
        else {
            console.log(this.haskey(s, 'message') || s)
        }
    }
}

module.exports = Main;
