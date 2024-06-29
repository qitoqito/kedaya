const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东超市汪贝"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo', 'fs', 'logBill']
        this.interval = 2000
        this.help = 'main'
        this.hint = {
            openCard: '1,开卡'
        }
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: "4.7",
            type: 'main'
        })
        try {
            let txt = this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_superMarket.json`).toString()
            this.dict = this.loads(txt)
        } catch (e) {
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let data = {}
        for (let o of Array(5)) {
            var html = await this.curl({
                    'url': `https://pro.m.jd.com/mall/active/3nh7HzSjYemGqAHSbktTrf8rrH8M/index.html?stath=20&navh=44&babelChannel=ttt1&tttparams=zZ1qguleyJnTGF0IjozOS45NjEwNTQsInVuX2FyZWEiOiIxXzI4MDBfNTU4MzhfMCIsImRMYXQiOiIiLCJwcnN0YXRlIjoiMCIsImFkZHJlc3NJZCI6IjUzODg3NDg3NyIsImxhdCI6IiIsInBvc0xhdCI6MzkuOTYxMDU0LCJwb3NMbmciOjExNi4zMjIwNjEsImdwc19hcmVhIjoiMF8wXzBfMCIsImxuZyI6IiIsInVlbXBzIjoiMC0wLTAiLCJnTG5nIjoxMTYuMzIyMDYxLCJtb2RlbCI6ImlQaG9uZTEzLDMiLCJkTG5nIjoiIn70=`,
                    cookie,
                    referer: 'https://pro.m.jd.com/mall/active/3nh7HzSjYemGqAHSbktTrf8rrH8M/index.html?stath=20&navh=44&babelChannel=ttt1&tttparams=zZ1qguleyJnTGF0IjozOS45NjEwNTQsInVuX2FyZWEiOiIxXzI4MDBfNTU4MzhfMCIsImRMYXQiOiIiLCJwcnN0YXRlIjoiMCIsImFkZHJlc3NJZCI6IjUzODg3NDg3NyIsImxhdCI6IiIsInBvc0xhdCI6MzkuOTYxMDU0LCJwb3NMbmciOjExNi4zMjIwNjEsImdwc19hcmVhIjoiMF8wXzBfMCIsImxuZyI6IiIsInVlbXBzIjoiMC0wLTAiLCJnTG5nIjoxMTYuMzIyMDYxLCJtb2RlbCI6ImlQaG9uZTEzLDMiLCJkTG5nIjoiIn70='
                }
            )
            try {
                data = (this.loads(this.match(/__api_data__\s*=\s*(.*?)\s*;\s*\n*window/, html)))
            } catch (e) {
                await this.wait(500)
            }
            if (this.dumps(data) != '{}') {
                break
            }
        }
        let signToken = this.match(/"signToken"\s*:\s*"(\w+)"/, html)
        if (signToken) {
            let sign = await this.algo.curl({
                    'url': `https://api.m.jd.com/atop_channel_sign_in`,
                    'form': `appid=jd-super-market&t=1713230766545&functionId=atop_channel_sign_in&client=m&uuid=de21c6604748f97dd3977153e51a47f4efdb9a47&body={"signToken":"${signToken}","channelFollowStatus":1,"bizCode":"cn_retail_jdsupermarket","scenario":"sign","babelChannel":"ttt1","isJdApp":"1","isWx":"0"}`,
                    cookie,
                    algo: {
                        appId: 'b8fc7'
                    }
                }
            )
            if (this.haskey(sign, 'success')) {
                console.log(`签到成功`)
                for (let i of sign.data.rewards) {
                    console.log(`获得: ${i.rewardDesc}`)
                }
            }
            else {
                console.log(this.haskey(sign, 'message') || sign)
            }
        }
        for (let ii in data) {
            if (ii == 'floorList') {
                for (let jj of data[ii]) {
                    if (jj.providerData) {
                        if (this.haskey(jj, 'providerData.data.floorData.name') == '汪贝任务楼层') {
                            let floor = jj.providerData.data.floorData
                            for (let i of floor.items) {
                                if (i.completionFlag) {
                                    console.log(`任务已经完成: ${i.assignmentName}`)
                                }
                                else {
                                    console.log(`正在运行: ${i.assignmentName}`)
                                    let extraType = i.ext.extraType
                                    if (i.assignmentName.includes('邀请')) {
                                        if (this.haskey(i, 'ext.assistTaskDetail.itemId')) {
                                            if (this.cookies.help.includes(p.cookie)) {
                                                console.log("获取助力码:", i.ext.assistTaskDetail.itemId)
                                                this.dict[p.user] = {
                                                    inviterCode: i.ext.assistTaskDetail.itemId
                                                }
                                                let ary = []
                                                let count = Object.keys(this.dict).length
                                                for (let iii = 0; iii<this.cookies.all.length; iii++) {
                                                    if (iii % (Object.keys(this.dict).indexOf(p.user) + 1) == 0) {
                                                        ary.push(iii)
                                                    }
                                                }
                                                ary = [...ary, ...this.random(Array.from({length: this.cookies.all.length}, (ele, index) => index), 5)]
                                                for (let oo of this.random(ary, i.assignmentTimesLimit + 1)) {
                                                    let helpCookie = this.cookies.all[oo]
                                                    let helpPin = this.userName(helpCookie)
                                                    console.log(`正在使用账户: ${helpPin} 进行助力`)
                                                    let h = await this.algo.curl({
                                                            'url': `https://api.m.jd.com/client.action?functionId=atop_channel_complete_task`,
                                                            form: `appid=jd-super-market&t=1715055973095&functionId=atop_channel_complete_task&client=m&uuid=434e858e755c9b1ec6e6d6abc0348d9b6d985300&body={"bizCode":"cn_retail_jdsupermarket","scenario":"sign","assignmentType":"2","encryptAssignmentId":"${i.encryptAssignmentId}","itemId":"${i.ext.assistTaskDetail.itemId}","assistFlag":true,"babelChannel":"ttt1","isJdApp":"1","isWx":"0"}`,
                                                            cookie: helpCookie,
                                                            algo: {appId: '51113'}
                                                        }
                                                    )
                                                    console.log(this.haskey(h, 'data.msg') || this.haskey(h, 'message') || h)
                                                    await this.wait(1000)
                                                }
                                            }
                                        }
                                    }
                                    else if (this.haskey(i, `ext.${i.ext.extraType}`)) {
                                        let extra = i.ext[extraType]
                                        // console.log(extra)
                                        try {
                                            for (let j of extra.slice(0, i.assignmentTimesLimit)) {
                                                if (['shoppingActivity', 'productsInfo', 'browseShop'].includes(extraType)) {
                                                    let d = await this.algo.curl({
                                                            'url': `https://api.m.jd.com/client.action?functionId=atop_channel_complete_task`,
                                                            'form': `appid=jd-super-market&body=${this.dumps(
                                                                {
                                                                    "bizCode": "cn_retail_jdsupermarket",
                                                                    "scenario": "sign",
                                                                    "encryptAssignmentId": i.encryptAssignmentId,
                                                                    "itemId": j.itemId || j.advId,
                                                                    "actionType": 1,
                                                                    "babelChannel": "ttt1",
                                                                    "isJdApp": "1",
                                                                    "isWx": "0"
                                                                }
                                                            )}&sign=11&t=1653132222710`,
                                                            cookie, algo: {
                                                                appId: '51113'
                                                            }
                                                        }
                                                    )
                                                    console.log(this.haskey(d, 'data.msg') || this.haskey(d, 'message'))
                                                    await this.wait((i.ext.waitDuration || 0) * 1000 + 500)
                                                }
                                                let s = await this.curl({
                                                        'url': `https://api.m.jd.com/client.action?functionId=atop_channel_complete_task`,
                                                        'form': `appid=jd-super-market&body=${this.dumps(
                                                            {
                                                                "bizCode": "cn_retail_jdsupermarket",
                                                                "scenario": "sign",
                                                                "encryptAssignmentId": i.encryptAssignmentId,
                                                                "itemId": j.itemId || j.advId,
                                                                "babelChannel": "ttt1",
                                                                "isJdApp": "1",
                                                                "isWx": "0"
                                                            }
                                                        )}&sign=11&t=1653132222710`,
                                                        cookie, algo: {
                                                            appId: '51113'
                                                        }
                                                    }
                                                )
                                                console.log(i.assignmentName, this.haskey(s, 'data.msg') || this.haskey(s, 'message'))
                                                if (this.haskey(s, 'message', '风险等级未通过')) {
                                                    return
                                                }
                                                if (this.haskey(s, 'message', '活动太火爆了')) {
                                                    break
                                                }
                                                if (this.haskey(s, 'data.doTaskRewardsInfo.successRewards')) {
                                                    for (let kkk in s.data.doTaskRewardsInfo.successRewards) {
                                                        for (let kkkk of s.data.doTaskRewardsInfo.successRewards[kkk]) {
                                                            console.log(`获得:`, kkkk.quantity, kkkk.rewardName)
                                                        }
                                                    }
                                                }
                                                await this.wait(1000)
                                            }
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }
                                    else {
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        await this.algo.set({
            version: "3.1"
        })
        let temp = await this.curl({
                'url': `https://api.m.jd.com/api/meta2GetRoomListByTemplateId`,
                'form': `appid=commonActivity&functionId=meta2GetRoomListByTemplateId&body={"templateId":"793888596"}&t=1713402796644`,
                cookie
            }
        )
        // console.log(temp)
        let login = await this.curl({
                'url': `https://api.m.jd.com/api/meta2LoginGame`,
                'form': `appid=commonActivity&functionId=meta2LoginGame&body={"channel":"2","roomId":"125"}&t=1713402797289`,
                cookie
            }
        )
        let getToken = await this.curl({
                'url': `https://api.m.jd.com/api/arvr_getRequestToken`,
                'form': `appid=commonActivity&functionId=arvr_getRequestToken&body=${this.body({
                    "rewardType": 6,
                    "activityId": "ba6e852dd2bc05a1de75b2d2dc9fda305096bcc0",
                    "appId": "app_440",
                })}&t=1713402797485`,
                cookie
            }
        )
        let accessToken = this.haskey(getToken, 'data')
        // 奖项目-正式
        let info3 = await this.curl({
                'url': `https://api.m.jd.com/api/arvr_queryInteractiveInfoNew`,
                'form': `appid=commonActivity&functionId=arvr_queryInteractiveInfoNew&body=${this.body({
                    "projectId": "2177780",
                    "projectKey": "2NjrCfgtPwoW8zjA7zjvKgvN3aSL",
                    "sourceCode": 5,
                    "channel": "2",
                    "queryTypes": 6,
                })}`,
                cookie
            }
        )
        if (this.haskey(info3, 'assignmentList.0.encryptAssignmentId')) {
            for (let i of Array(info3.assignmentList[0].assignmentTimesLimit - info3.assignmentList[0].completionCnt)) {
                let r = await this.algo.curl({
                        'url': `https://api.m.jd.com/api/arvr_rewardNew`,
                        'form': `appid=commonActivity&functionId=arvr_rewardNew&body=${this.body({
                            "projectId": "2177780",
                            "projectKey": "2NjrCfgtPwoW8zjA7zjvKgvN3aSL",
                            "sourceCode": 5,
                            "channel": "2",
                            "encryptAssignmentId": info3.assignmentList[0].encryptAssignmentId,
                            "completionFlag": true,
                            "rewardType": 1,
                        })}`,
                        cookie,
                        algo: {
                            appId: 'e3be6'
                        }
                    }
                )
                for (let g in this.haskey(r, 'rewardsInfo.successRewards')) {
                    let data = r.rewardsInfo.successRewards[g]
                    for (let k of data) {
                        console.log("抽奖获得:", k.rewardName)
                    }
                }
                await this.wait(1000)
            }
        }
        // 东东超市-体力任务
        let info2 = await this.curl({
                'url': `https://api.m.jd.com/api/arvr_queryInteractiveInfoNew`,
                'form': `appid=commonActivity&functionId=arvr_queryInteractiveInfoNew&body=${this.body({
                    "projectId": "1753589",
                    "projectKey": "4HT4fFeDbw11QaPmWvhdWctUQqn3",
                    "sourceCode": 2,
                    "channel": "2",
                })}&t=1713402797485`,
                cookie
            }
        )
        for (let i of this.haskey(info2, 'assignmentList')) {
            if (i.completionFlag) {
                console.log(`任务已经完成: ${i.assignmentName}`)
            }
            else {
                console.log(`正在运行: ${i.assignmentName}`)
                let extraType = i.ext.extraType
                if ([7777].includes(i.assignmentType)) {
                    console.log("任务跳过")
                }
                else if (i.assignmentType == 9) {
                    console.log("正在分享...")
                    for (let __ of Array(3)) {
                        let s = await this.algo.curl({
                                'url': `https://api.m.jd.com/api/arvr_rewardNew`,
                                'form': `appid=commonActivity&functionId=arvr_rewardNew&body=${(await this.body(
                                    {
                                        "projectId": "1753589",
                                        "projectKey": "4HT4fFeDbw11QaPmWvhdWctUQqn3",
                                        "sourceCode": 2,
                                        "channel": "2",
                                        "encryptAssignmentId": i.encryptAssignmentId,
                                        "completionFlag": true,
                                        "rewardType": 0,
                                    }
                                ))}&sign=11&t=1653132222710`,
                                cookie,
                                algo: {
                                    appId: 'e3be6'
                                }
                            }
                        )
                        console.log(this.haskey(s, 'msg'))
                        if (!this.haskey(s, 'assignmentInfo')) {
                            break
                        }
                        await this.wait(1000)
                    }
                }
                else if (this.haskey(i, `ext.${i.ext.extraType}`)) {
                    let extra = i.ext[extraType]
                    if (extraType == 'sign') {
                        let sign = await this.algo.curl({
                                'url': `https://api.m.jd.com/client.action?functionId=arvr_doInteractiveAssignmentNew`,
                                'form': `appid=commonActivity&body=${(await this.body(
                                    {
                                        "projectId": "1764671",
                                        "projectKey": "4HT4fFeDbw11QaPmWvhdWctUQqn3",
                                        accessToken, "channel": "2",
                                        "sourceCode": 2,
                                        subTaskId: i.encryptAssignmentId,
                                        "completionFlag": true,
                                        "itemId": "1",
                                    }
                                ))}&sign=11&t=1653132222710`,
                                cookie,
                                algo: {
                                    appId: '84692'
                                }
                            }
                        )
                        console.log("签到:", this.haskey(sign, 'msg'))
                    }
                    else if (extraType == 'assistTaskDetail') {
                        let index = parseInt(p.index) + 1
                        for (let o of Array(i.assignmentTimesLimit)) {
                            for (let k of Array(0)) {
                                let assist = await this.algo.curl({
                                        'url': `https://api.m.jd.com/client.action?functionId=arvr_doInteractiveAssignmentNew`,
                                        'form': `appid=commonActivity&body=${(await this.body(
                                            {
                                                "projectId": "1764671",
                                                "projectKey": "4HT4fFeDbw11QaPmWvhdWctUQqn3",
                                                accessToken, "channel": "2",
                                                "sourceCode": 2,
                                                subTaskId: i.encryptAssignmentId,
                                                "itemId": extra.itemId,
                                                "actionType": 0,
                                                "completionFlag": true,
                                                "ext": {
                                                    "assistEncryptAssignmentId": i.encryptAssignmentId,
                                                    "assistInfoFlag": 2,
                                                    "inviteId": ""
                                                },
                                            }
                                        ))}&sign=11&t=1653132222710`,
                                        cookie,
                                        algo: {
                                            appId: '84692'
                                        }
                                    }
                                )
                                index++
                                console.log(assist)
                                if (this.haskey(assist, 'msg', '任务完成')) {
                                    break
                                }
                            }
                        }
                    }
                    else {
                        try {
                            for (let j of extra.slice(0, i.assignmentTimesLimit)) {
                                if (['shoppingActivity', 'productsInfo', 'browseShop', 'brandMemberList'].includes(extraType)) {
                                    let d = await this.algo.curl({
                                            'url': `https://api.m.jd.com/client.action?functionId=arvr_doInteractiveAssignmentNew`,
                                            'form': `appid=commonActivity&body=${(await this.body(
                                                {
                                                    "projectId": "1764671",
                                                    "projectKey": "4HT4fFeDbw11QaPmWvhdWctUQqn3",
                                                    accessToken, "channel": "2",
                                                    subTaskId: i.encryptAssignmentId,
                                                    "itemId": j.itemId || j.advId,
                                                    sourceCode: 2,
                                                    "actionType": 1,
                                                }
                                            ))}&sign=11&t=1653132222710`,
                                            cookie,
                                            algo: {
                                                appId: '84692'
                                            }
                                        }
                                    )
                                    await this.wait((i.ext.waitDuration || 0) * 1000 + 500)
                                    if (extraType == 'brandMemberList' && this.profile.openCard) {
                                        let jo = await this.algo.curl({
                                                'url': `https://api.m.jd.com/client.action`,
                                                'form': `functionId=bindWithVender&body={"venderId":"${j.vendorIds}","shopId":"${j.vendorIds}","bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0,"channel":4202,"appid":"27004","needSecurity":true,"bizId":"shopmember_m_jd_com"}&t=1715046616857&appid=shopmember_m_jd_com&clientVersion=9.2.0&client=H5&&x-api-eid-token=jdd03C3HUEKC6G2V5WV6SOXJV5E4J2ILKIIHLPARTU7DKUSMS72ICFUVMMF7ZVZXDON6VLTUCVU2GNZ2RZRMVIDXGF2FBMUAAAAMPKC6XVGYAAAAACHGDUSO4UHYMGEX`,
                                                cookie,
                                                algo: {
                                                    appId: '27004'
                                                }
                                            }
                                        )
                                        console.log('开卡', j.title, this.haskey(jo, 'message') || jo)
                                        await this.wait(1000)
                                    }
                                }
                                let s = await this.algo.curl({
                                        'url': `https://api.m.jd.com/client.action?functionId=arvr_doInteractiveAssignmentNew`,
                                        'form': `appid=commonActivity&body=${(await this.body(
                                            {
                                                "projectId": "1764671",
                                                "projectKey": "4HT4fFeDbw11QaPmWvhdWctUQqn3",
                                                accessToken, "channel": "2",
                                                subTaskId: i.encryptAssignmentId,
                                                "itemId": j.itemId || j.advId,
                                                sourceCode: 2,
                                            }
                                        ))}&sign=11&t=1653132222710`,
                                        cookie,
                                        algo: {
                                            appId: '84692'
                                        }
                                    }
                                )
                                console.log(i.assignmentName, s.msg)
                                if (this.haskey(s, 'msg', '风险等级未通过')) {
                                    return
                                }
                                if (this.haskey(s, 'msg', '活动太火爆了')) {
                                    break
                                }
                                await this.wait(1000)
                            }
                        } catch (e) {
                        }
                    }
                }
                else if (i.assignmentName) {
                    let s = await this.algo.curl({
                            'url': `https://api.m.jd.com/client.action?functionId=arvr_doInteractiveAssignmentNew`,
                            'form': `appid=commonActivity&body=${(await this.body(
                                {
                                    "projectId": "1764671",
                                    "projectKey": "4HT4fFeDbw11QaPmWvhdWctUQqn3",
                                    accessToken, "channel": "2",
                                    "sourceCode": 2,
                                    subTaskId: i.encryptAssignmentId,
                                    "completionFlag": true,
                                    "itemId": "1",
                                }
                            ))}&sign=11&t=1653132222710`,
                            cookie,
                            algo: {
                                appId: '84692'
                            }
                        }
                    )
                    console.log(i.assignmentName, s.msg)
                    await this.wait(1000)
                }
            }
        }
        let ri = await this.algo.curl({
                'url': `https://api.m.jd.com/api/arvr_queryInteractiveRewardInfo`,
                'form': `appid=commonActivity&functionId=arvr_queryInteractiveRewardInfo&body=${this.body({
                    "pageSize": 10,
                    "currentPage": 1,
                    "projectId": "1753589",
                    "projectKey": "4HT4fFeDbw11QaPmWvhdWctUQqn3",
                    "sourceCode": 2,
                    "needExchangeRestScore": 1
                })}`,
                cookie,
                algo: {appId: '84692'}
            }
        )
        var score = this.haskey(ri, 'scoreInfoMap.usable') || 0
        console.log("当前体力:", score)
        // 东东超市-汪贝任务
        let info1 = await this.curl({
                'url': `https://api.m.jd.com/api/arvr_queryInteractiveInfoNew`,
                'form': `appid=commonActivity&functionId=arvr_queryInteractiveInfoNew&body=${this.body({
                    "projectId": "1764671",
                    "projectKey": "2nym8aW7jNKRbmxXLdbb75m3ebSH",
                    "sourceCode": 2,
                    "channel": "2",
                    "queryTypes": 6,
                })}&t=1713402797485`,
                cookie
            }
        )
        for (let i of this.haskey(info1, 'assignmentList')) {
            if (i.completionFlag) {
                console.log(`任务已经完成: ${i.assignmentName}`)
            }
            else {
                if (new Date(i.assignmentEndTime).getTime()>new Date().getTime() && i.assignmentName && this.match(/收银|解锁|升级|补货|离线/, i.assignmentName)) {
                    console.log(`正在运行: ${i.assignmentName}`)
                    if (score>=i.exchangeRate) {
                        let s = await this.algo.curl({
                                'url': `https://api.m.jd.com/client.action?functionId=arvr_doInteractiveAssignmentNew`,
                                'form': `appid=commonActivity&body=${(await this.body(
                                    {
                                        "projectId": "1764671",
                                        "projectKey": "2nym8aW7jNKRbmxXLdbb75m3ebSH",
                                        accessToken, "channel": "2",
                                        "sourceCode": 2,
                                        subTaskId: i.encryptAssignmentId,
                                        "completionFlag": true,
                                        "exchangeNum": "1",
                                    }
                                ))}&sign=11&t=1653132222710`,
                                cookie,
                                algo: {
                                    appId: '84692'
                                }
                            }
                        )
                        score = score - i.exchangeRate + (this.haskey(s, 'assignmentInfo.increUsedScore') || 0)
                        console.log("使用体力:", i.exchangeRate, s.msg, '当前体力:', score)
                        await this.wait(1000)
                    }
                    else {
                        console.log("体力不足...")
                    }
                }
            }
        }
    }

    body(params) {
        let str = "",
            map = Object.keys(params).sort(function(d, k) {
                return d.localeCompare(k);
            });
        for (let __i of map) {
            str = str.concat(params[__i]);
        }
        let t = Date.now();
        let r = "".concat("c4491f13dce9c71f").concat(str).concat(t);
        let md5 = this.md5(r)
        params.timestamp = t;
        params.sign = md5;
        params.signKey = "c4491f13dce9c71f";
        return this.dumps(params);
    }

    async extra() {
        await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_superMarket.json`, this.dumps(this.dict), (error) => {
            if (error) return console.log("写入化失败" + error.message);
            console.log("助力列表写入成功");
        })
    }
}

module.exports = Main;
