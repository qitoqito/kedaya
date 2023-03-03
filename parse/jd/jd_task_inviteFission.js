const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东抽现金赢大礼"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.turn = 2
        this.import = ['jdAlgo']
        this.delay = 500
        this.model = 'user'
        this.hint = {
            help: "每天最多助力3人,有些黑号提现不了,请自行设置主号"
        }
        this.verify = 1
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        console.log("获取助力码中...")
        for (let cookie of this.cookies.help) {
            let user = this.userName(cookie)
            let home = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=inviteFissionBeforeHome&body={"linkId":"0l57_ZyiJ8Ak6cbk48fpHQ","isJdApp":true,"inviter":""}&t=1677821302550&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                    // 'form':``,
                    cookie,
                    algo: {
                        type: "main",
                        version: "3.1",
                        appId: '02f8d'
                    }
                }
            )
            let inviter = this.haskey(home, 'data.inviter')
            if (inviter) {
                console.log(user, ':', home.data.inviter)
                this.shareCode.push({
                    user,
                    inviter
                })
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        if (this.turnCount == 0) {
            console.log("正在助力:", p.inviter.user)
            if (p.user == p.inviter.user) {
                console.log("不能助力自己...")
            }
            else {
                console.log(p.inviter.inviter)
                let home = await this.algo.curl({
                        'url': `https://api.m.jd.com/?functionId=inviteFissionBeforeHome&body={"linkId":"0l57_ZyiJ8Ak6cbk48fpHQ","isJdApp":true,"inviter":"${p.inviter.inviter}"}&t=1677821302550&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                        // 'form':``,
                        cookie,
                        algo: {
                            type: "main",
                            version: "3.1",
                            appId: '02f8d'
                        }
                    }
                )
                let helpResult = this.haskey(home, 'data.helpResult')
                if (helpResult == 1) {
                    console.log("助力成功...")
                }
                else if (helpResult == 6) {
                    console.log("已经助力过了...")
                }
                else if (helpResult == 3) {
                    console.log("没有助力次数了...")
                    this.complete.push(p.index)
                }
                let invite = await this.algo.curl({
                        'url': `https://api.m.jd.com/?functionId=inviteFissionHome&body={"linkId":"0l57_ZyiJ8Ak6cbk48fpHQ","inviter":"${p.inviter.inviter}"}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                        // 'form':``,
                        cookie,
                        algo: {
                            type: "main",
                            version: "3.1",
                            appId: 'eb67b'
                        }
                    }
                )
            }
        }
        else {
            let invite = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=inviteFissionHome&body={"linkId":"0l57_ZyiJ8Ak6cbk48fpHQ","inviter":""}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                    // 'form':``,
                    cookie,
                    algo: {
                        type: "main",
                        version: "3.1",
                        appId: 'eb67b'
                    }
                }
            )
            let prizeNum = this.haskey(invite, 'data.prizeNum')
            console.log("可抽奖次数:", prizeNum)
            for (let i of Array(prizeNum)) {
                let draw = await this.algo.curl({
                        'url': `https://api.m.jd.com/?functionId=inviteFissionDrawPrize&body={%22linkId%22:%220l57_ZyiJ8Ak6cbk48fpHQ%22,%22lbs%22:%22null%22}&t=1677826749458&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                        // 'form':``,
                        cookie,
                        algo: {
                            type: "main",
                            version: "3.1",
                            appId: 'c02c6'
                        }
                    }
                )
                let prizeType = this.haskey(draw, 'data.prizeType')
                console.log("抽中类型:", prizeType, '抽中面额:', this.haskey(draw, 'data.prizeValue'))
            }
            for (let _ = 1; _<=3; _++) {
                let list = await this.curl({
                        'url': `https://api.m.jd.com/?functionId=superRedBagList&body={"linkId":"0l57_ZyiJ8Ak6cbk48fpHQ","pageNum":${_},"pageSize":10,"business":"fission"}&t=1677826759113&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                        // 'form':``,
                        cookie
                    }
                )
                if (!this.haskey(list, 'data.items')) {
                    break
                }
                let num = 0
                for (let i of this.haskey(list, 'data.items')) {
                    if (i.prizeType == 4 && i.state == 0) {
                        num++
                    }
                }
                let kn = 0
                for (let i of this.haskey(list, 'data.items')) {
                    if (i.prizeType == 4 && i.state == 0) {
                        console.log("正在提现:", i.amount)
                        let cash = await this.algo.curl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=apCashWithDraw&body={"linkId":"0l57_ZyiJ8Ak6cbk48fpHQ","businessSource":"NONE","base":{"id":${i.id},"business":"fission","poolBaseId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeBaseId":${i.prizeBaseId},"prizeType":${i.prizeType}}}&t=1677826760325&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                                cookie,
                                algo: {
                                    type: "main",
                                    version: "3.1",
                                    appId: '3c023'
                                }
                            }
                        )
                        console.log(this.haskey(cash, 'data.message'))
                        let message = this.haskey(cash, 'data.message')
                        if (message.includes('风控')) {
                            console.log("风控账户,不能提现")
                            break
                        }
                        kn++
                        if (kn<num) {
                            await this.wait(6000)
                        }
                    }
                }
            }
        }
    }
}

module.exports = Main;
