const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东天天领豆"
        this.cron = `${this.rand(0, 59)} ${this.rand(6, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.interval = 2000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: "main",
            version: "latest"
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=deliverySign_home&appid=signed_wh5_ihub&body={"activityId":"2925"}&client=apple&clientVersion=13.2.8&d_model=&osVersion=15.1.1`,
                cookie,
                algo: {
                    appId: 'e88fd'
                }
            }
        )
        if (this.haskey(home, 'data.result.bubbleList')) {
            for (let i of home.data.result.bubbleList) {
                if (i.status == 1) {
                    let sign = await this.algo.curl({
                            'url': `https://api.m.jd.com/`,
                            'form': `functionId=deliverySign_sign&appid=signed_wh5_ihub&body={"activityId":"2925"}&client=apple&clientVersion=13.2.8&d_model=&osVersion=15.1.1`,
                            cookie,
                            algo: {
                                appId: 'e88fd'
                            }
                        }
                    )
                    if (this.haskey(sign, 'data.result.value')) {
                        this.print(`京豆: ${sign.data.result.value}`, p.user)
                    }
                    else {
                        console.log(this.haskey(sign, 'data.bizMsg') || sign)
                    }
                    let reward = await this.algo.curl({
                            'url': `https://api.m.jd.com/`,
                            'form': `functionId=deliverySign_continue_award&appid=signed_wh5_ihub&body={"activityId":"2925"}&client=apple&uuid=674ce0d97511f5ed054c3dc0af093b3b245ab68d&clientVersion=13.2.8&d_model=&osVersion=15.1.1`,
                            cookie, algo: {
                                appId: 'e88fd'
                            }
                        }
                    )
                    if (this.haskey(reward, 'data.result.value')) {
                        this.print(`京豆: ${reward.data.result.value}`, p.user)
                    }
                }
                else {
                    console.log("暂不可做:", i.text)
                }
            }
        }
        else {
            console.log("没有获取到数据...")
        }
    }
}

module.exports = Main;
