const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东新春吉市"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 21)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.delay = 1500
        // this.turn = 2
        this.hint = {
            'linkId': '活动id,多个id用|分隔'
        }
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: '4.4',
            type: "main",
            referer:'https://prodev.m.jd.com/mall/active/PeDrj2LZQdhcLv8f2UiSCmW7RPF/index.html'
        })
        this.linkId = this.profile.linkId || 'BP6qJ6Fb6wNHVu8BKb66rA'
        let linkid = this.linkId.split("|")
        for (let i of linkid) {
            this.code.push({linkId: i})
            this.dict[i] = {
                code: [], taskId: ''
            }
        }
        this.clientVersion = '12.3.1'
        this.taskId = ''
    }

    async main(p) {
        for (let i of this.code) {
            p.linkId = i.linkId
            console.log("活动Id:", p.linkId)
            await this.doWork(p)
        }
    }

    async doWork(p) {
        let cookie = p.cookie;
        let inviter = ""
        if (this.dict[p.linkId].code.length>0) {
            let code = this.dict[p.linkId].code[(p.index + 1) % this.dict[p.linkId].code.length]
            inviter = code.userCode
            console.log("正在助力:", code.user)
        }
        let taskId = this.dict[p.linkId].taskId || ''
        let home = await this.wget({
            fn: 'superLeagueHome',
            body: {"linkId": p.linkId, "taskId": taskId, "inviter": inviter, "inJdApp": true},
            algo: {'appId': 'b7d17'},
            cookie
        })
        if (this.haskey(home, 'data.notLogin')) {
            console.log("账号过期...")
            return
        }
        let data = home.data
        let userCode = data.userCode
        if (this.cookies.help.includes(p.cookie) && this.turnCount == 0) {
            this.dict[p.linkId].code.push({
                user: p.user,
                userCode
            })
        }
        let apTask = await this.wget({
            fn: 'apTaskList',
            body: {"linkId": p.linkId},
            algo: {},
            cookie
        })
        // console.log(apTask.data)
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
                    switch (i.taskType) {
                        case 'SHARE_INVITE':
                            this.dict[p.linkId].taskId = i.id
                            break
                        case 'BROWSE_CHANNEL':
                        case  'BROWSE_PRODUCT' :
                            let detail = await this.wget({
                                fn: 'apTaskDetail',
                                body: {
                                    "linkId": p.linkId,
                                    "taskType": i.taskType,
                                    "taskId": i.id,
                                    "channel": 4,
                                    "checkVersion": true,
                                    "cityId": "",
                                    "provinceId": "",
                                    "countyId": "",
                                },
                                algo: {'appId': '54ed7'},
                                cookie
                            })
                            if (this.haskey(detail, 'data.taskItemList')) {
                                let doTask = await this.wget({
                                    fn: 'apsDoTask',
                                    body: {
                                        "linkId": p.linkId,
                                        "taskType": i.taskType,
                                        "taskId": i.id,
                                        "channel": 4,
                                        "checkVersion": true,
                                        "cityId": "",
                                        "provinceId": "",
                                        "countyId": "",
                                        "itemId": encodeURIComponent((detail.data.taskItemList[j] || detail.data.taskItemList[0]).itemId)
                                    },
                                    algo: {'appId': '54ed7'},
                                    cookie
                                })
                                console.log(this.haskey(doTask, 'success'))
                            }
                            break
                        default:
                            let doTask = await this.wget({
                                fn: 'apsDoTask',
                                body: {
                                    "linkId": p.linkId,
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
                            console.log(i.taskType)
                            if (this.haskey(doTask, 'success')) {
                                console.log("任务完成")
                            }
                            else {
                                console.log("任务失败:", this.haskey(doTask, 'errMsg') || doTask)
                            }
                            break
                    }
                }
            }
        }
        for (let i of Array(30)) {
            try {
                let lottery = await this.wget({
                    fn: 'superLeagueLottery',
                    body: {"linkId": p.linkId},
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
                    else if (prizeType == 22) {
                        this.print(`获得: 超市卡   ${data.amount}`, p.user)
                    }
                    else if (prizeType == 0) {
                        console.log('没抽到奖品')
                    }
                    else {
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
                'form': `functionId=${p.fn}&body=${typeof (p.body) == 'object' ? this.dumps(p.body) : p.body}&t=1698649904893&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&build=168909&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=-1&cthr=1`,
                cookie: p.cookie,
                algo: p.algo || {},
            }
        )
    }
}

module
    .exports = Main;
