const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东抽奖机"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        // this.thread = 3
        this.filter = 'appId'
        this.interval = 2000
        this.turn = 2
        this.import = ['jdUrl', 'crypto-js', 'fs', 'vm']
    }

    async prepare() {
        try {
            let js = await this.modules.fs.readFileSync(this.dirname + '/static/vendors.683f5a61.js', 'utf-8')
            const fnMock = new Function;
            const ctx = {
                window: {addEventListener: fnMock},
                document: {
                    addEventListener: fnMock,
                    removeEventListener: fnMock,
                },
                navigator: {userAgent: 'okhttp/3.12.1;jdmall;android;version/9.5.4;build/88136;screen/1440x3007;os/11;network/wifi;'}
            };
            this.modules.vm.createContext(ctx);
            this.modules.vm.runInContext(js, ctx);
            this.smashUtils = ctx.window.smashUtils;
        } catch (e) {
        }
        let custom = this.getValue('custom')
        let expand = this.getValue('expand')
        if (custom.length) {
            for (let c of custom) {
                let dict = c.includes("=") ? this.query(c, '&', 'split') : {'appId': c}
                this.shareCode.push(dict)
            }
        }
        else {
            if (expand.length) {
                for (let c of expand) {
                    let dict = c.includes("=") ? this.query(c, '&', 'split') : {'appId': c}
                    this.shareCode.push(dict)
                }
            }
        }
        let cookie = this.cookies.all[0]
        for (let i of this.shareCode) {
            this.options["headers"]["user-agent"] = this.getUa()
            if (!i.lottery) {
                let lotteryList = ['splitHongbao', 'interact_template',]
                let body = await this.body({"appId": i.appId})
                for (let l of lotteryList) {
                    let c = await this.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `functionId=${l}_getLotteryResult&body=${this.dumps(await this.body(body))}&client=wh5&clientVersion=1.0.0`,
                            cookie
                        }
                    )
                    if (this.haskey(c, 'msg', "登陆失败") || this.haskey(c, 'data.bizMsg').includes("火爆")) {
                        cookie = this.cookies.all[1]
                        c = await this.curl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `functionId=${l}_getLotteryResult&body=${this.dumps(await this.body(body))}&client=wh5&clientVersion=1.0.0`,
                                cookie
                            }
                        )
                    }
                    let msg = this.haskey(c, 'data.bizMsg')
                    if (this.haskey(c, 'data.success') || msg.includes("抽奖")) {
                        i.lottery = l
                        let o = await this.curl({
                                'url': `https://api.m.jd.com/`,
                                'form': `appid=wh5&clientVersion=1.0.0&functionId=${l}_getHomeData&body={"taskToken":"","appId":"${i.appId}","channelId":1}`,
                                cookie
                            }
                        )
                        if (this.haskey(o, 'data.result')) {
                            i.home = l
                        }
                        break
                    }
                }
            }
        }
    }

    async middle(p) {
        this.dict[p.user] = {gifts: [], report: []}
    }

    async main(p) {
        let cookie = p.cookie;
        let pin = this.userPin(cookie)
        this.options["headers"]["user-agent"] = this.getUa()
        if (this.turnCount == 0) {
            let home = p.inviter.home || 'healthyDay'
            let collect = p.inviter.collect || "harmony"
            let appId = p.inviter.appId || ""
            let lottery = p.inviter.lottery || 'interact_template'
            let channelId = p.inviter.channelId || 1
            if (p.inviter.title) {
                console.log(`正在运行 ${p.inviter.title}`)
            }
            let l = await this.curl({
                    'url': `https://api.m.jd.com/`,
                    'form': `appid=wh5&clientVersion=1.0.0&functionId=${home}_getHomeData&body={"taskToken":"","appId":"${appId}","channelId":${channelId}}`,
                    cookie
                }
            )
            let gifts = []
            let text = ''
            this.assert(this.haskey(l, 'data.result.taskVos'), '活动已经执行过或者无权访问')
            let shareCode = {}
            for (let i of this.haskey(l, 'data.result.taskVos')) {
                if (i.assistTaskDetailVo) {
                    if (this.cookies.help.includes(cookie)) {
                        this.plan[appId] = this.plan[appId] || []
                        let code = {
                            taskToken: i.assistTaskDetailVo.taskToken,
                            user: p.user,
                            lottery, collect, 'taskId': i.taskId,
                        }
                        code['report'] = ({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `functionId=${lottery}_getLotteryResult&body=${this.dumps(await this.body({"appId": appId}))}&client=wh5&clientVersion=1.0.0`,
                            cookie
                        })
                        if (i.assistTaskDetailVo.assistInfoVos) {
                            code.inviter = this.column(i.assistTaskDetailVo.assistInfoVos, 'pin')
                        }
                        if (i.status == 2 || i.times == i.maxTimes) {
                            code.finish = 1
                        }
                        this.plan[appId].push(code)
                    }
                }
                else if (i.status == 1 || i.status == 3) {
                    let vos = i.browseShopVo || i.shoppingActivityVos || i.productInfoVos || i.followShopVo || i.brandMemberVos || []
                    if (vos.length>0) {
                        console.log(p.index, `正在做${i.subTitleName}=========`)
                    }
                    else {
                        if (i.subTitleName && i.subTitleName.includes("浏览")) {
                            let getFeedDetail = await this.curl({
                                'url': `https://api.m.jd.com/client.action?advId=${home}_getHomeData`,
                                'form': `functionId=${home}_getHomeData&body=${this.dumps(await this.body({"taskId": i.taskId}))}&client=wh5&clientVersion=1.0.0`,
                                cookie
                            })
                            for (let y of getFeedDetail.data.result.addProductVos[0].productInfoVos.splice(0, 5)) {
                                let body = {
                                    'taskId': i.taskId,
                                    'taskToken': y.taskToken,
                                    'actionType': 0, "appId": appId
                                }
                                let collectScore = await this.curl({
                                    url: `https://api.m.jd.com/client.action?advId=${collect}_collectScore`,
                                    form: `functionId=${collect}_collectScore&body=${JSON.stringify(await this.body(body))}&client=wh5&clientVersion=1.0.0`,
                                    cookie
                                })
                                console.log(p.index, "加购获得:", this.haskey(collectScore, 'data.result.acquiredScore'))
                            }
                        }
                        else if (i.simpleRecordInfoVo) {
                            let body = {
                                "taskId": i.taskId,
                                "taskToken": i.simpleRecordInfoVo.taskToken, "appId": appId
                            }
                            let collectScore = await this.curl({
                                url: `https://api.m.jd.com/client.action?advId=${collect}_collectScore`,
                                form: `functionId=${collect}_collectScore&body=${JSON.stringify(await this.body(body))}&client=wh5&clientVersion=1.0.0`,
                                cookie
                            })
                            console.log(collectScore);
                        }
                        else {
                            // console.log(i);
                        }
                    }
                    for (let j of vos.splice(0, i.maxTimes - i.times)) {
                        let taskName = j.shopName || j.title || j.skuName
                        console.log(p.index, `正在做: ${taskName}`)
                        let body = {
                            'taskId': i.taskId,
                            'taskToken': j.taskToken,
                            'actionType': 1,
                            "appId": appId
                        }
                        let collectScore = await this.curl({
                            url: `https://api.m.jd.com/client.action?advId=${collect}_collectScore`,
                            form: `functionId=${collect}_collectScore&body=${JSON.stringify(await this.body(body))}&client=wh5&clientVersion=1.0.0`,
                            cookie
                        })
                        this.haskey(collectScore, 'data.result.taskToken') ? console.log(p.index, "获取任务:", collectScore.data.result.taskToken) : console.log(p.index, "获取奖励中", this.haskey(collectScore, 'data.result.score.score'))
                        j.url ? await this.curl(j.url) : ''
                        j.copy1 ? await this.curl(j.copy1) : ''
                        if (i.waitDuration || this.match(/浏览\d+秒/, i.subTitleName)) {
                            await this.wait((i.waitDuration || this.match(/浏览(\d+)秒/, i.subTitleName)) * 1000)
                            body = {
                                'taskId': i.taskId,
                                'taskToken': j.taskToken,
                                'actionType': 0,
                                "appId": appId
                            }
                            collectScore = await this.curl({
                                url: `https://api.m.jd.com/client.action?advId=${collect}_collectScore`,
                                form: `functionId=${collect}_collectScore&body=${JSON.stringify(await this.body(body))}&client=wh5&clientVersion=1.0.0`,
                                cookie
                            })
                            console.log(p.index, '获得奖励:', this.haskey(collectScore, 'data.result.score'));
                        }
                    }
                    let c = await this.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `functionId=${lottery}_getLotteryResult&body=${this.dumps(await this.body({
                                "appId": appId,
                                "taskId": i.taskId
                            }))}&client=wh5&clientVersion=1.0.0`,
                            cookie
                        }
                    )
                    if (this.haskey(c, 'data.result.userAwardsCacheDto.redPacketVo')) {
                        text = `获得红包: ${c.data.result.userAwardsCacheDto.redPacketVo.value}`
                        console.log(p.user, text)
                        gifts.push(text)
                    }
                    else if (this.haskey(c, 'data.result.userAwardsCacheDto.jBeanAwardVo')) {
                        text = `获得京豆:${c.data.result.userAwardsCacheDto.jBeanAwardVo.quantity}`
                        console.log(p.user, text)
                        gifts.push(text)
                    }
                    else if (this.haskey(c, 'data.result.userAwardsCacheDto.couponVo')) {
                        text = `获得优惠券${c.data.result.userAwardsCacheDto.couponVo.prizeName}:${c.data.result.userAwardsCacheDto.couponVo.usageThreshold}-${c.data.result.userAwardsCacheDto.couponVo.quota}`
                        console.log(p.user, text)
                        gifts.push(text)
                    }
                    else {
                        console.log(p.user, '抽奖获得', c.data)
                    }
                }
                else {
                    console.log(p.index, `${i.taskName}任务已完成...`)
                }
            }
            let s = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=${home}_getHomeData&body=${this.dumps(await this.body({"appId": appId}))}&client=wh5&clientVersion=1.0.0`,
                    cookie
                }
            )
            if (this.haskey(s, 'data.result')) {
                for (let z = 0; z<Math.min(s.data.result.userInfo.userScore / s.data.result.userInfo.scorePerLottery, 10); z++) {
                    let body = await this.body({"appId": appId})
                    let c = await this.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `functionId=${lottery}_getLotteryResult&body=${this.dumps(await this.body(body))}&client=wh5&clientVersion=1.0.0`,
                            cookie
                        }
                    )
                    if (c.data.result) {
                        if (this.haskey(c, 'data.result.userAwardsCacheDto.redPacketVo')) {
                            text = `获得红包: ${c.data.result.userAwardsCacheDto.redPacketVo.value}`
                            console.log(p.user, text)
                            gifts.push(text)
                        }
                        else if (this.haskey(c, 'data.result.userAwardsCacheDto.jBeanAwardVo')) {
                            text = `获得京豆:${c.data.result.userAwardsCacheDto.jBeanAwardVo.quantity}`
                            console.log(p.user, text)
                            gifts.push(text)
                        }
                        else if (this.haskey(c, 'data.result.userAwardsCacheDto.couponVo')) {
                            text = `获得优惠券${c.data.result.userAwardsCacheDto.couponVo.prizeName}:${c.data.result.userAwardsCacheDto.couponVo.usageThreshold}-${c.data.result.userAwardsCacheDto.couponVo.quota}`
                            console.log(p.user, text)
                            gifts.push(text)
                        }
                        else {
                            console.log(p.user, '抽奖获得', c.data)
                        }
                    }
                }
            }
            this.dict[p.user]['gifts'] = [...this.dict[p.user]['gifts'], ...gifts]
        }
        else {
            for (let i in this.plan) {
                let inviter = this.plan[i]
                if (inviter.length>0) {
                    for (let zz of inviter) {
                        let help = zz.inviter || []
                        if (zz.finish) {
                            console.log(`${zz.user}助力已满,不用再助力了`)
                        }
                        else if (help.includes(pin)) {
                            console.log(`已经给${zz.user}助力过了`)
                        }
                        else {
                            await this.wait(2000)
                            console.log(`正在给 ${zz.user} 助力`)
                            let body = {
                                'taskId': zz.taskId,
                                'taskToken': zz.taskToken,
                                'actionType': 0,
                                "appId": i
                            }
                            let collectScore = await this.curl({
                                url: `https://api.m.jd.com/client.action?advId=${zz.collect}_collectScore`,
                                form: `functionId=${zz.collect}_collectScore&body=${JSON.stringify(await this.body(body))}&client=wh5&clientVersion=1.0.0`,
                                cookie
                            })
                            let msg = this.haskey(collectScore, 'data.bizMsg')
                            if (msg.includes("上限")) {
                                console.log("没有助力次数了....")
                                return
                            }
                            if (this.haskey(collectScore, 'msg').includes("失败")) {
                                console.log("过期了....")
                                return
                            }
                            if (this.haskey(collectScore, 'data.result')) {
                                console.log("助力成功")
                                if (collectScore.data.result.maxTimes == collectScore.data.result.times) {
                                    console.log("可以不用给TA助力了")
                                    zz.finish = 1
                                }
                                if (collectScore.data.result.maxAssistTimes == collectScore.data.result.alreadyAssistTimes) {
                                    console.log("没有助力次数了....")
                                    return
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    async body(params) {
        let random = this.smashUtils.getRandom(8)
        let log = this.smashUtils.get_risk_result({
            id: random,
            data: {
                random
            }
        }).log;
        let b = {
            "random": random,
            log
        }
        return {...b, ...params}
    }

    async extra() {
        for (let i in this.plan) {
            let inviter = this.plan[i]
            if (inviter.length>0) {
                for (let j of inviter) {
                    this.options["headers"]["user-agent"] = this.getUa()
                    console.log(`${j.user}抽奖中...`)
                    for (let n of Array(5)) {
                        let c = await this.curl(j.report)
                        await this.wait(2000)
                        let msg = this.haskey(c, 'data.bizMsg')
                        if (msg.includes("资格")) {
                            console.log("快去完成任务获得抽奖资格吧")
                            break
                        }
                        if (c.data.result) {
                            if (this.haskey(c, 'data.result.userAwardsCacheDto.redPacketVo')) {
                                text = `获得红包: ${c.data.result.userAwardsCacheDto.redPacketVo.value}`
                                console.log(j.user, text)
                                this.dict[j.user].push(text)
                            }
                            else if (this.haskey(c, 'data.result.userAwardsCacheDto.jBeanAwardVo')) {
                                text = `获得京豆:${c.data.result.userAwardsCacheDto.jBeanAwardVo.quantity}`
                                console.log(j.user, text)
                                this.dict[j.user].push(text)
                            }
                            else if (this.haskey(c, 'data.result.userAwardsCacheDto.couponVo')) {
                                text = `获得优惠券${c.data.result.userAwardsCacheDto.couponVo.prizeName}:${c.data.result.userAwardsCacheDto.couponVo.usageThreshold}-${c.data.result.userAwardsCacheDto.couponVo.quota}`
                                console.log(j.user, text)
                                this.dict[j.user].push(text)
                            }
                            else {
                                console.log(j.user, '抽奖获得', c.data.result)
                            }
                        }
                    }
                }
            }
        }
        for (let cookie of this.cookies[this.task]) {
            let user = this.userName(cookie)
            if (this.dict[user].gifts.length) {
                console.log(user, `本次运行奖励:\n${this.dict[user].gifts.join("\n")}`)
                this.notices(this.dict[user].gifts.join("\n"), user)
            }
        }
        // }
    }
}

module.exports = Main;
