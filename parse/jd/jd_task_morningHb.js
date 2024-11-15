const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东微信早起签到"
        this.cron = `${this.rand(0, 59)} ${this.rand(4, 6)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo', 'logBill']
        this.interval = 2000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: 'latest',
            type: 'xcx',
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let sign = await this.algo.curl({
                'url': `https://api.m.jd.com/silverHair_morningHbReward?g_ty=ls&g_tk=1722006734`,
                'form': `loginType=11&clientType=wxapp&client=apple&clientVersion=9.22.230&build=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&lang=zh_CN&uuid=&functionId=silverHair_morningHbReward&t=1731627662669&body=%7B%7D&appid=hot_channel&d_name=`,
                cookie,
                algo: {
                    appId: '4cc68'
                },
                headers: {
                    referer: 'https://servicewechat.com/wx91d27dbf599dff74/770/page-frame.html',
                    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.52(0x18003426) NetType/WIFI Language/zh_CN',
                    wqreferer: 'http://wq.jd.com/wxapp/pages/marketing/entry_task/sliver',
                    'X-Rp-Client': 'mini_2.1.0'
                }
            }
        )
        if (this.haskey(sign, 'data.discount')) {
            if (sign.data.rewardType == 1) {
                this.print(`红包: ${sign.data.discount}`, p.user)
            }
            else {
                console.log(sign.data)
            }
        }
        else {
            console.log(this.haskey(sign, 'message') || sign)
        }
    }
}

module.exports = Main;
