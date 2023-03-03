const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东团圆领红包"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo', 'jdUrl']
        this.turn = 3
        this.hint = {
            reward: '默认兑换京喜红包,如需兑换特价红包,设置节点reward设置为lite',
            activeId: "如有新活动activeId,自行设定节点activeId"
        }
        // this.readme = '默认兑换京喜红包,如需兑换特价红包,设置脚本节点reward=lite'
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: "lite", "version": "3.1", 'appId': '38c56'
        })
        this.signStr = this.modules.jdUrl.signStr
        this.profile.activeId = this.profile.activeId || '63ef4e50c800b87f7a99e144'
    }

    async main(p) {
        let cookie = p.cookie;
        if (this.turnCount == 1) {
            this.assert(this.code.length>0, "没有可以助力的账户")
            for (let i of this.code) {
                if (i.finish || i.completionCnt == i.assignmentTimesLimit) {
                    console.log("助力已完成:", i.user)
                }
                else if (i.user == p.user
                ) {
                    console.log("不能助力自己")
                }
                else {
                    let help = await this.algo.curl({
                            'url': `https://api.m.jd.com/api`,
                            form: `g_ty=h5&g_tk=&appCode=ms2362fc9e&body={"activeId":"${this.profile.activeId}","shareId":"${i.shareId}","itemId":"${i.itmeId}"}&appid=cs_h5&client=cs_h5&functionId=festivalhb_help&clientVersion=1.0&loginType=2&sceneval=2`,
                            cookie,
                            algo: {
                                type: "pingou", "version": "3.1", 'appId': '38c56'
                            }
                        }
                    )
                    console.log("助力:", i.user, help.msg)
                    if (this.haskey(help, 'data')) {
                        i.completionCnt++
                        if (i.completionCnt == i.assignmentTimesLimit) {
                            i.finish = 1
                        }
                    }
                    break
                }
            }
        }
        else {
            if (this.turnCount == 2) {
                if (!this.cookies.help.includes(cookie)) {
                    console.log("不是被助力账户,此轮跳过运行")
                    return
                }
            }
            let dict = {
                hongbao: [],
                xianjin: []
            }
            for (let n = 0; n<2; n++) {
                var home = await this.algo.curl({
                        'url': `https://api.m.jd.com/api`,
                        'form': `g_ty=h5&g_tk=&appCode=ms2362fc9e&body=%7B%22activeId%22%3A%22${this.profile.activeId}%22%7D&appid=cs_h5&client=cs_h5&functionId=festivalhb_home&clientVersion=1.0&loginType=2&sceneval=2`,
                        cookie,
                        algo: {
                            type: n == 0 ? 'lite' : 'pingou', "version": "3.1", 'appId': '38c56'
                        }
                    }
                )
                for (let i of this.haskey(home, 'data.browseTaskList')) {
                    if (i.completionCnt != i.assignmentTimesLimit) {
                        let s = await this.algo.curl({
                                'url': `https://api.m.jd.com/api`,
                                'form': `?g_ty=h5&g_tk=&appCode=ms2362fc9e&body={"activeId":"${this.profile.activeId}","taskId":"${i.encryptAssignmentId}","itemId":"${i.shoppingActivityList[0].itemId}"}&appid=cs_h5&client=cs_h5&functionId=festivalhb_browse&clientVersion=1.0&loginType=2&sceneval=2`,
                                cookie,
                                algo: {
                                    type: "lite", "version": "3.1", 'appId': '38c56'
                                }
                            }
                        )
                        console.log('正在运行:', i.assignmentName, this.haskey(s, 'msg'))
                    }
                    else {
                        console.log("任务已完成:", i.assignmentName)
                    }
                }
                let drawChanceNum = this.haskey(home, 'data.drawChanceNum') || 0
                console.log("可抽奖次数:", drawChanceNum)
                let req = {
                    'url': `https://api.m.jd.com/api`,
                    // 'form': `g_ty=h5&g_tk=&appCode=ms2362fc9e&body={"activeId":"63ef4e50c800b87f7a99e144"}&appid=cs_h5&client=cs_h5&functionId=festivalhb_draw&clientVersion=1.0&loginType=2&sceneval=2`,
                    'form': `g_ty=h5&g_tk=&appCode=msd1188198&body={"activeId":"${this.profile.activeId}"}&appid=jx_h5&client=jx_h5&functionId=festivalhb_draw&clientVersion=1.0&loginType=2&sceneval=2`,
                    algo: {
                        // type: 'lite', "version": "3.1", 'appId': '38c56',
                        type: 'pingou', "version": "3.1", 'appId': '99062'
                    },
                    cookie,
                }
                if (this.profile.reward == 'lite') {
                    req = {
                        'url': `https://api.m.jd.com/api`,
                        'form': `g_ty=h5&g_tk=&appCode=ms2362fc9e&body={"activeId":"${this.profile.activeId}"}&appid=cs_h5&client=cs_h5&functionId=festivalhb_draw&clientVersion=1.0&loginType=2&sceneval=2`,
                        algo: {
                            type: 'lite', "version": "3.1", 'appId': '38c56',
                        },
                        cookie,
                    }
                }
                for (let i of Array(drawChanceNum)) {
                    var r = await this.algo.curl(req)
                    if (this.haskey(r, 'msg').includes("火爆")) {
                        console.log(r.msg)
                        break
                    }
                    await this.wait(500)
                    for (let k of this.haskey(r, 'data.prize')) {
                        console.log("获得:", k)
                        if (k.prizeType == 3) {
                            dict.xianjin.push(k.discount)
                        }
                        else if (k.prizeType == 2) {
                            dict.hongbao.push(k.discount)
                        }
                    }
                }
            }
            if (this.haskey(home, 'data.helpTask.itemId') && this.cookies.help.includes(p.cookie)) {
                let shareCode = {
                    user: p.user, shareId: home.data.shareId, itmeId: home.data.helpTask.itemId,
                    assignmentTimesLimit: home.data.helpTask.assignmentTimesLimit,
                    completionCnt: home.data.helpTask.completionCnt,
                }
                console.log("助力码:", shareCode)
                this.code.push(shareCode)
            }
            console.log("本次获得:", dict)
            if (dict.hongbao.length>0) {
                this.print(`获得红包: ${parseFloat(this.sum(dict.hongbao))}`, p.user)
            }
            if (dict.xianjin.length>0) {
                this.print(`获得现金: ${parseFloat(this.sum(dict.xianjin))}`, p.user)
            }
            let prizeList = await this.curl({
                    'url': `https://api.m.jd.com/api?functionId=festivalhb_querymyprizelist&appid=cs_h5&t=1674021167787&channel=jxh5&cv=1.2.5&clientVersion=1.2.5&client=jxh5&uuid=196670312082605&cthr=1&loginType=2&body=${this.dumps(this.signStr({
                        "activeId": this.profile.activeId,
                        "type": 1,
                        "isExpire": 1,
                        "lng": "0.000000",
                        "lat": "0.000000",
                        "un_area": "0_0_0_0",
                        "$taroTimestamp": new Date().getTime(),
                        "sceneval": 2,
                        "buid": 325,
                        "appCode": "ms2362fc9e",
                        "time": new Date().getTime(),
                    }))}`,
                    // 'form':``,
                    cookie
                }
            )
            let data = this.haskey(prizeList, 'data')
            if (data) {
                console.log('共获得红包:', data.totalHbAmount)
                console.log("共获得现金:", data.totalCoinAmount)
                if (parseFloat(data.canUseCoinAmount)>0) {
                    console.log('可提现:', data.canUseCoinAmount)
                    let exangeList = await this.curl({
                            'url': `https://api.m.jd.com/api?functionId=festivalhb_queryexchangelist&appid=cs_h5&t=1674021180469&channel=jxh5&cv=1.2.5&clientVersion=1.2.5&client=jxh5&uuid=196670312082605&cthr=1&loginType=2&body=${this.dumps(this.signStr({
                                "activeId": this.profile.activeId, "sceneval": 2, "buid": 325, "appCode": "ms2362fc9e",
                                "time": new Date().getTime(),
                            }))}`,
                            // 'form':``,
                            cookie
                        }
                    )
                    let id = ''
                    let name = ''
                    if (this.haskey(exangeList, 'data.cashExchangeRuleList')) {
                        for (let i of exangeList.data.cashExchangeRuleList) {
                            if (parseFloat(data.canUseCoinAmount)>=i.cashoutAmount && i.exchangeStatus == 1) {
                                console.log("可兑换选项:", i.name)
                                id = i.id
                                name = i.name
                            }
                        }
                    }
                    if (id) {
                        console.log("正在兑换:", name)
                        let reward = await this.algo.curl({
                                'url': `https://api.m.jd.com/api?functionId=jxPrmtExchange_exchange&appid=cs_h5&t=1673970348801&channel=jxh5&cv=1.2.5&clientVersion=1.2.5&client=jxh5&uuid=196670312082605&cthr=1&loginType=2&body=${this.dumps(this.signStr({
                                    "bizCode": "festivalhb",
                                    "ruleId": id,
                                    "sceneval": 2,
                                    "buid": 325,
                                    "appCode": "ms2362fc9e",
                                    "time": new Date().getTime(),
                                }))}`,
                                cookie,
                                algo: {
                                    appId: 'af89e',
                                    type: "lite",
                                    "version": "400",
                                }
                            }
                        )
                        console.log(reward)
                        if (this.haskey(reward, 'data.cashoutResult.cashoutMsg', '成功')) {
                            this.print(`提现:${name}`, p.user)
                        }
                    }
                }
            }
            // console.log(body)
        }
    }
}

module.exports = Main;
