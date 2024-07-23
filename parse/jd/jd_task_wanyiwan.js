const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东玩一玩"
        this.cron = `${this.rand(0, 59)} */2 * * *`
        this.task = 'local'
        this.import = ['jdAlgo', 'fs']
        this.interval = 3000
        this.delay = 500
        this.hint = {
            turnNum: '翻倍奖票数,默认10',
            turnDouble: '翻倍奖票次数,默认1'
        }
        this.model = 'shuffle'
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: "4.7",
            type: "main",
            // headers: {
            //     referer: 'https://pro.m.jd.com/mall/active/3fcyrvLZALNPWCEDRvaZJVrzek8v/index.html',
            // }
        })
        try {
            let txt = this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_wanyiwan.json`).toString()
            this.shareCode = this.loads(txt)
            this.code = this.loads(txt)
        } catch (e) {
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let oldScore = 0;
        if (this.turnCount == 0) {
            this.dict[p.user] = {"pages": {}, "cash": []}
            let home = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=wanyiwan_home&appid=signed_wh5&body={"outsite":0,"firstCall":1,"version":1,"lbsSwitch":false}&rfs=0000&openudid=5a44015a5e835b3dcb903c9a6b9d66573473c14d&screen=390*844&build=168858&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=12.1.0`,
                    cookie,
                    algo: {
                        appId: 'c81ad'
                    }
                }
            )
            let result = this.haskey(home, 'data.result')
            if (!result) {
                console.log("没有获取到数据...")
                return
            }
            else if (!result.isLogin) {
                console.log("未登录...")
                return
            }
            oldScore = this.haskey(home, 'data.result.score') || 0
            console.log("当前奖票:", oldScore)
            let status = 1
            if (p.inviter && p.inviter.user) {
                console.log("正在助力:", p.inviter.user)
                let assist = await this.algo.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=wanyiwan_assist&appid=signed_wh5&body={"inviteCode":"${p.inviter.itemId}","version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=1.0.0&partner=`,
                        cookie,
                        algo: {
                            appId: 'ba505'
                        },
                        headers: {
                            referer: 'https://pro.m.jd.com/mall/active/3fcyrvLZALNPWCEDRvaZJVrzek8v/index.html',
                        }
                    }
                )
                console.log(this.haskey(assist, 'data.bizMsg') || assist)
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
                if (this.haskey(sign, 'data.bizCode', -10001)) {
                    this.print("签到失败 疑似黑号", p.user)
                    status = 0
                }
                console.log("签到中...", this.haskey(sign, 'data.result'))
            }
            if (status>0) {
                for (let i of result.taskBoard) {
                    if (i.title.includes('下单')) {
                    }
                    else if (i.title.includes('助力')) {
                        if (this.cookies.help.includes(p.cookie) && this.haskey(i, 'taskDetail.0.itemId')) {
                            this.code.push({
                                user: this.userPin(cookie),
                                itemId: i.taskDetail[0].itemId
                            })
                        }
                        for (let _ of Array(i.finishTimes)) {
                            let a = await this.algo.curl({
                                    'url': `https://api.m.jd.com/client.action`,
                                    'form': `functionId=wanyiwan_task_receive_award&appid=signed_wh5&body={"taskType":${i.taskType},"assignmentId":"${i.encryptAssignmentId}","version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=12.1.0`,
                                    cookie,
                                    algo: {
                                        appId: 'd12dd'
                                    },
                                }
                            )
                            if (this.haskey(a, 'data.bizCode', -7004)) {
                                break
                            }
                            else {
                                console.log("助力奖励:", this.haskey(a, 'data.result') || a)
                                await this.wait(1000)
                            }
                        }
                    }
                    else {
                        console.log("正在运行:", i.title)
                        let d = await this.algo.curl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `functionId=wanyiwan_do_task&appid=signed_wh5&body={"itemId":"${this.haskey(i, 'taskDetail.0.itemId') || 0}","taskType":${i.taskType},"assignmentId":"${i.encryptAssignmentId}","actionType":1,"version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=12.1.0`,
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
                        let r = await this.algo.curl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `functionId=wanyiwan_do_task&appid=signed_wh5&body={"itemId":"${this.haskey(i, 'taskDetail.0.itemId') || 0}","taskType":${i.taskType},"assignmentId":"${i.encryptAssignmentId}","actionType":0,"version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168858&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=12.1.0`,
                                cookie,
                                algo: {
                                    appId: '89db2'
                                }
                            }
                        )
                        // console.log(r.data)
                        let a = await this.algo.curl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `functionId=wanyiwan_task_receive_award&appid=signed_wh5&body={"taskType":${i.taskType},"assignmentId":"${i.encryptAssignmentId}","version":1}&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=12.1.0`,
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
                else if (this.haskey(turn, 'data.joinTimes', 10)) {
                    console.log("翻倍次数上限")
                }
                else {
                    let num = this.profile.turnNum || 10
                    if (oldScore && num>oldScore) {
                        num = oldScore
                    }
                    console.log("开始翻倍,使用奖票数量:", num)
                    let count = this.profile.turnDouble || 1
                    let ok = 1
                    for (let _ = 1; _<=count; _++) {
                        var turnNum = (_ == 1) ? num : "-1"
                        let double = await this.algo.curl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `functionId=turnHappyDouble&body={"linkId":"CDv-TaCmVcD0sxAI_HE2RQ","turnNum":"${turnNum}"}&t=1715954317613&appid=activities_platform&client=ios&clientVersion=13.1.0`,
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
                        else if (this.haskey(double, 'code', 220001)) {
                            console.log("今日参与已达上限...")
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
            }
        }
        if (new Date().getHours()>18) {
            for (let i of Array(10)) {
                let draw = await this.algo.curl({
                        'url': `https://api.m.jd.com/api`,
                        'form': `functionId=superRedBagDraw&body={"linkId":"aE-1vg6_no2csxgXFuv3Kg"}&t=1716014275661&appid=activity_platform_se&client=ios&clientVersion=13.1.0&loginType=2&loginWQBiz=wegame`,
                        cookie,
                        algo: {
                            appId: '89cfe'
                        },
                        referer: 'https://pro.m.jd.com/mall/active/3fcyrvLZALNPWCEDRvaZJVrzek8v/index.html',
                    }
                )
                if (this.haskey(draw, 'code', 20005)) {
                    console.log('场次已过期')
                    break
                }
                else if (!draw.data.shakeLeftTime) {
                    break
                }
                // console.log(this.dumps(draw.data.prizeDrawVo))
                if (this.haskey(draw, 'data.prizeDrawVo.prizeDesc')) {
                    this.print(`获得: ${draw.data.prizeDrawVo.prizeDesc} ${draw.data.prizeDrawVo.amount}`, p.user)
                }
                else {
                    console.log("什么也没有抽到")
                }
                await this.wait(2000)
            }
        }
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=wanyiwan_home&appid=signed_wh5&body=%7B%22outsite%22%3A0%2C%22firstCall%22%3A1%2C%22version%22%3A1%2C%22lbsSwitch%22%3Atrue%7D&rfs=0000&openudid=de21c6604748f97dd3977153e51a47f4efdb9a47&screen=390*844&build=168960&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&client=apple&clientVersion=1.0.0&partner=`,
                cookie,
                algo: {
                    appId: 'c81ad'
                }
            }
        )
        let score = this.haskey(home, 'data.result.score') || 0
        if (score) {
            if (oldScore) {
                let diff = score - oldScore
                if (diff) {
                    this.print(`本轮${diff>0 ? '增加' : "损失"}: ${diff}`, p.user)
                }
            }
        }
        let record = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=wanyiwan_point_record&appid=signed_wh5&body={"pageNum":1,"version":1}&rfs=0000`,
                cookie
            }
        )
        let now = new Date();
        let year = now.getFullYear();
        let month = (now.getMonth() + 1).toString().padStart(2, '0');
        let day = now.getDate().toString().padStart(2, '0');
        let ymd = `${year}-${month}-${day}`;
        let ymd2 = `${year}.${month}.${day}`;
        let report = (this.haskey(record, 'data.result.pointsRecords') || []).filter(d => d.sendTime == ymd || d.sendTime == ymd2).filter(d => d.pointName == '1002')
        let use = report.filter(d => d.operateType == '3')
        let suc = report.filter(d => d.operateType == '1')
        let x = this.sum(use.map(d => d.pointValue)) || 0;
        let y = this.sum(suc.map(d => d.pointValue)) || 0
        let z = y - x
        this.print(`当前奖票: ${score} \n翻倍次数: ${use.length}, 消耗奖票: ${x}, 获得奖票: ${y}, ${z>0 ? '增加' : "损失"}奖票: ${z} \n盈亏占比: ${suc.length}/${use.length - suc.length}`, p.user)
    }

    async wget(p) {
        return await this.algo.curl(p)
    }

    async extra() {
        let dict = {}
        for (let i of this.code) {
            dict[i.user] = i
        }
        await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_wanyiwan.json`, this.dumps(Object.values(dict)), (error) => {
            if (error) return console.log("写入化失败" + error.message);
            console.log("wanyiwan写入成功");
        })
    }
}

module.exports = Main;
