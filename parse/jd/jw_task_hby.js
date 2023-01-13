const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东微信红包雨"
        this.cron = "6 10,20,22 * * *"
        this.help = 2
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            appId: "d983f",
            type: 'wechat',
            vesion: "3.1"
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let show = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=wxsport_hbrain_show&t=1673475423809&body=%7B%7D&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=8.13.90&build=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&d_name=&lang=zh_CN&g_ty=ls&g_tk=1236659202`,
                // 'form':``,
                cookie,
                referer: "https://servicewechat.com/wx91d27dbf599dff74/682/page-frame.html",
                ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001f36) NetType/WIFI Language/zh_CN"
            }
        )
        await this.wait(1000)
        let s = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action?g_ty=ls&g_tk=1236659202`,
                'form': `functionId=wxsport_hbrain_draw&t=1673475434885&body=%7B%7D&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=8.13.90&build=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&d_name=&lang=zh_CN&_ste=2`,
                cookie,
                referer: "https://servicewechat.com/wx91d27dbf599dff74/682/page-frame.html",
                ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001f36) NetType/WIFI Language/zh_CN"
            }
        )
        let info = this.haskey(s, 'data.prizeInfo')
        if (info) {
            if (info.couponPrize) {
                this.print(`优惠券: ${info.couponPrize.useRange} ${info.couponPrize.usageThreshold}-${info.couponPrize.quota}`, p.user)
            }
            if (info.hbPrize) {
                this.print(`红包: ${info.hbPrize.discount}`, p.user)
            }
        }
        else {
            console.log(this.haskey(s, 'message') || "什么也没有")
        }
    }
}

module.exports = Main;
