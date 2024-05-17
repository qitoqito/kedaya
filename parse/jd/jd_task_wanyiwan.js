const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东玩一玩"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.interval = 1500
        this.hint = {
            turnNum: '翻倍奖票数,默认10'
        }
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: "4.7",
            type: "main"
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=wanyiwan_home&appid=signed_wh5&body={"outsite":0,"firstCall":0,"version":1,"lbsSwitch":false}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=12.3.1`,
                cookie,
                algo: {
                    appId: 'c81ad'
                }
            }
        )
        // console.log(home.data.result)
        let result = this.haskey(home, 'data.result')
        if (!result) {
            console.log("没有获取到数据...")
            return
        }
        if (this.haskey(result, 'signBoard.status', 1)) {
            console.log("已签到...")
        }
        else {
            let sign = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=wanyiwan_sign&appid=signed_wh5&body={"version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=12.3.1`,
                    cookie,
                    algo: {
                        appId: 'd12dd'
                    }
                }
            )
            console.log("签到中...", this.haskey(sign, 'data.result'))
        }
        for (let i of result.taskBoard) {
            console.log("正在运行:", i.title)
            let d = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=wanyiwan_do_task&appid=signed_wh5&body={"itemId":"${this.haskey(i, 'taskDetail.0.itemId') || 0}","taskType":${i.taskType},"assignmentId":"${i.encryptAssignmentId}","actionType":1,"version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=12.3.1`,
                    cookie,
                    algo: {
                        appId: 'd12dd'
                    }
                }
            )
            // console.log(d.data)
            if (i.limitTime) {
                await this.wait(i.limitTime * 1000)
            }
            let r = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=wanyiwan_do_task&appid=signed_wh5&body={"itemId":"${this.haskey(i, 'taskDetail.0.itemId') || 0}","taskType":${i.taskType},"assignmentId":"${i.encryptAssignmentId}","actionType":0,"version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=12.3.1`,
                    cookie,
                    algo: {
                        appId: 'd12dd'
                    }
                }
            )
            // console.log(r.data)
            let a = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=wanyiwan_task_receive_award&appid=signed_wh5&body={"taskType":${i.taskType},"assignmentId":"${i.encryptAssignmentId}","version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=12.3.1`,
                    cookie,
                    algo: {
                        appId: 'd12dd'
                    }
                }
            )
            console.log(a.data)
        }
        let turn = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=turnHappyHome&body={"linkId":"CDv-TaCmVcD0sxAI_HE2RQ","turnNum":"10"}&t=1715954317613&appid=activities_platform&client=ios&clientVersion=12.3.1`,
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
            let double = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=turnHappyDouble&body={"linkId":"CDv-TaCmVcD0sxAI_HE2RQ","turnNum":"${num}"}&t=1715954317613&appid=activities_platform&client=ios&clientVersion=12.3.1`,
                    cookie,
                    algo: {
                        appId: '614f1'
                    }
                }
            )
            console.log("翻倍中...", this.haskey(double, 'data.rewardValue'))
            let rec = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=turnHappyReceive&body={"linkId":"CDv-TaCmVcD0sxAI_HE2RQ"}&t=1715954317613&appid=activities_platform&client=ios&clientVersion=12.3.1`,
                    cookie,
                    algo: {
                        appId: '25fac'
                    }
                }
            )
            console.log("结束翻倍...", this.haskey(rec, 'data.rewardValue'))
        }
    }
}

module.exports = Main;
