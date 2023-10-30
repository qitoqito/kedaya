const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东11.11魔法开启"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 9)},${this.rand(14, 21)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.delay = 1500
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: '4.1',
            type: "main"
        })
        this.linkId = this.profile.custom || 'toZwuImFnkGzWBE82w3RLA'
    }

    async main(p) {
        let cookie = p.cookie;
        let home = await this.wget({
            fn: 'superLeagueHome',
            body: {"linkId": this.linkId, "taskId": "", "inviter": "", "inJdApp": true},
            algo: {'appId': 'b7d17'},
            cookie
        })
        // console.log(home)
        if (this.haskey(home, 'data.notLogin')) {
            console.log("账号过期...")
            return
        }
        let data = home.data
        let userCode = data.userCode
        let apTask = await this.wget({
            fn: 'apTaskList',
            body: {"linkId": this.linkId},
            algo: {},
            cookie
        })
        // console.log(apTask)
        for (let i of this.haskey(apTask, 'data')) {
            if (i.taskLimitTimes == i.taskDoTimes) {
                console.log("任务已完成:", i.taskShowTitle)
            }
            else if (i.taskShowTitle == '邀请好友参加') {
                continue
            }
            else {
                for (let j of Array(i.taskLimitTimes - i.taskDoTimes)) {
                    console.log("正在运行:", i.taskShowTitle)
                    let doTask = await this.wget({
                        fn: 'apsDoTask',
                        body: {
                            "linkId": this.linkId,
                            "taskType": i.taskType,
                            "taskId": i.id,
                            "channel": 4,
                            "checkVersion": true,
                            "cityId": "",
                            "provinceId": "",
                            "countyId": "",
                            "itemId": encodeURIComponent(i.taskSourceUrl)
                        },
                        algo: {'appId': '54ed7'},
                        cookie
                    })
                    if (this.haskey(doTask, 'success')) {
                        console.log("任务完成")
                    }
                    else {
                        console.log("任务失败:", this.haskey(doTask, 'errMsg') || doTask)
                    }
                }
            }
        }
        for (let i of Array(30)) {
            try {
                let lottery = await this.wget({
                    fn: 'superLeagueLottery',
                    body: {"linkId": "toZwuImFnkGzWBE82w3RLA"},
                    algo: {'appId': '60dc4'},
                    cookie
                })
                if (this.haskey(lottery, 'code', 18002)) {
                    console.log('抽奖机会用完啦')
                    break
                }
                else if (this.haskey(lottery, 'code', 1000)) {
                    console.log('未登录')
                    break
                }
                if (this.haskey(lottery, 'data')) {
                    let data = lottery.data
                    let prizeType = data.prizeType
                    if (prizeType == 1) {
                        console.log('获得: 优惠券 ', data.prizeDesc, data.amount)
                    }
                    else if (prizeType == 2) {
                        this.print(`获得: 红包   ${data.amount}`, p.user)
                    }
                    else if (prizeType == 0) {
                        console.log('没抽到奖品')
                    }
                    else {
                        console.log(data)
                        this.print(`抽到类型: ${prizeType} ${data.codeDesc} ${data.prizeDesc}`, p.user)
                    }
                }
                else {
                    console.log("抽奖错误")
                    break
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    async wget(p) {
        return await this.algo.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=${p.fn}&body=${typeof (p.body) == 'object' ? this.dumps(p.body) : p.body}&t=1698649904893&appid=activities_platform&client=ios&clientVersion=12.1.6&build=168909&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=-1&cthr=1`,
                cookie: p.cookie,
                algo: p.algo || {},
            }
        )
    }
}

module.exports = Main;
