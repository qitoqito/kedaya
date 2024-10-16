const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "东东心动乐园"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
        this.turn = 2
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: "latest"
        })
        this.linkId = this.custom || 'BDhyBiZZFd5l3BkNVMqzZg'
        for (let cookie of this.cookies.help) {
            let user = this.userName(cookie)
            let home = await this.algo.curl({
                    'url': `https://api.m.jd.com/api?functionId=drawFissionHome`,
                    'form': `functionId=drawFissionHome&body={"envType":1,"linkId":"${this.linkId}","inviter":"","sceneRestoreSkuId":"","sideType":""}&t=1729087124885&appid=activities_platform&client=ios&clientVersion=13.2.8&loginType=2&loginWQBiz=wegame`,
                    cookie,
                    algo: {
                        appId: '40393'
                    }
                }
            )
            let inviter = this.haskey(home, 'data.inviter')
            let countDownTime = 0
            if (inviter) {
                console.log(user, ':', home.data.inviter)
                let count = 0, totalAmount = 0,
                    finish = 0, vo = 0, amount = 0
                let invite = await this.algo.curl({
                    'url': `https://api.m.jd.com/`,
                    form: `functionId=drawFissionHome&body={"linkId":"${this.linkId}","inviter":""}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=13.1.0&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                    // 'form':``,
                    cookie,
                    algo: {
                        appId: 'eb67b'
                    }
                })
                if (this.haskey(invite, 'data.cashVo.totalAmount')) {
                    amount = invite.data.cashVo.totalAmount
                    vo = 1
                }
                if (this.profile.count) {
                    count = this.haskey(invite, 'data.drawPrizeNum') || 0
                    if (count>=parseInt(this.profile.count)) {
                        finish = 1
                    }
                    countDownTime = invite.data.countDownTime
                }
                this.dict[user] = {
                    inviter,
                    count,
                    finish
                }
                this.shareCode.push({
                    user, pin: this.userPin(cookie),
                    inviter,
                    count,
                    finish,
                    min: parseInt(countDownTime / 60000), amount: this.haskey(invite, 'data.cashVo.amount')
                })
                this.dict[this.linkId] = {
                    vo, amount: parseInt(amount)
                }
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        if (this.turnCount == 0) {
            this.dict[p.user] = {"pages": {}, "cash": []}
            console.log("正在助力:", p.inviter.user)
            if (p.inviter.finish) {
                this.finish.push(p.number)
            }
            if (this.profile.count) {
                if (this.dict[p.inviter.user].count>=parseInt(this.profile.count)) {
                    this.finish.push(p.number)
                }
            }
            if (p.user == p.inviter.user) {
                console.log("不能助力自己...")
            }
            else {
                let home = await this.algo.curl({
                    'url': `https://api.m.jd.com/`,
                    form: `functionId=drawFissionhelp&body={"linkId":"${this.linkId}","isJdApp":true,"inviter":"${p.inviter.inviter}"}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=13.2.2&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                    // 'form':``,
                    cookie,
                    algo: {
                        appId: '19eff'
                    }
                })
                let helpResult = this.haskey(home, 'data.helpResult')
                if (!helpResult) {
                    console.log(this.haskey(home, 'errMsg') || '错误了...')
                    this.complete.push(p.index)
                }
                console.log("助力状态:", helpResult)
                if (helpResult == 1) {
                    console.log("助力成功...")
                    this.dict[p.inviter.user].count++
                }
                else if (helpResult == 6) {
                    console.log("已经助力过了...")
                }
                else if (helpResult == 3) {
                    console.log("没有助力次数了...")
                    this.complete.push(p.index)
                }
                else if (helpResult == 4) {
                    console.log("助力次数用完了...")
                    this.complete.push(p.index)
                }
                else if (helpResult == 2) {
                    console.log("活动火爆...")
                    this.complete.push(p.index)
                }
                let invite = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=drawFissionHome&body={"linkId":"${this.linkId}","inviter":"${p.inviter.inviter}"}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=13.1.0`,
                    // 'form':``,
                    cookie,
                    algo: {
                        appId: 'eb67b'
                    }
                })
            }
        }
        else {
            console.log("正在抽奖...")
            let invite = await this.algo.curl({
                'url': `https://api.m.jd.com/?functionId=drawFissionHome&body={"linkId":"${this.linkId}","inviter":""}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=13.1.0`,
                // 'form':``,
                cookie,
                algo: {
                    appId: '40393'
                }
            })
            let prizeNum = this.haskey(invite,  'data.prizeNum' )
            console.log("可抽奖次数:", prizeNum)
            let error = 0
            let dict = {
                1: '优惠券',
                2: '红包',
                4: '现金',
                6: '礼包'
            }
            let redpacket = [0]
            let cash = [0]
            for (let i of Array(prizeNum)) {
                let draw = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=drawFissionPrize&body={%22linkId%22:%22${this.linkId}%22,%22lbs%22:%22null%22}&t=1677826749458&appid=activities_platform&client=ios&clientVersion=13.1.0`,
                    cookie,
                    algo: {
                        appId: '1aff4'
                    }
                })
                let prizeType = this.haskey(draw, 'data.prizeType')
                console.log("抽中类型:", dict[prizeType] || prizeType, '抽中面额:', this.haskey(draw, 'data.prizeValue'))
                if (parseInt(prizeType) == 1 && this.profile.stop) {
                    console.log("抽到优惠券了,退出抽奖等会再来....")
                    break
                }
                if (prizeType == 2) {
                    redpacket.push(this.haskey(draw, 'data.prizeValue'))
                }
                else if (prizeType == 4) {
                    cash.push(this.haskey(draw, 'data.prizeValue'))
                }
                if (this.dict[this.linkId].amount) {
                    let receive = await this.algo.curl({
                            'url': "https://api.m.jd.com/",
                            'form': `functionId=drawFissionReceive&body={"linkId":"${this.linkId}"}&t=1690444205217&appid=activities_platform&client=ios&clientVersion=13.1.0&uuid=861150c6d426f3ce8179e70c6da1b6fe3a6293ef&build=1410&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=-1&cthr=1`,
                            cookie,
                            algo: {
                                "appId": "1dd0c",
                            }
                        }
                    )
                    console.log(`获取奖励中: ${this.haskey(receive, 'data.amount')}`)
                    if (this.haskey(receive, 'data.amount') && parseInt(receive.data.amount)>=this.dict[this.linkId].amount) {
                    }
                    if (this.haskey(receive, 'data.cashRecord')) {
                        let cashRecord = receive.data.cashRecord
                        let cash = await this.algo.curl({
                            'url': `https://api.m.jd.com/`,
                            'form': `functionId=apCashWithDraw&body={"linkId":"${this.linkId}","businessSource":"NONE","base":{"id":${cashRecord.id},"business":"fission","poolBaseId":${cashRecord.poolBaseId},"prizeGroupId":${cashRecord.prizeGroupId},"prizeBaseId":${cashRecord.prizeBaseId},"prizeType":${cashRecord.prizeType}}}&t=1677826760325&appid=activities_platform&client=ios&clientVersion=13.1.0`,
                            cookie,
                            algo: {
                                appId: '73bca'
                            }
                        })
                    }
                }
                await this.wait(1000)
            }
            if (cash.length>1 || redpacket.length>1) {
                this.print(`现金: ${this.sum(cash, 2)} 红包: ${this.sum(redpacket, 2)}`, p.user)
            }
        }
    }
}

module.exports = Main;
