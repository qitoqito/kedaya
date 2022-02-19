const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东抽奖机"
        this.cron = "26 0,18 * * *"
        this.help = 'main'
        this.task = 'local'
        this.thread = 6
        this.filter = 'appId'
    }

    async prepare() {
        let custom = this.getValue('custom')
        let add = this.getValue('expand')
        if (custom.length) {
            for (let c of custom) {
                let dict = c.includes("=") ? this.query(c, '&', 'split') : {'appId': c}
                this.shareCode.push(dict)
            }
        }
        else {
            this.shareCode = [
                {
                    appId: '1EFRWxKuG',
                },
                {
                    appId: '1FFVQyqw',
                },
                {appId: '1E1xZy6s'},
            ]
            if (add.length) {
                for (let c of add) {
                    let dict = c.includes("=") ? this.query(c, '&', 'split') : {'appId': c}
                    this.shareCode.push(dict)
                }
            }
        }
        for (let cookie of this.cookies['help']) {
            for (let i of this.shareCode) {
                let s = await this.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=${i.home || 'healthyDay'}_getHomeData&body={"appId":"${i.appId}","taskToken":""}&client=wh5&clientVersion=1.0.0`,
                        cookie
                    }
                )
                try {
                    for (let j of s.data.result.taskVos) {
                        if (j.assistTaskDetailVo) {
                            i.taskId = j.taskId
                            i.inviter = i.inviter || []
                            i.inviter.push({taskToken: j.assistTaskDetailVo.taskToken})
                            break
                        }
                    }
                } catch (e) {
                }
            }
        }
    }

    async middle(p) {
        this.dict[p.user] = {gifts: []}
    }

    async main(p) {
        let cookie = p.cookie;
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
                'form': `appid=wh5&clientVersion=1.0.0&functionId=${home}_getHomeData&body={"taskToken":"","appId":"${appId}","channelId":${channelId}`,
                cookie
            }
        )
        let gifts = []
        let text = ''
        this.assert(this.haskey(l, 'data.result.taskVos'), '活动已经执行过或者无权访问')
        for (let i of l.data.result.taskVos) {
            if (i.status == 1 || i.status == 3) {
                let vos = i.browseShopVo || i.shoppingActivityVos || i.productInfoVos || i.followShopVo || i.brandMemberVos || []
                if (vos.length>0) {
                    console.log(p.index, `正在做${i.subTitleName}=========`)
                }
                else {
                    if (i.subTitleName && i.subTitleName.includes("浏览")) {
                        let getFeedDetail = await this.curl({
                            'url': `https://api.m.jd.com/client.action?advId=${home}_getHomeData`,
                            'form': `functionId=${home}_getHomeData&body={"taskId":"${i.taskId}"}&client=wh5&clientVersion=1.0.0`,
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
                                form: `functionId=${collect}_collectScore&body=${JSON.stringify(body)}&client=wh5&clientVersion=1.0.0`,
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
                            form: `functionId=${collect}_collectScore&body=${JSON.stringify(body)}&client=wh5&clientVersion=1.0.0`,
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
                        form: `functionId=${collect}_collectScore&body=${JSON.stringify(body)}&client=wh5&clientVersion=1.0.0`,
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
                            form: `functionId=${collect}_collectScore&body=${JSON.stringify(body)}&client=wh5&clientVersion=1.0.0`,
                            cookie
                        })
                        console.log(p.index, '获得奖励:', this.haskey(collectScore, 'data.result.score'));
                    }
                }
            }
            else if (i.assistTaskDetailVo) {
                for (let zz of p.inviter.inviter || []) {
                    console.log(`正在给 ${zz.taskToken} 助力`)
                    let body = {
                        'taskId': i.taskId,
                        'taskToken': zz.taskToken,
                        'actionType': 0,
                        "appId": appId
                    }
                    let collectScore = await this.curl({
                        url: `https://api.m.jd.com/client.action?advId=${collect}_collectScore`,
                        form: `functionId=${collect}_collectScore&body=${JSON.stringify(body)}&client=wh5&clientVersion=1.0.0`,
                        cookie
                    })
                }
            }
            else {
                console.log(p.index, `${i.taskName}任务已完成...`)
            }
            let c = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=${lottery}_getLotteryResult&body={"appId":"${appId}","taskId":${i.taskId}}&client=wh5&clientVersion=1.0.0`,
                    cookie
                }
            )
            if (c.data.result) {
                if (this.haskey(c, 'data.result.userAwardsCacheDto.redPacketVO')) {
                    text = `获得红包: ${c.data.result.userAwardsCacheDto.redPacketVO.value}`
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
                    console.log(p.user, '抽奖获得', c.data.result)
                }
            }
        }
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=${home}_getHomeData&body={"appId":"${appId}","taskToken":""}&client=wh5&clientVersion=1.0.0`,
                cookie
            }
        )
        for (let z = 0; z<s.data.result.userInfo.lotteryNum; z++) {
            let c = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=${lottery}_getLotteryResult&body={"appId":"${appId}"}&client=wh5&clientVersion=1.0.0`,
                    cookie
                }
            )
            if (c.data.result) {
                if (this.haskey(c, 'data.result.userAwardsCacheDto.redPacketVO')) {
                    text = `获得红包: ${c.data.result.userAwardsCacheDto.redPacketVO.value}`
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
                    console.log(p.user, '抽奖获得', c.data.result)
                }
            }
        }
        this.dict[p.user]['gifts'] = [...this.dict[p.user]['gifts'], ...gifts]
    }

    async extra() {
        for (let cookie of this.cookies[this.task]) {
            let user = this.userName(cookie)
            if (this.dict[user].gifts.length) {
                console.log(user, `本次运行奖励:\n${this.dict[user].gifts.join("\n")}`)
                this.notices(this.dict[user].gifts.join("\n"), user)
            }
        }
    }
}

module.exports = Main;
