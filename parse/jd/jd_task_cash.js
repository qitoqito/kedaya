const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东领现金"
        this.cron = "26 8,18 * * *"
        this.help = 2
        this.task = 'local'
        // this.thread = 6
        this.import = ['jdUrl']
        // this.loop = 3
    }

    async main(p) {
        let cookie = p.cookie;
        let sign = await this.curl(this.modules.jdUrl.app('cash_sign', {
            "remind": 0,
            "inviteCode": "",
            "type": 0,
            "breakReward": 0
        }, 'post', cookie))
        console.log('签到:', this.haskey(sign, 'data.bizMsg'))
        if (this.haskey(sign, 'data.bizMsg').includes('您已退出登录')) {
            console.log("cookie失效")
            return
        }
        for (let n = 0; n<6; n++) {
            let z = 0
            let s = await this.curl(this.modules.jdUrl.app('cash_homePage', {}, 'post', cookie))
            for (let i of this.haskey(s, 'data.result.taskInfos')) {
                if (i.times != i.doTimes) {
                    if (i.jump) {
                        z = 1
                        let k = await this.curl(this.modules.jdUrl.app('cash_doTask', {
                            "type": i.type,
                            "taskInfo": i.jump.params.url || i.jump.params.skuId || i.jump.params.path
                                || i.jump.params.shoId
                        }, 'post', cookie))
                        console.log(i.name, k.data.bizMsg)
                    }
                    else {
                        let k = await this.curl(this.modules.jdUrl.app('cash_doTask', {
                            "type": i.type,
                            "taskInfo": "1"
                        }, 'post', cookie))
                        console.log(i.name, k.data)
                    }
                }
                else if (n == 0) {
                    console.log(`任务已完成: ${i.name}`)
                }
            }
            if (!this.haskey(s, 'data.result.taskInfos')) {
                console.log(`没有获取到任务列表,可能脸黑`)
            }
            if (z == 0) {
                break
            }
        }
    }
}

module.exports = Main;
