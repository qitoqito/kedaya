const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东大牌集合任务"
        // this.cron = "12 0,13 * * *"
        this.task = 'local'
        this.import = ['jdUrl']
        this.verify = 1
    }

    async prepare() {
        this.assert(this.profile.custom, '请正确填写custom')
        for (let i of this.unique(this.getValue('custom'))) {
            this.shareCode.push({
                actId: i
            })
        }
    }

    async main(p) {
        let cookie = p.cookie;
        try {
            let isvObfuscator = await this.curl(this.modules.jdUrl.app('isvObfuscator', {
                "url": `https://jinggengjcq-isv.isvjcloud.com`,
                "id": ""
            }, 'post', cookie))
            let gifts = 0
            let load = await this.curl({
                    'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/openCardNew/activity_load?mix_nick=`,
                    'json': {
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "appkey": "51B59BB805903DA4CE513D29EC448375",
                                "m": "POST",
                                "timestamp": this.timestamp,
                                // "userId": "10299181"
                            },
                            "admJson": {
                                "actId": p.inviter.actId,
                                // "userId": "10299181",
                                "jdToken": isvObfuscator.token,
                                "source": "01",
                                "method": "/openCardNew/activity_load",
                                "buyerNick": ""
                            }
                        }
                    },
                }
            )
            let buyerNick = load.data.data.buyerNick
            let userId = load.data.data.missionCustomer.userId
            let state = await this.curl({
                    'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/openCardNew/mission/complete/state?mix_nick=${buyerNick}`,
                    'json': {
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "appkey": "51B59BB805903DA4CE513D29EC448375",
                                "m": "POST",
                                "timestamp": this.timestamp,
                                userId
                            },
                            "admJson": {
                                "actId": p.inviter.actId,
                                userId,
                                "method": "/openCardNew/mission/complete/state",
                                buyerNick
                            }
                        }
                    }
                }
            )
            for (let i of state.data.data) {
                if (!i.isComplete) {
                    if (['viewShop', 'viewGoods'].includes(i.type)) {
                        console.log(i.missionName)
                        let json = {
                            "jsonRpc": "2.0",
                            "params": {
                                "commonParameter": {
                                    "appkey": "51B59BB805903DA4CE513D29EC448375",
                                    "m": "POST",
                                    "timestamp": this.timestamp,
                                    userId
                                },
                                "admJson": {
                                    "actId": p.inviter.actId,
                                    "missionType": i.type,
                                    "method": "/openCardNew/complete/mission",
                                    userId,
                                    buyerNick
                                }
                            }
                        }
                        for (let j = 0; j<(i.dayTop - (i.hasGotNum || 0)); j++) {
                            let s = await this.curl({
                                    'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/openCardNew/complete/mission?mix_nick=${buyerNick}`,
                                    json
                                }
                            )
                            let remark = this.haskey(s, 'data.data.remark') || ''
                            let num = this.match(/(\d+)个京豆/, remark)
                            if (num) {
                                gifts += parseInt(num)
                            }
                            console.log(remark)
                            await this.wait(this.rand(1000, 2000))
                        }
                    }
                }
                else {
                    console.log(`任务完成:`, i.missionName)
                }
            }
            if (gifts) {
                this.print(`获得京豆: ${gifts}`, p.user)
            }
            else {
                console.log(`什么也没有`)
            }
        } catch (e) {
        }
    }
}

module.exports = Main;
