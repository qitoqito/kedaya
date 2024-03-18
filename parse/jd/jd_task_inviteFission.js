const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东抽现金赢大礼"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
        this.delay = 1000
        this.turn = 3
        this.model = 'user'
        this.hint = {
            help: "每天最多助力1人,有些黑号提现不了,请自行设置主号",
            change: "部分黑号提现不了,可以将现金转换红包,如需转换,请自行设置节点 change=1",
            delay: "默认500,即每次请求间隔为0.5s,如需修改,请自行设置节点 delay=n",
            count: '如需设置主号最多助力人数,请自行设置节点 count=n',
            // stop: '抽奖过程中,如果抽到优惠券就停止抽奖',
            reward: '频繁请求奖品页面容易黑ip,如果只想提现当前助力的号,请自行设置 reward=help',
            page: "请求前面几页'我的奖品'数据,默认获取前5页数据,每页会获取100条奖品数据(app内默认每页20条数据)"
        }
        // this.verify = 1
    }

    async prepare() {
        this.linkId = this.custom || '3orGfh1YkwNLksxOcN8zWQ'
        this.algo = new this.modules.jdAlgo({
            referer: 'https://pro.m.jd.com/mall/active/3BwUqhLsJYrHP4qgAgDDJGrSVngK/index.html',
            type: "main",
            version: "4.4"
        })
        console.log("获取助力码中...")
        for (let cookie of this.cookies.help) {
            let user = this.userName(cookie)
            let home = await this.algo.curl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=inviteFissionBeforeHome&body={"linkId":"${this.linkId}","isJdApp":false,"inviter":""}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=12.3.4&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                    cookie,
                    algo: {
                        appId: '02f8d'
                    },
                }
            )
            let inviter = this.haskey(home, 'data.inviter')
            let countDownTime = 0
            if (inviter) {
                console.log(user, ':', home.data.inviter)
                let count = 0, finish = 0;
                if (this.profile.count) {
                    let invite = await this.algo.curl({
                            'url': `https://api.m.jd.com/`,
                            form: `functionId=inviteFissionHome&body={"linkId":"${this.linkId}","inviter":""}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=12.3.4&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                            // 'form':``,
                            cookie,
                            algo: {
                                appId: 'eb67b'
                            }
                        }
                    )
                    count = this.haskey(invite, 'data.drawPrizeNum') || 0
                    if (count>=parseInt(this.profile.count)) {
                        finish = 1
                    }
                    countDownTime = invite.data.countDownTime
                }
                this.dict[user] = {
                    inviter, count, finish
                }
                this.shareCode.push({
                    user,
                    inviter, count, finish,
                    min: parseInt(countDownTime / 60000)
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
                        form: `functionId=inviteFissionhelp&body={"linkId":"${this.linkId}","isJdApp":true,"inviter":"${p.inviter.inviter}"}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=12.3.4&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                        // 'form':``,
                        cookie,
                        algo: {
                            appId: 'c5389'
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
                        'url': `https://api.m.jd.com/?functionId=inviteFissionHome&body={"linkId":"${this.linkId}","inviter":"${p.inviter.inviter}"}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=12.3.4`,
                        // 'form':``,
                        cookie,
                        algo: {
                            appId: 'eb67b'
                        }
                    }
                )
            }
        }
        else if (this.turnCount == 1) {
            console.log("正在抽奖...")
            let invite = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=inviteFissionHome&body={"linkId":"${this.linkId}","inviter":""}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=12.3.4`,
                    // 'form':``,
                    cookie,
                    algo: {
                        appId: 'eb67b'
                    }
                }
            )
            let prizeNum = this.haskey(invite, 'data.prizeNum')
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
                        'url': `https://api.m.jd.com/?functionId=inviteFissionDrawPrize&body={%22linkId%22:%22${this.linkId}%22,%22lbs%22:%22null%22}&t=1677826749458&appid=activities_platform&client=ios&clientVersion=12.3.4`,
                        cookie,
                        algo: {
                            appId: 'c02c6'
                        }
                    }
                )
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
                await this.wait(1000)
            }
            if (cash.length>1 || redpacket.length>1) {
                this.print(`现金: ${this.sum(cash, 2)} 红包: ${this.sum(redpacket, 2)}`, p.user)
            }
        }
        else {
            if (this.profile.reward && this.profile.reward == 'help' && !this.cookies.help.includes(p.cookie)) {
                console.log("本轮提现只限于主号,跳过运行...")
                return
            }
            console.log("正在提现...")
            let pageNum = parseInt(this.profile.page || 5)
            for (let _ = 1; _<=pageNum; _++) {
                let list = await this.algo.curl({
                        'url': `http://api.m.jd.com/`,
                        'form': `functionId=superRedBagList&body={"pageNum":${_},"pageSize":100,"linkId":"${this.linkId}","business":"fission"}&t=1710478841011&appid=activities_platform&client=ios&clientVersion=12.3.4&loginType=2&loginWQBiz=wegame&uuid=-1&build=-1&screen=390*844&networkType=-1&d_brand=-1&d_model=-1&lang=zh_CN&osVersion=-1&partner=-1&cthr=1`,
                        cookie,
                        algo: {
                            appId: 'f2b1d'
                        }
                    }
                )
                if (!this.haskey(list, 'data.items') || (this.haskey(list, 'data.items') && list.data.items.length<1)) {
                    console.log(`获取第${_}页时没有数据[${_ * 100 - 99}_${_ * 100}]...`)
                    break
                }
                console.log(`获取第${_}页...`)
                for (let i of this.haskey(list, 'data.items')) {
                    if (i.prizeType == 4 && i.state == 0) {
                        let cash = await this.algo.curl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=apCashWithDraw&body={"linkId":"${this.linkId}","businessSource":"NONE","base":{"id":${i.id},"business":"fission","poolBaseId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeBaseId":${i.prizeBaseId},"prizeType":${i.prizeType}}}&t=1677826760325&appid=activities_platform&client=ios&clientVersion=12.3.4`,
                                cookie,
                                algo: {
                                    appId: '3c023'
                                }
                            }
                        )
                        console.log(`现金: ${i.amount}  ${this.haskey(cash, 'data.message')}`, p.user)
                        let message = this.haskey(cash, 'data.message')
                        if (message.includes('风控')) {
                            console.log("风控账户,不能提现")
                            break
                        }
                        await this.wait(2000)
                    }
                    else if (i.prizeType == 4 && i.state == 2) {
                        if (this.profile.change) {
                            let change = await this.curl({
                                    'url': `https://api.m.jd.com/`,
                                    'form': `functionId=apRecompenseDrawPrize&body={"linkId":"${this.linkId}","drawRecordId":${i.id},"business":"fission","poolId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeId":${i.prizeBaseId}}&t=1677828892054&appid=activities_platform&client=ios&clientVersion=11.6.2&cthr=1&uuid=31dbd03adc234a4f7b53d2ab98fe45e442ef8c23&build=168548&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=13.7&partner=&eid=eidI9f3b812081s9gBRFzHVvSLKFyLkI3gRVC4AUR0pS4q%2FTLWhDlWOgSf3sd8Pw8GQF2mt5nHCd%2BUPdaH%2BNFDpcnMR8V4l92V0jkRYYg32WNMM5UbBj`,
                                    cookie
                                }
                            )
                            console.log(`转换现金:`, i.amount, this.haskey(change, 'data. prizeDesc'))
                        }
                        else {
                            let cash = await this.algo.curl({
                                    'url': `https://api.m.jd.com/`,
                                    'form': `functionId=apCashWithDraw&body={"linkId":"${this.linkId}","businessSource":"NONE","base":{"id":${i.id},"business":"fission","poolBaseId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeBaseId":${i.prizeBaseId},"prizeType":${i.prizeType}}}&t=1677826760325&appid=activities_platform&client=ios&clientVersion=12.3.4`,
                                    cookie,
                                    algo: {
                                        appId: '3c023'
                                    }
                                }
                            )
                            console.log(`现金: ${i.amount}  ${this.haskey(cash, 'data.message')}`, p.user)
                            let message = this.haskey(cash, 'data.message')
                            if (message.includes('风控')) {
                                console.log("风控账户,不能提现")
                                break
                            }
                            await this.wait(2000)
                        }
                    }
                }
                await this.wait(6000)
            }
        }
    }
}

module.exports = Main;
