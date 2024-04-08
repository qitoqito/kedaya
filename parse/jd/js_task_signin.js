const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东极速版签到提现"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 10)},${this.rand(13, 22)} * * *`
        this.import = [
            'jdUrl', 'jdAlgo'
        ]
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: 'lite', 'appId': "15097",
            version: "4.4"
            // headers: this.options.headers
        })
        this.linkId = '9WA12jYGulArzWS7vcrwhw'
    }

    async main(p) {
        let cookie = p.cookie
        let s = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=apSignIn_day&body={"linkId":"${this.linkId}","serviceName":"dayDaySignGetRedEnvelopeSignService","business":1}&t=1636875375462&appid=activities_platform&client=H5&clientVersion=1.0.0`,
                cookie,
                algo: {
                    'appId': "15097",
                }
            }
        )
        console.log("签到:", this.haskey(s, 'data.retMessage') || this.haskey(s, 'message') || "签到中")
        let list = await this.algo.curl({
                'url': `https://api.m.jd.com/?functionId=signPrizeDetailList&body={"linkId":"${this.linkId}","serviceName":"dayDaySignGetRedEnvelopeSignService","business":1,"pageSize":20,"page":1}&t=1656343475204&appid=activities_platform&client=H5&clientVersion=1.0.0`,
                // 'form':``,
                cookie
            }
        )
        for (let i of this.haskey(list, 'data.prizeDrawBaseVoPageBean.items')) {
            if (i.prizeType == 4 && i.prizeStatus == 0) {
                let sss = await this.algo.curl({
                        'url': 'https://api.m.jd.com/',
                        form: `functionId=apCashWithDraw&body={"linkId":"${this.linkId}","businessSource":"DAY_DAY_RED_PACKET_SIGN","base":{"prizeType":${i.prizeType},"business":"dayDayRedPacket","id":${i.id},"poolBaseId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeBaseId":${i.prizeBaseId}}}&t=1656343479471&appid=activities_platform&client=H5&clientVersion=1.0.0`,
                        cookie
                    }
                )
                console.log(p.user, this.haskey(sss, 'data.message'));
                this.notices(`提现${i.prizeValue} ${this.haskey(sss, 'data.message')}`, p.user)
            }
        }
        let bagList = await this.curl({
                'url': `https://api.m.jd.com/?functionId=superRedBagList&body={"pageNum":1,"pageSize":10,"associateLinkId":"dLrrEKJW8fVBcHB62TjiIQ","business":"SpringFestival","linkId":"${this.linkId}","inviter":""}&t=1661786884225&appid=activities_platform&client=ios&clientVersion=3.9.6&cthr=1&uuid=db953e5e7cc5812dae6b5e45a04201cc4f3e2030&build=1177&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=13.7&partner=&eid=eidI16fe81226asdsrs6k2OTTyOBBbhCfGtXwbK7PBFBEWxOgr9KLEUyLLuTguf4fW8nrXFjtSacDPyb%2FWv6KWmFaBUhrlMiSnB5H42FsBr2f72YyFA4`,
                // 'form':``,
                cookie
            }
        )
        for (let i of this.haskey(bagList, 'data.items')) {
            if (i.prizeType == 4 && i.state == 0) {
                let sss = await this.algo.curl({
                        'url': 'https://api.m.jd.com/',
                        form: `functionId=apCashWithDraw&body={"businessSource":"NONE","base":{"id":${i.id},"business":null,"poolBaseId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeBaseId":${i.prizeBaseId},"prizeType":${i.prizeType},"activityId":"${i.activityId}"},"linkId":"${this.linkId}","inviter":""}&t=1661787172784&appid=activities_platform&client=ios&clientVersion=3.9.6&cthr=1&uuid=db953e5e7cc5812dae6b5e45a04201cc4f3e2030&build=1177&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=13.7&partner=&eid=eidI16fe81226asdsrs6k2OTTyOBBbhCfGtXwbK7PBFBEWxOgr9KLEUyLLuTguf4fW8nrXFjtSacDPyb%2FWv6KWmFaBUhrlMiSnB5H42FsBr2f72YyFA4`,
                        cookie
                    }
                )
                this.print(`提现${i.amount} ${this.haskey(sss, 'data.message')}`, p.user)
            }
        }
    }
}

module.exports = Main;
