const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东京豆商城抽京豆"
        this.cron = "24 0,22 * * *"
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': 'c3df5',
            'type': 'web',
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let a = await this.curl({
                'url': `https://api.m.jd.com/api?functionId=pg_channel_page_data&h5st=undefined&body=%7B%22paramData%22%3A%7B%22token%22%3A%2213eb42a7-98cb-4075-abd3-4e065ec8f76b%22%7D%2C%22argMap%22%3A%7B%22raffleConfigId%22%3A17%7D%7D&appid=vipMiddle&lid=&&client=m&clientVersion=11.3.6&screen=375*667&uuid=&osVersion=13.7`,
                // 'form':``,
                cookie
            }
        )
        let actKey = this.haskey(a, "data.floorInfoList.0.floorData.raffleAct.raffleActKey")
        let token = this.haskey(a, "data.floorInfoList.0.token")
        if (actKey && token) {
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/api`,
                    form: `functionId=pg_interact_interface_invoke&body={"floorToken":"${token}","dataSourceCode":"lottery","argMap":{"raffleActKey":"${actKey}"}}&appid=activity_h5&lid=&client=m&clientVersion=11.3.6&screen=375*667&uuid=&osVersion=13.7`,
                    // 'form':``,
                    cookie
                }
            )
            if (this.haskey(s, 'data.beanNumber')) {
                this.print(`京豆: ${s.data.beanNumber}`, p.user)
            }
            else {
                console.log(s)
            }
        }
        else {
            console.log("没有获取到抽奖机数据")
        }
    }
}

module.exports = Main;
