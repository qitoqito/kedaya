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
            help: "每天最多助力1人,有些黑号提现不了,请自行设置主号",
            change: "部分黑号提现不了,可以将现金转换红包,如需转换,请自行设置节点 change=1",
            delay: "默认500,即每次请求间隔为0.5s,如需修改,请自行设置节点 delay=n",
            count: '如需设置主号最多助力人数,请自行设置节点 count=n',
            stop: '抽奖过程中,如果抽到优惠券就停止抽奖'
        }
        // this.verify = 1
    }

    async prepare() {
        this.linkId = this.custom || '3orGfh1YkwNLksxOcN8zWQ'
        this.clientVersion = '12.4.2'
        this.algo = new this.modules.jdAlgo()
        console.log("获取助力码中...")
        for (let cookie of this.cookies.help) {
            let user = this.userName(cookie)
            let home = await this.algo.curl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=inviteFissionBeforeHome&body={"linkId":"${this.linkId}","isJdApp":false,"inviter":""}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=1.0.0&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                    cookie,
                    algo: {
                        type: "main",
                        version: "4.4",
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
                            form: `functionId=inviteFissionHome&body={"linkId":"${this.linkId}","inviter":""}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=1.0.0&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                            // 'form':``,
                            cookie,
                            algo: {
                                type: "main",
                                version: "4.4",
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
                        form: `functionId=inviteFissionhelp&body={"linkId":"${this.linkId}","isJdApp":true,"inviter":"${p.inviter.inviter}"}&t=1686444659424&appid=activities_platform&client=ios&clientVersion=1.0.0&build=&screen=375*667&networkType=wifi&d_brand=&d_model=&lang=zh_CN&osVersion=15_7_5&partner=&cthr=1`,
                        // 'form':``,
                        cookie,
                        algo: {
                            type: "main",
                            version: "4.4",
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
                        'url': `https://api.m.jd.com/?functionId=inviteFissionHome&body={"linkId":"${this.linkId}","inviter":"${p.inviter.inviter}"}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=12.4.2`,
                        // 'form':``,
                        cookie,
                        algo: {
                            type: "main",
                            version: "4.4",
                            appId: 'eb67b'
                        }
                    }
                )
            }
        }
        else if (this.turnCount == 1) {
            console.log("正在抽奖...")
            let invite = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=inviteFissionHome&body={"linkId":"${this.linkId}","inviter":""}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=12.4.2`,
                    // 'form':``,
                    cookie,
                    algo: {
                        type: "main",
                        version: "4.4",
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
                        'url': `https://api.m.jd.com/?functionId=inviteFissionDrawPrize&body={%22linkId%22:%22${this.linkId}%22,%22lbs%22:%22null%22}&t=1677826749458&appid=activities_platform&client=ios&clientVersion=12.4.2`,
                        // 'form':``,
                        'referer': 'https://pro.m.jd.com/mall/active/3BwUqhLsJYrHP4qgAgDDJGrSVngK/index.html',
                        cookie,
                        algo: {
                            type: "main",
                            version: "4.4",
                            appId: 'c02c6',
                            //  ua: 'jdapp;iPhone;12.4.2;;;M/5.0;appBuild/169143;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22CJKyZJK4DQHuDtCmZWS3YJHtYtZvENY1CWVuCtDuZWPtCWOyZJK2Dm%3D%3D%22%2C%22sv%22%3A%22CJUkDy41%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1710325397%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 15_7_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;'
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
            console.log("正在提现...")
            for (let _ = 1; _<=5; _++) {
                let list = await this.algo.curl({
                        'url': `https://api.m.jd.com/?functionId=superRedBagList&body={"linkId":"${this.linkId}","pageNum":${_},"pageSize":100,"business":"fission"}&t=1677826759113&appid=activities_platform&client=ios&clientVersion=12.4.2`,
                        // 'form':``,
                        cookie,
                        algo: {
                            type: "main",
                            version: "4.4",
                            appId: 'f2b1d'
                        }
                    }
                )
                for (let i of this.haskey(list, 'data.items')) {
                    if (i.prizeType == 4 && i.state == 0) {
                        let cash = await this.algo.curl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=apCashWithDraw&body={"linkId":"${this.linkId}","businessSource":"NONE","base":{"id":${i.id},"business":"fission","poolBaseId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeBaseId":${i.prizeBaseId},"prizeType":${i.prizeType}}}&t=1677826760325&appid=activities_platform&client=ios&clientVersion=12.4.2`,
                                cookie,
                                algo: {
                                    type: "main",
                                    version: "4.4",
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
                                    'form': `functionId=apCashWithDraw&body={"linkId":"${this.linkId}","businessSource":"NONE","base":{"id":${i.id},"business":"fission","poolBaseId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeBaseId":${i.prizeBaseId},"prizeType":${i.prizeType}}}&t=1677826760325&appid=activities_platform&client=ios&clientVersion=12.4.2`,
                                    cookie,
                                    algo: {
                                        type: "main",
                                        version: "4.4",
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
                await this.wait(1000)
            }
        }
    }
}

module.exports = Main;
