const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东极速版超级摇一摇"
        this.cron = "5 0,13 * * *"
        this.help = 2
        this.task = 'local'
        this.thread = 6
        this.import = [
            'jdAlgo'
        ]
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: 'lite', 'appId': '6e8d7',
        })
    }

    async main(p) {
        let cookie = p.cookie;
        for (let i = 0; i<60; i++) {
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=superRedBagDraw&body={"linkId":"DUE8grc3lu-A932miriTFg"}&t=1643040859389&appid=activities_platform`,
                    // 'form':``,
                    cookie
                }
            )
            if (this.haskey(s, 'data.prizeDrawVo')) {
                console.log(p.user, `抽奖获得: ${s.data.prizeDrawVo.prizeDesc} ${s.data.prizeDrawVo.amount}`)
            }
            else {
                console.log(p.user, '什么也没有')
            }
        }
        for (let n = 1; n<4; n++) {
            let l = await this.curl({
                    'url': `https://api.m.jd.com/?functionId=superRedBagList&body={"pageNum":${n},"pageSize":10,"associateLinkId":"DUE8grc3lu-A932miriTFg","business":"SpringFestival","linkId":"Eu7-E0CUzqYyhZJo9d3YkQ","inviter":""}&t=1643042027781&appid=activities_platform`,
                    // 'form':``,
                    cookie
                }
            )
            for (let i of l.data.items) {
                if (i.prizeType == 4 && i.state == 0) {
                    let r = await this.curl({
                            'url': `https://api.m.jd.com/`,
                            'form': `functionId=apCashWithDraw&body={"businessSource":"NONE","base":{"id":${i.id},"business":null,"poolBaseId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeBaseId":${i.prizeBaseId},"prizeType":${i.prizeType},"activityId":"${i.activityId}"},"linkId":"Eu7-E0CUzqYyhZJo9d3YkQ","inviter":""}&t=1643042044178&appid=activities_platform`,
                            cookie
                        }
                    )
                    console.log(p.user, `正在提现:${i.amount}`)
                    this.notices(`提现:${i.amount}`, p.user)
                }
            }
        }
    }
}

module.exports = Main;
