const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东抽现金赢大礼"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.turn = 3
        this.import = ['jdAlgo']
        this.delay = 500
        this.model = 'user'
        this.hint = {
            help: "每天最多助力3人,有些黑号提现不了,请自行设置主号",
            change: "部分黑号提现不了,可以将现金转换红包,如需转换,请自行设置节点 change=1",
            delay: "默认500,即每次请求间隔为0.5s,如需修改,请自行设置节点 delay=n",
            count: '如需设置主号最多助力人数,请自行设置节点 count=n',
            stop: '抽奖过程中,如果抽到优惠券就停止抽奖'
        }
        this.verify = 1
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        console.log("获取助力码中...")
        for (let cookie of this.cookies.help) {
            let user = this.userName(cookie)
            let home = await this.algo.curl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=inviteFissionBeforeHome&body={"linkId":"Wvzc_VpNTlSkiQdHT8r7QA","isJdApp":false,"inviter":""}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=1.0.0&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                    cookie,
                    algo: {
                        type: "main",
                        version: "4.1",
                        appId: '02f8d'
                    },
                }
            )
            let inviter = this.haskey(home, 'data.inviter')
            if (inviter) {
                console.log(user, ':', home.data.inviter)
                let count = 0, finish = 0;
                if (this.profile.count) {
                    let invite = await this.algo.curl({
                            'url': `https://api.m.jd.com/`,
                            form: `functionId=inviteFissionHome&body={"linkId":"Wvzc_VpNTlSkiQdHT8r7QA","inviter":""}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=1.0.0&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                            // 'form':``,
                            cookie,
                            algo: {
                                type: "lite",
                                version: "4.1",
                                appId: 'eb67b'
                            }
                        }
                    )
                    count = this.haskey(invite, 'data.drawPrizeNum') || 0
                    if (count>=parseInt(this.profile.count)) {
                        finish = 1
                    }
                }
                this.dict[user] = {
                    inviter, count, finish
                }
                this.shareCode.push({
                    user,
                    inviter, count, finish
                })
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        if (this.turnCount == 0) {
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
                console.log(p.inviter.inviter)
                let home = await this.algo.curl({
                        'url': `https://api.m.jd.com/`,
                        form: `functionId=inviteFissionBeforeHome&body={"linkId":"Wvzc_VpNTlSkiQdHT8r7QA","isJdApp":true,"inviter":"${p.inviter.inviter}"}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=1.0.0&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                        // 'form':``,
                        cookie,
                        algo: {
                            type: "main",
                            version: "4.1",
                            appId: '02f8d'
                        }
                    }
                )
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
                        'url': `https://api.m.jd.com/?functionId=inviteFissionHome&body={"linkId":"Wvzc_VpNTlSkiQdHT8r7QA","inviter":"${p.inviter.inviter}"}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                        // 'form':``,
                        cookie,
                        algo: {
                            type: "lite",
                            version: "4.1",
                            appId: 'eb67b'
                        }
                    }
                )
            }
        }
        else if (this.turnCount == 1) {
            console.log("正在抽奖...")
            let invite = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=inviteFissionHome&body={"linkId":"Wvzc_VpNTlSkiQdHT8r7QA","inviter":""}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                    // 'form':``,
                    cookie,
                    algo: {
                        type: "lite",
                        version: "4.1",
                        appId: 'eb67b'
                    }
                }
            )
            let prizeNum = this.haskey(invite, 'data.prizeNum')
            console.log("可抽奖次数:", prizeNum)
            let error = 0
            for (let i of Array(prizeNum)) {
                let draw = await this.algo.curl({
                        'url': `https://api.m.jd.com/?functionId=inviteFissionDrawPrize&body={%22linkId%22:%22Wvzc_VpNTlSkiQdHT8r7QA%22,%22lbs%22:%22null%22}&t=1677826749458&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                        // 'form':``,
                        cookie,
                        algo: {
                            type: "lite",
                            version: "4.1",
                            appId: 'c02c6'
                        }
                    }
                )
                let prizeType = this.haskey(draw, 'data.prizeType')
                if (!prizeType) {
                    error++
                }
                else {
                    error = 0
                }
                if (error>2) {
                    console.log("已经连续3次没有获取到抽奖数据,跳过本次抽奖...")
                    break
                }
                console.log("抽中类型:", prizeType, '抽中面额:', this.haskey(draw, 'data.prizeValue'))
                if (parseInt(prizeType) == 1 && this.profile.stop) {
                    console.log("抽到优惠券了,退出抽奖等会再来....")
                    break
                }
                await this.wait(1000)
            }
        }
        else {
            console.log("正在提现...")
            for (let _ = 1; _<=4; _++) {
                let list = await this.curl({
                        'url': `https://api.m.jd.com/?functionId=superRedBagList&body={"linkId":"Wvzc_VpNTlSkiQdHT8r7QA","pageNum":${_},"pageSize":10,"business":"fission"}&t=1677826759113&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                        // 'form':``,
                        cookie,
                        algo: {
                            type: "lite",
                            version: "4.1",
                            appId: 'f2b1d'
                        }
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
                        let cash = await this.algo.curl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=apCashWithDraw&body={"linkId":"Wvzc_VpNTlSkiQdHT8r7QA","businessSource":"NONE","base":{"id":${i.id},"business":"fission","poolBaseId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeBaseId":${i.prizeBaseId},"prizeType":${i.prizeType}}}&t=1677826760325&appid=activities_platform&client=ios&clientVersion=11.6.3`,
                                cookie,
                                algo: {
                                    type: "lite",
                                    version: "4.1",
                                    appId: '3c023'
                                }
                            }
                        )
                        this.print(`现金: ${i.amount}  ${this.haskey(cash, 'data.message')}`, p.user)
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
                    else if (i.prizeType == 4 && i.state == 2) {
                        if (this.profile.change) {
                            let change = await this.curl({
                                    'url': `https://api.m.jd.com/`,
                                    'form': `functionId=apRecompenseDrawPrize&body={"linkId":"Wvzc_VpNTlSkiQdHT8r7QA","drawRecordId":${i.id},"business":"fission","poolId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeId":${i.prizeBaseId}}&t=1677828892054&appid=activities_platform&client=ios&clientVersion=11.6.2&cthr=1&uuid=31dbd03adc234a4f7b53d2ab98fe45e442ef8c23&build=168548&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=13.7&partner=&eid=eidI9f3b812081s9gBRFzHVvSLKFyLkI3gRVC4AUR0pS4q%2FTLWhDlWOgSf3sd8Pw8GQF2mt5nHCd%2BUPdaH%2BNFDpcnMR8V4l92V0jkRYYg32WNMM5UbBj`,
                                    cookie
                                }
                            )
                            console.log(`转换现金:`, i.amount, this.haskey(change, 'data. prizeDesc'))
                        }
                        else {
                            console.log('提现失败金额:', i.amount, '如需转换成红包请设置change节点参数')
                        }
                    }
                }
            }
        }
    }
}

module.exports = Main;
