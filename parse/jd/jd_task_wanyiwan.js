const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东玩一玩"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.interval = 3000
        this.delay = 1000
        this.hint = {
            turnNum: '翻倍奖票数,默认10',
            turnDouble: '翻倍奖票次数,默认1'
        }
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: "4.7",
            type: "main",
            // headers: {
            //     referer: 'https://pro.m.jd.com/mall/active/3fcyrvLZALNPWCEDRvaZJVrzek8v/index.html',
            // }
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=wanyiwan_home&appid=signed_wh5&body=%7B%22outsite%22%3A0%2C%22firstCall%22%3A1%2C%22version%22%3A1%2C%22lbsSwitch%22%3Atrue%7D&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=1.0.0&partner=`,
                cookie,
                algo: {
                    appId: 'c81ad'
                }
            }
        )
        // console.log(home.data.result)
        let result = this.haskey(home, 'data.result')
        // console.log(result)
        if (!result) {
            console.log("没有获取到数据...")
            return
        }
        else if (!result.isLogin) {
            console.log("未登录...")
            return
        }
        if (this.haskey(result, 'signBoard.status', 1)) {
            console.log("已签到...")
        }
        else {
            let sign = await this.wget({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=wanyiwan_sign&appid=signed_wh5&body={"version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=1.0.0`,
                    cookie,
                    algo: {
                        appId: 'd12dd'
                    }
                }
            )
            console.log("签到中...", this.haskey(sign, 'data.result'))
        }
        for (let i of result.taskBoard) {
            if (i.title.includes('下单')) {
            }
            else if (i.title.includes('助力')) {
            }
            else {
                console.log("正在运行:", i.title)
                let d = await this.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=wanyiwan_do_task&appid=signed_wh5&body={"itemId":"${this.haskey(i, 'taskDetail.0.itemId') || 0}","taskType":${i.taskType},"assignmentId":"${i.encryptAssignmentId}","actionType":1,"version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=1.0.0`,
                        cookie,
                        algo: {
                            appId: '89db2'
                        }
                    }
                )
                // console.log(d.data)
                if (i.limitTime) {
                    await this.wait(i.limitTime * 1000)
                }
                let r = await this.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=wanyiwan_do_task&appid=signed_wh5&body={"itemId":"${this.haskey(i, 'taskDetail.0.itemId') || 0}","taskType":${i.taskType},"assignmentId":"${i.encryptAssignmentId}","actionType":0,"version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=1.0.0`,
                        cookie,
                        algo: {
                            appId: '89db2'
                        }
                    }
                )
                // console.log(r.data)
                let a = await this.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=wanyiwan_task_receive_award&appid=signed_wh5&body={"taskType":${i.taskType},"assignmentId":"${i.encryptAssignmentId}","version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=1.0.0`,
                        cookie,
                        algo: {
                            appId: 'd12dd'
                        },
                        // referer: 'https://pro.m.jd.com/mall/active/3fcyrvLZALNPWCEDRvaZJVrzek8v/index.html'
                    }
                )
                console.log(a.data)
            }
        }
        let turn = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=turnHappyHome&body={"linkId":"CDv-TaCmVcD0sxAI_HE2RQ","turnNum":"10"}&t=1715954317613&appid=activities_platform&client=ios&clientVersion=1.0.0`,
                cookie,
                algo: {
                    appId: '614f1'
                }
            }
        )
        if (this.haskey(turn, 'data.leftTime')) {
            console.log("剩余翻倍时间:", parseInt(turn.data.leftTime / 1000))
        }
        else {
            let num = this.profile.turnNum || 10
            console.log("开始翻倍,使用奖票数量:", num)
            let count = this.profile.turnDouble || 1
            let ok = 1
            for (let _ = 1; _<=count; _++) {
                var turnNum = (_ == 1) ? num : "-1"
                let double = await this.algo.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=turnHappyDouble&body={"linkId":"CDv-TaCmVcD0sxAI_HE2RQ","turnNum":"${turnNum}"}&t=1715954317613&appid=activities_platform&client=ios&clientVersion=12.1.0`,
                        cookie,
                        algo: {
                            appId: '614f1'
                        }
                    }
                )
                console.log("翻倍中...", this.haskey(double, 'data.rewardValue'))
                if (this.haskey(double, 'data.rewardState', 3)) {
                    console.log("翻倍失败...")
                    ok = 0
                    break
                }
            }
            if (ok) {
                let rec = await this.algo.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=turnHappyReceive&body={"linkId":"CDv-TaCmVcD0sxAI_HE2RQ"}&t=1715954317613&appid=activities_platform&client=ios&clientVersion=12.1.0`,
                        cookie,
                        algo: {
                            appId: '25fac'
                        }
                    }
                )
                console.log("结束翻倍...", this.haskey(rec, 'data.rewardValue'))
            }
        }
        for (let i of Array(10)) {
            let draw = await this.algo.curl({
                    'url': `https://api.m.jd.com/api`,
                    'form': `functionId=superRedBagDraw&body={"linkId":"aE-1vg6_no2csxgXFuv3Kg"}&t=1716014275661&appid=activity_platform_se&client=ios&clientVersion=13.0.0&loginType=2&loginWQBiz=wegame`,
                    cookie,
                    algo: {
                        appId: '89cfe'
                    }
                }
            )
            if (this.haskey(draw, 'code', 20005)) {
                console.log('场次已过期')
                break
            }
            else if (!draw.data.shakeLeftTime) {
                return
            }
            // console.log(this.dumps(draw.data.prizeDrawVo))
            if (this.haskey(draw, 'data.prizeDrawVo.prizeDesc')) {
                console.log(`获得: ${draw.data.prizeDrawVo.prizeDesc} ${draw.data.prizeDrawVo.amount}`)
            }
            else {
                console.log("什么也没有抽到")
            }
            await this.wait(2000)
        }
    }

    async wget(p) {
        return await this.algo.curl(p)
    }
}

module.exports = Main;
