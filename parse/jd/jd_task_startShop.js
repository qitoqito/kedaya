const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东超市盲盒"
        this.cron = "6 0 * * *"
        this.help = 2
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.linkId = this.profile.custom || "qHqXOx2bvqgFOzTH_-iJoQ"
        this.algo = new this.modules.jdAlgo({
            type: "lite", "version": "3.1", 'appId': '568c6'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let daily = await this.algo.curl({
                'url': `https://api.m.jd.com/?functionId=starShopDraw&body={"linkId":"${this.linkId}","isDailyRaffle":true}&appid=activities_platform&t=1667131611830&client=ios&clientVersion=4.2.0&cthr=1&build=1217&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=13.7&partner=`,
                cookie
            }
        )
        if (this.haskey(daily, 'data.prizeValue')) {
            this.print(`获得: ${daily.data.prizeValue}${daily.data.prizeConfigName}`, p.user)
        }
        else {
            console.log(this.haskey(daily, 'errMsg'))
        }
        let s = await this.curl({
                'url': `https://api.m.jd.com/?functionId=apTaskList&body={"linkId":"${this.linkId}"}&_t=1654226708008&appid=activities_platform&cthr=1`,
                // 'form':``,
                cookie
            }
        )
        this.assert(this.haskey(s, 'data'), '没有获取到数据')
        for (let i of s.data) {
            if (i.taskLimitTimes != i.taskDoTimes) {
                var itemId = ""
                if (i.taskType == 'BROWSE_CHANNEL') {
                    let detail = await this.curl({
                            'url': `https://api.m.jd.com/`,
                            'form': `functionId=apTaskDetail&body={"taskType":"${i.taskType}","taskId":${i.id},"linkId":"${this.linkId}","channel":4}&appid=activities_platform&t=1662021506364&client=ios&clientVersion=11.2.2&cthr=1`,
                            cookie
                        }
                    )
                    let taskItemList = this.haskey(detail, 'data.taskItemList')
                    if (taskItemList) {
                        let end = this.end(taskItemList)
                        itemId = end.itemId
                    }
                }
                var d = await this.curl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=apDoTask&body={"taskType":"${i.taskType}","taskId":${i.id},"linkId":"${this.linkId}","channel":4,"itemId":"${itemId}"}&_t=1654226707654&appid=activities_platform&cthr=1`,
                        cookie
                    }
                )
                console.log("正在执行:", i.taskTitle, this.haskey(d, 'data.finished'))
            }
            else {
                console.log('任务已经完成:', i.taskTitle)
            }
        }
        for (let i of Array(5)) {
            let draw = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=starShopDraw&body={"linkId":"${this.linkId}"}&_t=1655468068076&appid=activities_platform&client=ios&clientVersion=11.0.6&cthr=1&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=`,
                    // 'form':``,
                    cookie
                }
            )
            console.log(draw)
            let code = this.haskey(draw, 'code')
            if (this.haskey(draw, 'data')) {
                this.print(`${draw.data.prizeConfigName} : ${draw.data.prizeValue}`, p.user)
            }
            else if (code == 600012 || code == 600007) {
                break
            }
            else {
                console.log(`什么也没有抽到`)
            }
        }
    }
}

module.exports = Main;
