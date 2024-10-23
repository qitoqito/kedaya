const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东互动整合"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 20)} * * *`
        this.task = 'local'
        this.help = 'main'
        this.verify = 1
        this.import = ['jdAlgo', 'jdSign', 'logBill']
        this.interval = 5000
        this.delay = 600
        this.hint = {
            custom: '活动id,id2|id2',
            openCard: '1,开卡'
        }
        this.readme = `Id提取: https://prodev.m.jd.com/mall/active/{Id}/index.html\n脚本分身使用linkId=的,请求改为id=`
    }

    async prepare() {
        this.appIds = this.random(this.hdIds.split("|"), 100)
        this.clientVersion = '13.6.1'
        this.sign = new this.modules.jdSign()
        this.algo = new this.modules.jdAlgo({
            verison: 'latest'
        })
        let custom = this.getValue('custom')
        this.code = []
        if (custom.length) {
            for (let i of custom) {
                this.code.push(i)
            }
        }
        else if (this.profile.id) {
            for (let i of this.profile.id.split("|")) {
                this.code.push(i)
            }
        }
        let urls = []
        for (let i of this.code) {
            let url = i.substring(0, 4) == 'http' ? i : `https://prodev.m.jd.com/mall/active/${i}/index.html`
            if (!urls.includes(url)) {
                urls.push(url)
            }
        }
        if (urls.length) {
            for (let url of urls) {
                try {
                    let conf = {};
                    let html = await this.curl({
                            url: `${url}?utm_medium=tuiguang&tttparams=zZ1qguleyJnTGF0IjozOS45NjEwNTQsInVuX2FyZWEiOiIxXzI4MDBfNTU4MzhfMCIsImRMYXQiOiIiLCJwcnN0YXRlIjoiMCIsImFkZHJlc3NJZCI6IjUzODg3NDg3NyIsImxhdCI6IiIsInBvc0xhdCI6MzkuOTYxMDU0LCJwb3NMbmciOjExNi4zMjIwNjEsImdwc19hcmVhIjoiMF8wXzBfMCIsImxuZyI6IiIsInVlbXBzIjoiMC0wLTAiLCJnTG5nIjoxMTYuMzIyMDYxLCJtb2RlbCI6ImlQaG9uZTEzLDMiLCJkTG5nIjoiIn70=&utm_source=kong&cu=true`,
                            cookie: this.cookies.main[0],
                            referer: "https://u.jd.com/",
                            delay: 1,
                        }
                    )
                    let linkId = this.match(/active\/(\w+)/, url)
                    if (html.includes("明星送好礼")) {
                        let d = await this.curl({
                                'url': `https://api.m.jd.com/?uuid=&client=wh5&appid=ProductZ4Brand&functionId=showStarGiftInfo&t=1710313719813&body={"source":"star_gift"}`,
                                referer: "https://u.jd.com/", delay: 1,
                            }
                        )
                        let activityId = (this.haskey(d, 'data.result.activityBaseInfo.activityId'))
                        if (activityId) {
                            conf = {
                                encryptProjectId: d.data.result.activityBaseInfo.encryptProjectId,
                                appid: 'ProductZ4Brand',
                                activityId: d.data.result.activityBaseInfo.activityId, id: linkId
                            }
                            this.shareCode.push(conf)
                        }
                    }
                    else {
                        let encryptProjectId = this.match([/\\"encryptProjectId\\":\\"(\w+)\\"/, /"EncryptProjectId":"(\w+)"/], html)
                        let flrs = this.match(/"paginationFlrs":"([^\"]+)"/g, html)
                        if (!encryptProjectId && flrs) {
                            let id = this.match(/active\/(\w+)/, url)
                            let paginationParams = this.match(/"paginationParams"\s*:\s*\[(.+?)\]/, html)
                            if (paginationParams) {
                                var paginationParam = (paginationParams.split(",")).length
                            }
                            else {
                                var paginationParam = 2
                            }
                            let floor = await this.algo.curl({
                                    'url': `https://api.m.jd.com/?client=wh5&clientVersion=${this.clientVersion}&functionId=qryH5BabelFloors`,
                                    'form': `body={"activityId":"${id}","pageNum":"-1","innerAnchor":"","groupAnchor":"","innerExtId":"","hideTopFoot":"","hideHeadBar":"","multiTopTabDirect":"","innerLinkBase64":"","innerIndex":"1","focus":"","forceTop":"","addressId":"","posLng":"","posLat":"", "homeCityLng":"","homeCityLat":"","gps_area":"0_0_0_0","headId":"","headArea":"","warehouseId":"","jxppGroupid":"","jxppFreshman":"","dcId":"","babelChannel":"","mitemAddrId":"","geo":{"lng":"","lat":""},"flt":"","paginationParam":"${paginationParam}","paginationFlrs":"${flrs}","transParam":"","siteClient":"apple","siteClientVersion":"${this.clientVersion}","matProExt":{}}&osVersion=&d_model=`,
                                    cookie: this.cookies.all[0],
                                    algo: {
                                        appId: '35fa0'
                                    }, delay: 1,
                                }
                            )
                            encryptProjectId = this.match(/\\"encryptProjectId\\":\\"([^\\\\]+)\\"/, this.dumps(floor))
                            let configCode = this.match(/"configCode":"(\w+)"/, this.dumps(floor))
                            if (configCode) {
                                this.shareCode.push({
                                    appid: 'jdchoujiang_h5',
                                    configCode: configCode
                                })
                            }
                            else if (!encryptProjectId) {
                                let js = this.matchAll(/src="(.*?\.js)"/g, html).filter(d => d.includes('main.'))
                                for (let jjj of js) {
                                    let jsContent = await this.curl({
                                            'url': `https:${jjj}`,
                                            delay: 1
                                        }
                                    )
                                    if (jsContent.includes("inviteFission")) {
                                        let lids = (this.matchAll(/"linkId"\s*:\s*"(\w+)"/g, html))
                                        if (lids) {
                                            for (let lid of this.unique(lids)) {
                                                let pl = await this.algo.curl({
                                                        'url': `https://api.m.jd.com/api`,
                                                        form: `appid=activities_platform&body={"linkId":"${lid}","taskId":"","inviter":""}&client=ios&clientVersion=12.3.4&functionId=inviteFissionBeforeHome&t=1718017177605&osVersion=16.2.1&build=169143&rfs=0000`,
                                                        algo: {
                                                            appId: '02f8d'
                                                        },
                                                        delay: 1
                                                    }
                                                )
                                                if (this.haskey(pl, 'data')) {
                                                    this.shareCode.push({
                                                        linkId: lid,
                                                        id: linkId,
                                                        type: 'inviteFission'
                                                    })
                                                    break
                                                }
                                            }
                                        }
                                    }
                                    else if (jsContent.includes("superLeagu")) {
                                        let linkId3 = this.matchAll(/"linkId"\s*:\s*"([^\"]+)"/g, html)
                                        if (linkId3) {
                                            for (let aaa of this.unique(linkId3)) {
                                                let bbb = await this.algo.curl({
                                                        'url': `https://api.m.jd.com/api?functionId=superLeagueHome`,
                                                        'form': `functionId=superLeagueHome&body={"linkId":"${aaa}","taskId":"","inviter":"","inJdApp":false}&t=1718355904494&appid=activities_platform&client=android&clientVersion=1.0.0`,
                                                        algo: {'appId': 'b7d17'},
                                                        delay: 1
                                                    }
                                                )
                                                if (this.haskey(bbb, 'data')) {
                                                    let ccc = await this.algo.curl({
                                                            'url': `https://api.m.jd.com/client.action`,
                                                            'form': `appid=activities_platform&body={"linkId":"${aaa}"}&client=ios&clientVersion=12.3.4&functionId=apTaskList&t=1718358493910&osVersion=13.4.1&build=169143&rfs=0000`,
                                                            delay: 1,
                                                            algo: {
                                                                appId: 'b7d17'
                                                            }
                                                        }
                                                    )
                                                    if (this.haskey(ccc, 'data.0')) {
                                                        this.shareCode.push({
                                                            linkId: aaa,
                                                            id: linkId,
                                                            type: 'superLeague'
                                                        })
                                                        this.dict[aaa] = {
                                                            code: [], taskId: ''
                                                        }
                                                        break
                                                    }
                                                }
                                            }
                                        }
                                        break
                                    }
                                }
                            }
                        }
                        let otherId = this.unique(this.matchAll([/\\"encryptProjectI\w+\\":\\"(\w+)\\"/g, /"encryptProjectI\w+":"(\w+)"/g], html))
                        if (encryptProjectId || otherId.length>0) {
                            let encryptAssignmentId = this.match(/"encryptAssignmentId"\s*:\s*"(\w+)"/, html)
                            if (encryptAssignmentId && html.includes("enAwardK")) {
                                let enAwardK = this.match(/"enAwardK"\s*:\s*"([^\"]+)"/, html)
                                let mid = this.match(/"moduleId"\s*:\s*(\d+)/, html)
                                let aid = this.match(/"activityId"\s*:\s*"(\d+)"/, html)
                                for (let _ of this.unique([...[encryptProjectId], ...(otherId || [])].filter(d => d))) {
                                    this.shareCode.push({
                                        encryptProjectId: _,
                                        id: linkId, aid, mid,
                                        encryptAssignmentId,
                                        enAwardK,
                                        type: 'babelGetLottery'
                                    })
                                }
                            }
                            else {
                                let js = this.matchAll(/src="(.*?\.js)"/g, html).filter(d => d.includes('main.'))
                                let appid = this.match(/appid\s*:\s*"(\w+)"/, html) || 'babelh5'
                                let sourceCode = this.profile.sourceCode || 'aceaceqingzhan'
                                let enc = this.match(/"enc"\s*:\s*"(\w+)"/, html)
                                this.encParams = enc || "EEB688970D7CEBBE0E4A8E70D9A4CEE845D567BFB30E9D050540C6227BC766DBD057D54D5F798DBEE3B421FFEC3B65FA55B3BCD394F235B29DD14D0E12B5FC82"
                                if (js) {
                                    for (let a of js) {
                                        let jsContent = await this.curl({
                                                'url': `https:${a}`, delay: 1
                                            }
                                        )
                                        let sc = this.match(/"(ace[a-zA-Z]*\d+)"/, jsContent)
                                        if (sc) {
                                            sourceCode = sc
                                        }
                                        let aid = this.match(/appid\s*:\s*"(\w+)"/, jsContent)
                                        if (aid) {
                                            appid = aid
                                        }
                                        if (sc && aid) {
                                            break
                                        }
                                    }
                                }
                                let projectId = this.matchAll(/"(encryptProjectI\w+)"\s*:\s*"(\w+)"/g, html)
                                let pd = [encryptProjectId]
                                let otherProjectId = this.unique(this.matchAll(/\\"encryptProjectI\w+\\":\\"(\w+)\\"/g, html))
                                pd = this.unique([...pd, ...(otherProjectId || []), ...(otherId || [])].filter(d => d))
                                for (let kk of pd || []) {
                                    conf = {
                                        encryptProjectId: kk, appid, sourceCode, projectId, id: linkId
                                    }
                                    this.shareCode.push(conf)
                                }
                            }
                        }
                        else if (this.match(/businessh5\/([^\/]+)/, html)) {
                            let js = this.matchAll(/src="(.*?\.js)"/g, html).filter(d => d.includes('app.'))
                            if (js) {
                                let jsContent = await this.curl({
                                        'url': `https:${js[0]}`,
                                        delay: 1
                                    }
                                )
                                let source = this.match(/ActivitySource\s*:\s*"(\w+)"/, jsContent)
                                let functionId = this.match(/functionId\s*:\s*"(\w+)"/, jsContent)
                                if (source && functionId) {
                                    let s = await this.curl({
                                            'url': `https://api.m.jd.com/?appid=ProductZ4Brand&functionId=${functionId}&t=${this.timestamp}&body={"source":"${source}"}`,
                                            delay: 1,
                                        }
                                    )
                                    if (this.haskey(s, 'data.result.activityBaseInfo')) {
                                        conf = {
                                            encryptProjectId: s.data.result.activityBaseInfo.encryptProjectId,
                                            appid: 'ProductZ4Brand',
                                            activityId: s.data.result.activityBaseInfo.activityId, id: linkId
                                        }
                                        this.shareCode.push(conf)
                                    }
                                }
                            }
                        }
                        if (this.dumps(conf) == '{}') {
                            let config = {appid: 'jdchoujiang_h5'}
                            let activityCode = this.match(/"activityCode"\s*:\s*"(\w+)"/, html)
                            let configCode = this.match(/"configCode"\s*:\s*"(\w+)"/, html)
                            if (activityCode) {
                                config.activityCode = activityCode
                            }
                            if (configCode) {
                                config.configCode = configCode
                                if (!activityCode) {
                                    let subId = (this.match(/\\\"suburl\\\":\\\"\/\/pro.m.jd.com\/mall\/active\/(\w+)\/index.html\\\"/, html))
                                    if (subId) {
                                        let subHtml = await this.curl({
                                                url: `https://prodev.m.jd.com/mall/active/${subId}/index.html?utm_medium=tuiguang&tttparams=zZ1qguleyJnTGF0IjozOS45NjEwNTQsInVuX2FyZWEiOiIxXzI4MDBfNTU4MzhfMCIsImRMYXQiOiIiLCJwcnN0YXRlIjoiMCIsImFkZHJlc3NJZCI6IjUzODg3NDg3NyIsImxhdCI6IiIsInBvc0xhdCI6MzkuOTYxMDU0LCJwb3NMbmciOjExNi4zMjIwNjEsImdwc19hcmVhIjoiMF8wXzBfMCIsImxuZyI6IiIsInVlbXBzIjoiMC0wLTAiLCJnTG5nIjoxMTYuMzIyMDYxLCJtb2RlbCI6ImlQaG9uZTEzLDMiLCJkTG5nIjoiIn70=&utm_source=kong&cu=true`,
                                                cookie: this.cookies.main[0],
                                                referer: "https://u.jd.com/",
                                                delay: 1,
                                            }
                                        )
                                        activityCode = this.match(/"activityCode"\s*:\s*"(\w+)"/, subHtml)
                                        if (activityCode) {
                                            config.activityCode = activityCode
                                        }
                                    }
                                }
                            }
                            if (configCode || activityCode) {
                                config.id = linkId
                                conf = config
                                this.shareCode.push(conf)
                            }
                        }
                        if (this.dumps(conf) == '{}') {
                            let superLeague = this.match(/(super-league)/, html)
                            let linkId2 = this.match(/"linkId"\s*:\s*"([^\"]+)"/, html)
                            if ((this.column(this.shareCode, 'linkId') || []).includes(linkId2)) {
                            }
                            else if (linkId2 && superLeague) {
                                conf = {
                                    linkId: linkId2,
                                    id: linkId,
                                    type: 'superLeague'
                                }
                                this.shareCode.push(conf)
                                this.dict[linkId2] = {
                                    code: [], taskId: ''
                                }
                            }
                            else if (linkId2) {
                                let lottery = await this.algo.curl({
                                        'url': `https://api.m.jd.com/api`,
                                        'form': `functionId=lotteryMachineHome&body={"linkId":"${linkId2}","taskId":"","inviter":""}&t=1713449252402&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&uuid=de21c6604748f97dd3977153e51a47f4efdb9a47&build=168960&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13%2C3&lang=zh_CN&osVersion=15.1.1&partner=-1&cthr=1`,
                                        delay: 1,
                                        algo: {
                                            appId: "d7439",
                                        }
                                    }
                                )
                                if (this.haskey(lottery, 'data.prizeItems')) {
                                    conf = {
                                        type: 'lotteryMachine',
                                        id: linkId,
                                        linkId: linkId2
                                    }
                                    this.shareCode.push(conf)
                                }
                            }
                        }
                        if (this.dumps(conf) == '{}') {
                            let lids = (this.matchAll(/"linkId"\s*:\s*"(\w+)"/g, html))
                            for (let i of this.unique(lids)) {
                                let apTask = await this.wget({
                                    fn: 'apTaskList',
                                    body: {"linkId": i},
                                    algo: {},
                                })
                                if (this.haskey(apTask, 'data')) {
                                    conf = {
                                        type: 'aptl',
                                        id: linkId,
                                        linkId: i
                                    }
                                    this.shareCode.push(conf)
                                    break
                                }
                            }
                        }
                    }
                } catch (e) {
                }
            }
            await this.wait(1000)
        }
    }

    async main(p) {
        console.log("当前运行ID:", p.inviter.id)
        await this.algo.set({
            version: "latest",
            type: "main",
            referer: `https://prodev.m.jd.com/mall/active/${p.inviter.id}/index.html`
        })
        switch (p.inviter.type) {
            case 'superLeague':
                await this.spl(p)
                break
            case 'lotteryMachine':
                await this.lme(p)
                break
            case 'babelGetLottery':
                await this.bgl(p)
                break
            case 'inviteFission':
                await this.infi(p)
                break
            case 'aptl':
                await this.aptl(p)
                break
            default:
                switch (p.inviter.appid) {
                    case "ProductZ4Brand":
                        await this.tewuz(p)
                        break
                    case 'jdchoujiang_h5':
                        await this.choujiang(p)
                        break
                    default:
                        await this.hudongz(p)
                        break
                }
                break
        }
    }

    async wget(p) {
        return await this.algo.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=${p.fn}&body=${typeof (p.body) == 'object' ? this.dumps(p.body) : p.body}&t=1698649904893&appid=${p.appid || 'activities_platform'}&client=ios&clientVersion=${this.clientVersion}&build=168909&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=-1&cthr=1`,
                cookie: p.cookie,
                algo: p.algo || {},
            }
        )
    }

    async infi(p) {
        let cookie = p.cookie
        for (let _ of Array(2)) {
            await this.algo.curl({
                'url': `https://api.m.jd.com/?functionId=inviteFissionHome&body={"linkId":"${p.inviter.linkId}","inviter":""}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}`,
                cookie,
                algo: {
                    appId: 'eb67b'
                }
            })
            let undo = 0
            let apTask = await this.wget({
                fn: 'apTaskList',
                body: {"linkId": p.inviter.linkId},
                algo: {},
                cookie
            })
            let apDoLimitTimeTask = 0
            for (let i of this.haskey(apTask, 'data')) {
                if (i.taskLimitTimes == i.taskDoTimes) {
                    console.log("任务已完成:", i.taskShowTitle)
                    if (i.canDrawAwardNum) {
                        for (let __ of Array(i.canDrawAwardNum)) {
                            let a = await this.wget({
                                fn: 'apTaskDrawAward',
                                body: {
                                    "taskType": i.taskType,
                                    "taskId": i.id,
                                    "channel": 4,
                                    "checkVersion": true,
                                    "linkId": p.inviter.linkId,
                                },
                                algo: {appId: '6f2b6'},
                                cookie
                            })
                            console.log("领取抽奖机会...", this.haskey(a, 'data.0.awardGivenNumber'))
                        }
                    }
                }
                else {
                    if (i.taskType != 'ORDER_MARK') {
                        undo = 1
                    }
                    if (apDoLimitTimeTask) {
                        break
                    }
                    console.log(`正在运行:`, i.taskShowTitle || i.taskTitle, i.taskType
                    )
                    switch (i.taskType) {
                        case 'SIGN':
                            let sign = await this.wget({
                                fn: 'apsDoTask',
                                body: {
                                    "taskType": "SIGN",
                                    "taskId": i.id,
                                    "channel": 4,
                                    "checkVersion": true,
                                    "linkId": p.inviter.linkId,
                                },
                                algo: {
                                    appId: '54ed7'
                                },
                                cookie
                            })
                        case 'ORDER_MARK':
                            break
                        case 'BROWSE_CHANNEL':
                        case  'BROWSE_PRODUCT':
                        case 'FOLLOW_SHOP':
                            let apTaskDetail = await this.wget({
                                fn: 'apTaskDetail',
                                body: {
                                    "taskType": i.taskType,
                                    "taskId": i.id,
                                    "channel": 4,
                                    "checkVersion": true,
                                    "linkId": p.inviter.linkId,
                                },
                                algo: {},
                                cookie
                            })
                            let taskItemList = this.haskey(apTaskDetail, 'data.taskItemList')
                            if (taskItemList) {
                                for (let j in Array.from(Array(i.taskLimitTimes - i.taskDoTimes), (_val, index) => index)) {
                                    if (taskItemList[j] && taskItemList[j].itemId) {
                                        let doTask = await this.wget({
                                            fn: 'apsDoTask',
                                            body: {
                                                "taskType": i.taskType,
                                                "taskId": i.id,
                                                "channel": 4,
                                                "checkVersion": true,
                                                "linkId": p.inviter.linkId,
                                                "taskInsert": false,
                                                "itemId": encodeURIComponent(taskItemList[j].itemId)
                                            },
                                            algo: {'appId': '54ed7'},
                                            cookie
                                        })
                                        // console.log(doTask)
                                        if (this.haskey(doTask, 'errMsg', '参数校验失败')) {
                                            apDoLimitTimeTask = 1
                                            break
                                        }
                                        if (this.haskey(doTask, 'code', 2018)) {
                                            apDoLimitTimeTask = 1
                                            break
                                        }
                                        if (this.haskey(doTask, 'success')) {
                                            console.log("任务完成", `[${parseInt(j) + 1}/${i.taskLimitTimes - i.taskDoTimes}]`)
                                        }
                                        else {
                                            console.log("任务失败:", this.haskey(doTask, 'errMsg') || doTask)
                                        }
                                        await this.wait(3000)
                                    }
                                }
                            }
                            break
                    }
                }
            }
            if (apDoLimitTimeTask) {
                for (let i of this.haskey(apTask, 'data')) {
                    if (i.taskDoTimes != i.taskLimitTimes) {
                        switch (i.taskType) {
                            case 'BROWSE_CHANNEL':
                            case 'BROWSE_PRODUCT' :
                                let t = await this.algo.curl({
                                        'url': `https://api.m.jd.com/api?functionId=apTaskDetail`,
                                        'form': `functionId=apTaskDetail&body={"taskType":"${i.taskType}","taskId":${i.id},"channel":4,"checkVersion":true,"linkId":"${p.inviter.linkId}"}&t=1718107819042&appid=activities_platform&client=ios&clientVersion=12.1.0&loginType=2&loginWQBiz=wegame&`,
                                        cookie
                                    }
                                )
                                for (let __ of this.haskey(t, 'data.taskItemList')) {
                                    let d = await this.algo.curl({
                                            'url': `https://api.m.jd.com/api`,
                                            'form': `functionId=apStartTaskTime&body={"linkId":"${p.inviter.linkId}","taskId":${i.id},"itemId":"${encodeURIComponent(__.itemId)}","channel":4}&t=1714297539245&appid=activities_platform&client=ios&clientVersion=6.15.2&loginType=2&loginWQBiz=wegame&build=1515&screen=320*568&networkType=wifi&d_brand=iPhone&d_model=iPhone8,4&lang=zh_CN&osVersion=15.8&partner=-1&cthr=1`,
                                            cookie
                                        }
                                    )
                                    console.log("正在运行:", i.taskShowTitle || i.taskTitle, i.taskType, this.haskey(d, 'success'))
                                    if (i.timeLimitPeriod) {
                                        console.log("等待:", i.timeLimitPeriod
                                        )
                                        await this.wait(i.timeLimitPeriod * 1001)
                                    }
                                    else if ((this.haskey(i, 'configBaseList.0.awardTitle') || '').includes("秒")) {
                                        let ts = parseInt(this.match(/(\d+)秒/, this.haskey(i, 'configBaseList.0.awardTitle')))
                                        console.log("等待:", ts)
                                        await this.wait(ts * 1001)
                                    }
                                    let r = await this.algo.curl({
                                            'url': `https://api.m.jd.com/api`,
                                            'form': `functionId=apDoLimitTimeTask&body={"linkId":"${p.inviter.linkId}"}&t=1714297546880&appid=activities_platform&client=ios&clientVersion=6.15.2&loginType=2&loginWQBiz=wegame&build=1515&screen=320*568&networkType=wifi&d_brand=iPhone&d_model=iPhone8,4&lang=zh_CN&osVersion=15.8&partner=-1&cthr=1`,
                                            cookie,
                                            algo: {
                                                appId: 'ebecc'
                                            }
                                        }
                                    )
                                    console.log("返回结果...", this.haskey(r, 'success'))
                                }
                                break
                        }
                    }
                    else {
                        console.log(`任务完成`, i.taskTitle)
                    }
                }
            }
            if (undo) {
                await this.wait(2000)
            }
        }
        let invite = await this.algo.curl({
            'url': `https://api.m.jd.com/?functionId=inviteFissionHome&body={"linkId":"${p.inviter.linkId}","inviter":""}&t=1677822607330&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}`,
            // 'form':``,
            cookie,
            algo: {
                appId: 'eb67b'
            }
        })
        let prizeNum = this.haskey(invite, 'data.prizeNum')
        console.log("可抽奖次数:", prizeNum)
        let error = 0
        let dict = {
            1: '优惠券',
            2: '红包',
            3: "京豆",
            4: '现金',
            6: '礼包'
        }
        let redpacket = [0]
        let cash = [0]
        let bean = [0]
        for (let i of Array(prizeNum)) {
            let draw = await this.algo.curl({
                'url': `https://api.m.jd.com/?functionId=inviteFissionDrawPrize&body={%22linkId%22:%22${p.inviter.linkId}%22,%22lbs%22:%22null%22}&t=1677826749458&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}`,
                cookie,
                algo: {
                    appId: 'c02c6'
                }
            })
            let prizeType = this.haskey(draw, 'data.prizeType')
            console.log("抽中类型:", dict[prizeType] || prizeType, '抽中面额:', this.haskey(draw, 'data.prizeValue'))
            if (prizeType == 2) {
                redpacket.push(this.haskey(draw, 'data.prizeValue'))
            }
            if (prizeType == 3) {
                bean.push(this.haskey(draw, 'data.prizeValue'))
            }
            if (prizeType == 4) {
                cash.push(this.haskey(draw, 'data.prizeValue'))
                let cs = await this.algo.curl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=apCashWithDraw&body={"linkId":"${p.inviter.linkId}","businessSource":"NONE","base":{"id":${draw.data.id},"business":"fission","poolBaseId":${draw.data.poolBaseId},"prizeGroupId":${draw.data.prizeGroupId},"prizeBaseId":${draw.data.prizeBaseId},"prizeType":${draw.data.prizeType}}}&t=1677826760325&appid=activities_platform&client=ios&clientVersion=13.1.0`,
                    cookie,
                    algo: {
                        appId: '3c023'
                    }
                })
                console.log(`现金: ${draw.data.amount}  ${this.haskey(cs, 'data.message')}`)
            }
            await this.wait(1000)
        }
        if (cash.length>1) {
            this.print(`现金: ${this.sum(cash, 2)}`, p.user)
        }
        else if (redpacket.length>1) {
            this.print(`红包: ${this.sum(redpacket, 2)}`, p.user)
        }
        else if (bean.length>1) {
            this.print(`京豆: ${this.sum(bean, 2)}`, p.user)
        }
    }

    async aptl(p) {
        let cookie = p.cookie
        let apTask = await this.wget({
            fn: 'apTaskList',
            body: {"linkId": p.inviter.linkId},
            algo: {},
            cookie
        })
        for (let i of this.haskey(apTask, 'data')) {
            if (i.taskLimitTimes == i.taskDoTimes) {
                console.log("任务已完成:", i.taskShowTitle)
            }
            else {
                console.log(`正在运行:`, i.taskTitle || i.taskShowTitle, i.taskType)
                switch (i.taskType) {
                    case 'SIGN':
                        let sign = await this.wget({
                            fn: 'apsDoTask',
                            body: {
                                "taskType": "SIGN",
                                "taskId": i.id,
                                "channel": 4,
                                "checkVersion": true,
                                "linkId": p.inviter.linkId,
                                pipeExt: i.pipeExt
                            },
                            algo: {
                                appId: '54ed7'
                            },
                            cookie
                        })
                    case 'ORDER_MARK':
                    case 'JOIN_BRAND':
                        break
                    case 'BROWSE_CHANNEL':
                    case  'BROWSE_PRODUCT':
                    case 'FOLLOW_SHOP':
                    case 'FOLLOW_CHANNEL':
                    case 'ADD_PURCHASE':
                        let body = {
                            "taskType": i.taskType,
                            "taskId": i.id,
                            "channel": 4,
                            "checkVersion": true,
                            "linkId": p.inviter.linkId,
                        }
                        if (i.pipeExt) {
                            body.pipeExt = i.pipeExt
                        }
                        let apTaskDetail = await this.wget({
                            fn: 'apTaskDetail',
                            body,
                            algo: {},
                            cookie
                        })
                        let taskItemList = this.haskey(apTaskDetail, 'data.taskItemList')
                        if (taskItemList) {
                            for (let j in Array.from(Array(i.taskLimitTimes - i.taskDoTimes), (_val, index) => index)) {
                                if (taskItemList[j] && taskItemList[j].itemId) {
                                    let body2 = {
                                        "taskType": i.taskType,
                                        "taskId": i.id,
                                        "channel": 4,
                                        "checkVersion": true,
                                        "linkId": p.inviter.linkId,
                                        "taskInsert": false,
                                        "itemId": encodeURIComponent(taskItemList[j].itemId)
                                    }
                                    if (taskItemList[j].pipeExt) {
                                        body2.pipeExt = {...taskItemList[j].pipeExt, ...body.pipeExt || {}}
                                    }
                                    let apStart = await this.sign.curl({
                                            'url': `https://api.m.jd.com/api`,
                                            'form': `functionId=apStartTaskTime&body=${this.dumps(body2)}&t=1729173114208&appid=activities_platform&client=ios&clientVersion=13.1.0&loginType=2&loginWQBiz=wegame`,
                                            referer: 'https://pro.m.jd.com/mall/active/rxfF5KGBpcxNQj3WvxFPg1F4Ne4/index.html',
                                            cookie
                                        }
                                    )
                                    // console.log(apStart)
                                    if (i.timeLimitPeriod) {
                                        await this.wait(i.timeLimitPeriod * 1000)
                                    }
                                    let doTask = await this.wget({
                                        fn: 'apsDoTask',
                                        body: body2,
                                        algo: {'appId': '54ed7'},
                                        cookie
                                    })
                                    if (this.haskey(doTask, 'success')) {
                                        console.log("任务完成", `[${parseInt(j) + 1}/${i.taskLimitTimes - i.taskDoTimes}]`)
                                    }
                                    else {
                                        console.log("任务失败:", this.haskey(doTask, 'errMsg') || doTask)
                                    }
                                    await this.wait(3000)
                                }
                            }
                        }
                        break
                }
            }
        }
    }

    async lme(p) {
        let cookie = p.cookie;
        let home = await this.wget({
            fn: 'lotteryMachineHome',
            body: {"linkId": p.inviter.linkId, "taskId": "", "inviter": ""},
            algo: {'appId': 'd7439'},
            cookie
        })
        if (this.haskey(home, 'data.notLogin')) {
            console.log("账号过期...")
            return
        }
        let data = home.data
        let apTask = await this.wget({
            fn: 'apTaskList',
            body: {"linkId": p.inviter.linkId},
            algo: {},
            cookie
        })
        for (let i of this.haskey(apTask, 'data')) {
            if (i.taskLimitTimes == i.taskDoTimes) {
                console.log("任务已完成:", i.taskShowTitle)
            }
            else {
                console.log(`正在运行:`, i.taskTitle, i.taskType)
                switch (i.taskType) {
                    case 'SIGN':
                        let sign = await this.wget({
                            fn: 'apsDoTask',
                            body: {
                                "taskType": "SIGN",
                                "taskId": i.id,
                                "channel": 4,
                                "checkVersion": true,
                                "linkId": p.inviter.linkId,
                            },
                            algo: {
                                appId: '54ed7'
                            },
                            cookie
                        })
                    case 'ORDER_MARK':
                        break
                    case 'BROWSE_CHANNEL':
                    case  'BROWSE_PRODUCT':
                    case 'FOLLOW_SHOP':
                        let apTaskDetail = await this.wget({
                            fn: 'apTaskDetail',
                            body: {
                                "taskType": i.taskType,
                                "taskId": i.id,
                                "channel": 4,
                                "checkVersion": true,
                                "linkId": p.inviter.linkId,
                            },
                            algo: {},
                            cookie
                        })
                        let taskItemList = this.haskey(apTaskDetail, 'data.taskItemList')
                        if (taskItemList) {
                            for (let j in Array.from(Array(i.taskLimitTimes - i.taskDoTimes), (_val, index) => index)) {
                                if (taskItemList[j] && taskItemList[j].itemId) {
                                    let doTask = await this.wget({
                                        fn: 'apsDoTask',
                                        body: {
                                            "taskType": i.taskType,
                                            "taskId": i.id,
                                            "channel": 4,
                                            "checkVersion": true,
                                            "linkId": p.inviter.linkId,
                                            "taskInsert": false,
                                            "itemId": encodeURIComponent(taskItemList[j].itemId)
                                        },
                                        algo: {'appId': '54ed7'},
                                        cookie
                                    })
                                    if (this.haskey(doTask, 'success')) {
                                        console.log("任务完成", `[${parseInt(j) + 1}/${i.taskLimitTimes - i.taskDoTimes}]`)
                                    }
                                    else {
                                        console.log("任务失败:", this.haskey(doTask, 'errMsg') || doTask)
                                    }
                                    await this.wait(3000)
                                }
                            }
                        }
                        break
                }
            }
        }
        home = await this.wget({
            fn: 'lotteryMachineHome',
            body: {"linkId": p.inviter.linkId, "taskId": "", "inviter": ""},
            algo: {'appId': 'd7439'},
            cookie
        })
        let drawNum = this.haskey(home, 'data.remainTimes') || 0
        console.log("可抽奖次数:", drawNum)
        for (let i of Array(drawNum)) {
            try {
                let lottery = await this.wget({
                    fn: 'lotteryMachineDraw',
                    body: {"linkId": p.inviter.linkId},
                    algo: {'appId': 'd7439'},
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
                        console.log('优惠券:', data.prizeDesc, data.amount)
                    }
                    else if (prizeType == 2) {
                        this.print(`红包: ${data.amount}`, p.user)
                    }
                    else if (prizeType == 3) {
                        this.print(`京豆: ${data.amount}`, p.user)
                    }
                    else if (prizeType == 22) {
                        this.print(`超市卡: ${data.amount}`, p.user)
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
                await this.wait(1000)
            } catch (e) {
                console.log(e)
            }
        }
    }

    async spl(p) {
        let cookie = p.cookie
        let inviter = ""
        if (this.dict[p.inviter.linkId].code.length>0) {
            let code = this.dict[p.inviter.linkId].code[(p.index + 1) % this.dict[p.inviter.linkId].code.length]
            inviter = code.userCode
            console.log("正在助力:", code.user)
        }
        let taskId = this.dict[p.inviter.linkId].taskId || ''
        let home = await this.wget({
            fn: 'superLeagueHome',
            body: {"linkId": p.inviter.linkId, "taskId": taskId, "inviter": inviter, "inJdApp": true},
            algo: {'appId': 'b7d17'},
            cookie
        })
        if (this.haskey(home, 'data.notLogin')) {
            console.log("账号过期...")
            return
        }
        let data = this.haskey(home, 'data')
        let userCode = this.haskey(home, 'data.userCode')
        let users = this.cookies.help.map(d => this.userName(d))
        if (users.includes(p.user) && this.turnCount == 0) {
            this.dict[p.inviter.linkId].code.push({
                user: p.user,
                userCode
            })
        }
        let apTask = await this.wget({
            fn: 'apTaskList',
            body: {"linkId": p.inviter.linkId},
            algo: {},
            cookie
        })
        // console.log(apTask.data)
        let apDoLimitTimeTask = 0
        for (let i of this.haskey(apTask, 'data')) {
            if (i.taskLimitTimes == i.taskDoTimes) {
                console.log("任务已完成:", i.taskShowTitle)
            }
            else if (i.taskShowTitle == '邀请好友参加') {
                continue
            }
            else {
                for (let j of Array(i.taskLimitTimes - i.taskDoTimes)) {
                    if (apDoLimitTimeTask) {
                        break
                    }
                    console.log("正在运行:", i.taskShowTitle)
                    switch (i.taskType) {
                        case 'SHARE_INVITE':
                            this.dict[p.inviter.linkId].taskId = i.id
                            break
                        case 'ORDER_MARK':
                            break
                        case 'BROWSE_CHANNEL':
                        case  'BROWSE_PRODUCT':
                            let detail = await this.wget({
                                fn: 'apTaskDetail',
                                body: {
                                    "linkId": p.inviter.linkId,
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
                                        "linkId": p.inviter.linkId,
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
                                if (this.haskey(doTask, 'code', 2018)) {
                                    apDoLimitTimeTask = 1
                                    break
                                }
                                console.log(this.haskey(doTask, 'success'))
                            }
                            break
                        case "FOLLOW_CHANNEL":
                            let follow = await this.sign.jdCurl({
                                    'url': `https://api.m.jd.com/client.action?functionId=isUserFollow`,
                                    'form': `avifSupport=0&body={"themeId":"CA102114594160842529","informationParam":{"isRvc":"0","fp":"-1","eid":"","shshshfp":"-1","userAgent":"-1","referUrl":"-1","shshshfpa":"-1"},"businessId":"1"}&build=168960&client=apple&clientVersion=${this.clientVersion}`,
                                    cookie
                                }
                            )
                            console.log(this.haskey(follow, 'themeText') || follow)
                            let detail2 = await this.wget({
                                fn: 'apTaskDetail',
                                body: {
                                    "linkId": p.inviter.linkId,
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
                            if (this.haskey(detail2, 'data.taskItemList')) {
                                let doTask = await this.wget({
                                    fn: 'apsDoTask',
                                    body: {
                                        "linkId": p.inviter.linkId,
                                        "taskType": i.taskType,
                                        "taskId": i.id,
                                        "checkVersion": true,
                                        "taskInsert": false,
                                        "itemId": detail2.data.taskItemList[0].itemName
                                    },
                                    algo: {'appId': '54ed7'},
                                    cookie
                                })
                                if (this.haskey(doTask, 'code', 2018)) {
                                    apDoLimitTimeTask = 1
                                    break
                                }
                                console.log(this.haskey(doTask, 'success'))
                            }
                            break
                        default:
                            let doTask = await this.wget({
                                fn: 'apsDoTask',
                                body: {
                                    "linkId": p.inviter.linkId,
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
                            if (this.haskey(doTask, 'code') && [2018, 10].includes(doTask.code)) {
                                apDoLimitTimeTask = 1
                                break
                            }
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
        if (apDoLimitTimeTask) {
            for (let i of this.haskey(apTask, 'data')) {
                if (i.taskDoTimes != i.taskLimitTimes) {
                    switch (i.taskType) {
                        case 'ORDER_MARK':
                            // console.log('666')
                            break
                        case 'FOLLOW_SHOP':
                        case 'BROWSE_CHANNEL':
                        case 'BROWSE_PRODUCT' :
                            let t = await this.algo.curl({
                                    'url': `https://api.m.jd.com/api?functionId=apTaskDetail`,
                                    'form': `functionId=apTaskDetail&body={"taskType":"${i.taskType}","taskId":${i.id},"channel":4,"checkVersion":true,"linkId":"${p.inviter.linkId}"}&t=1718107819042&appid=activities_platform&client=ios&clientVersion=12.1.0&loginType=2&loginWQBiz=wegame&`,
                                    cookie
                                }
                            )
                            for (let __ of this.haskey(t, 'data.taskItemList')) {
                                if (i.taskType == 'FOLLOW_SHOP') {
                                    let toT = await this.algo.curl({
                                            'url': `https://api.m.jd.com/api`,
                                            'form': `functionId=apsDoTask&body={"taskType":"${i.taskType}","taskId":${i.id},"channel":4,"checkVersion":true,"linkId":"${p.inviter.linkId}","taskInsert":false,"resourceType":null,"itemId":"${encodeURIComponent(__.itemId)}"}&t=1718357853363&appid=activities_platform&client=ios&clientVersion=12.1.0&loginType=2&loginWQBiz=wegame`,
                                            cookie,
                                            algo: {
                                                appId: '54ed7'
                                            }
                                        }
                                    )
                                    console.log("返回结果...", this.haskey(toT, 'success'))
                                }
                                else {
                                    let d = await this.algo.curl({
                                            'url': `https://api.m.jd.com/api`,
                                            'form': `functionId=apStartTaskTime&body={"linkId":"${p.inviter.linkId}","taskId":${i.id},"itemId":"${encodeURIComponent(__.itemId)}","channel":4}&t=1714297539245&appid=activities_platform&client=ios&clientVersion=6.15.2&loginType=2&loginWQBiz=wegame&build=1515&screen=320*568&networkType=wifi&d_brand=iPhone&d_model=iPhone8,4&lang=zh_CN&osVersion=15.8&partner=-1&cthr=1`,
                                            cookie
                                        }
                                    )
                                    console.log("正在运行:", i.taskType, this.haskey(d, 'success'))
                                    if (i.timeLimitPeriod) {
                                        console.log("等待:", i.timeLimitPeriod
                                        )
                                        await this.wait(i.timeLimitPeriod * 1001)
                                    }
                                    else if ((this.haskey(i, 'configBaseList.0.awardTitle') || '').includes("秒")) {
                                        let ts = parseInt(this.match(/(\d+)秒/, this.haskey(i, 'configBaseList.0.awardTitle')))
                                        console.log("等待:", ts)
                                        await this.wait(ts * 1001)
                                    }
                                    let r = await this.algo.curl({
                                            'url': `https://api.m.jd.com/api`,
                                            'form': `functionId=apDoLimitTimeTask&body={"linkId":"${p.inviter.linkId}"}&t=1714297546880&appid=activities_platform&client=ios&clientVersion=6.15.2&loginType=2&loginWQBiz=wegame&build=1515&screen=320*568&networkType=wifi&d_brand=iPhone&d_model=iPhone8,4&lang=zh_CN&osVersion=15.8&partner=-1&cthr=1`,
                                            cookie,
                                            algo: {
                                                appId: 'ebecc'
                                            }
                                        }
                                    )
                                    console.log("返回结果...", this.haskey(r, 'success'))
                                }
                            }
                            break
                    }
                }
                else {
                    console.log(`任务完成`, i.taskTitle)
                }
            }
        }
        console.log("抽奖中...")
        for (let i of Array(30)) {
            try {
                let lottery = await this.wget({
                    fn: 'superLeagueLottery',
                    body: {"linkId": p.inviter.linkId},
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
                if (!lottery) {
                    break
                }
                if (this.haskey(lottery, 'data')) {
                    let data = lottery.data
                    let prizeType = data.prizeType
                    if (prizeType == 1) {
                        console.log('优惠券:', data.prizeDesc, data.amount)
                    }
                    else if (prizeType == 2) {
                        this.print(`红包: ${data.amount}`, p.user)
                    }
                    else if (prizeType == 3) {
                        this.print(`京豆: ${data.amount}`, p.user)
                    }
                    else if (prizeType == 22) {
                        this.print(`超市卡: ${data.amount}`, p.user)
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

    async choujiang(p) {
        let cookie = p.cookie;
        let pins = this.cookies.help.map(d => this.userPin(d))
        let friendPin = pins[p.index % pins.length]
        let activityCode = p.inviter.activityCode
        let configCode = p.inviter.configCode
        let gifts = [];
        let beans = 0
        if (configCode) {
            var c
            for (let i of Array(30)) {
                c = await this.algo.curl({
                        'url': `https://api.m.jd.com/api?client=ios&clientVersion=${this.clientVersion}&appid=jdchoujiang_h5&t=1675835436298&functionId=moduleGetActivity&body={"configCode":"${configCode}","eid":"Q55HGKVK7KBUUTZP5QT27F4LSPKRTJ4NME4D5WYT6DQQ4XKZUSSI7HS66IY5AEO57JAZBME26RVD7HSD2SFJMSVTOE","fp":"ec9164c1ef3ccae8cb1308f149f5e860","friendPin":"${friendPin}"}&uuid=${this.timestamp}1279309`,
                        // 'form':``,
                        cookie,
                        algo: {
                            appId: '05b33',
                        }
                    }
                )
                await this.wait(2000)
                if (!this.haskey(c, 'data.dailyTask.taskList')) {
                    break
                }
                let dd = 0
                for (let i of this.haskey(c, 'data.dailyTask.taskList')) {
                    console.log('正在浏览:', i.item.itemName)
                    if (i.taskCount == i.finishCount) {
                        console.log("任务已经完成了...")
                    }
                    else {
                        dd = 1
                        let d = await this.algo.curl({
                                'url': `https://api.m.jd.com/api`,
                                form: `client=ios&clientVersion=${this.clientVersion}&appid=jdchoujiang_h5&t=1710766913588&functionId=moduleDoTask&body={"groupType":${i.groupType},"configCode":"${configCode}","itemId":"${i.item.itemId}","eid":"UT42BFT33TGS6GOIOWXCCOFR2T5UM44HG27BZ3JBLL5TQWMEHHCGMANY7T3YNDDBPISS4SS7Z7C7T3OFBOP5QFT2KI","fp":"c6078eb397bd9a04dc6163f0702174be"}`,
                                cookie,
                                algo: {
                                    appId: 'bbfbd',
                                }
                            }
                        )
                        if (this.haskey(d, 'success') && i.rewardQuantity) {
                            beans += i.rewardQuantity
                            console.log(`获得京豆: ${i.rewardQuantity}`)
                        }
                        else {
                            console.log(d)
                        }
                        if (this.match(/火爆|登陆|登录/, (this.haskey(d, 'errorMessage') || ''))) {
                            dd = 0
                            break
                        }
                        await this.wait(2000)
                    }
                }
                if (dd == 0) {
                    break
                }
            }
            if (this.profile.openCard) {
                for (let i of this.haskey(c, 'data.memberTask.memberList')) {
                    if (i.result != 2) {
                        let jo = await this.algo.curl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `functionId=bindWithVender&body={"venderId":"${i.venderId}","shopId":"${i.shopId || i.venderId}","bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0,"channel":4202,"appid":"27004","needSecurity":true,"bizId":"shopmember_m_jd_com"}&t=1715046616857&appid=shopmember_m_jd_com&clientVersion=${this.clientVersion}&client=H5&&x-api-eid-token=jdd03UT42BFT33TGS6GOIOWXCCOFR2T5UM44HG27BZ3JBLL5TQWMEHHCGMANY7T3YNDDBPISS4SS7Z7C7T3OFBOP5QFT2KIAAAAMPKC6XVGYAAAAACHGDUSO4UHYMGEX`,
                                cookie,
                                algo: {
                                    appId: '27004'
                                }
                            }
                        )
                        console.log("正在开卡:", i.cardName, this.haskey(jo, 'message') || jo)
                        let d = await this.algo.curl({
                                'url': `https://api.m.jd.com/api`,
                                form: `client=ios&clientVersion=${this.clientVersion}&appid=jdchoujiang_h5&t=1710766913588&functionId=moduleGetReward&body={"groupType":7,"configCode":"${configCode}","itemId":"${i.cardId}","eid":"UT42BFT33TGS6GOIOWXCCOFR2T5UM44HG27BZ3JBLL5TQWMEHHCGMANY7T3YNDDBPISS4SS7Z7C7T3OFBOP5QFT2KI","fp":"c6078eb397bd9a04dc6163f0702174be"}`,
                                cookie,
                                algo: {
                                    appId: 'bbfbd',
                                }
                            }
                        )
                        if (this.haskey(d, 'success') && i.rewardQuantity) {
                            // gifts.push(`获得京豆: ${i.rewardQuantity}`)
                            beans += i.rewardQuantity
                            console.log(`获得京豆: ${i.rewardQuantity}`)
                        }
                        else {
                            console.log(d)
                        }
                    }
                }
            }
        }
        if (activityCode) {
            let a = await this.algo.curl({
                    'url': `https://api.m.jd.com/api?client=ios&clientVersion=${this.clientVersion}&appid=jdchoujiang_h5&t=1675835435363&functionId=lotteryDrawGet&body={"configCode":"${activityCode}","unionCardCode":""}&openid=-1&build=168500&osVersion=15.1.1&networkType=wifi&partner=&d_brand=iPhone&d_model=iPhone13,3&configCode=${activityCode}&unionCardCode=`,
                    cookie,
                    algo: {
                        appId: '8b04a',
                    }
                }
            )
            let data = this.haskey(a, 'data')
            if (data) {
                for (let i of this.haskey(data, 'taskConfig')) {
                    if (i.hasFinish) {
                        console.log("任务已经完成:", i.taskName)
                    }
                    else {
                        console.log("正在运行:", i.taskName)
                        if (i.taskName == '开通品牌会员' && !this.profile.openCard) {
                            console.log("没有开卡参数,跳过此任务")
                            continue
                        }
                        for (let j of this.haskey(i, 'taskItemList')) {
                            if (i.taskName == '开通品牌会员') {
                                let jo = await this.algo.curl({
                                        'url': `https://api.m.jd.com/client.action`,
                                        'form': `functionId=bindWithVender&body={"venderId":"${j.venderId}","shopId":"${j.shopId || j.venderId}","bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0,"channel":4202,"appid":"27004","needSecurity":true,"bizId":"shopmember_m_jd_com"}&t=1715046616857&appid=shopmember_m_jd_com&clientVersion=${this.clientVersion}&client=H5&&x-api-eid-token=jdd03UT42BFT33TGS6GOIOWXCCOFR2T5UM44HG27BZ3JBLL5TQWMEHHCGMANY7T3YNDDBPISS4SS7Z7C7T3OFBOP5QFT2KIAAAAMPKC6XVGYAAAAACHGDUSO4UHYMGEX`,
                                        cookie,
                                        algo: {
                                            appId: '27004'
                                        }
                                    }
                                )
                                console.log("正在开卡:", j.itemName, this.haskey(jo, 'message') || jo)
                            }
                            if (j.result == 2) {
                                continue
                            }
                            let d = await this.curl({
                                    'url': `https://api.m.jd.com/api`,
                                    form: `client=ios&clientVersion=${this.clientVersion}&appid=jdchoujiang_h5&t=1675838594588&functionId=lotteryDrawDoTask&body={"configCode":"${activityCode}","taskType":${i.taskType},"itemId":"${j.itemId}","taskId":${i.id},"babelChannel":""}&openid=-1&uuid=0721076da75ec3ea8e5f481e6d68bb4b7420c38d&build=168500&osVersion=15.1.1&networkType=wifi&partner=&d_brand=iPhone&d_model=iPhone13,3`,
                                    cookie,
                                    algo: {
                                        appId: '7a2b4',
                                    }
                                }
                            )
                            console.log('正在浏览:', j.itemName, d.success)
                            if (this.haskey(d, 'errorMessage').includes('火爆') || this.haskey(d, 'errorMessage').includes('登陆') || this.haskey(d, 'errorMessage').includes('登录')) {
                                break
                            }
                            if (i.viewTime) {
                                await this.wait(parseInt(i.viewTime) * 1000)
                            }
                            let r = await this.curl({
                                    'url': `https://api.m.jd.com/api`,
                                    form: `client=ios&clientVersion=${this.clientVersion}&appid=jdchoujiang_h5&t=1675838614020&functionId=lotteryDrawGetReward&body={"configCode":"${activityCode}","taskType":${i.taskType},"itemId":"${j.itemId}","taskId":${i.id},"babelChannel":""}&openid=-1&uuid=0721076da75ec3ea8e5f481e6d68bb4b7420c38d&build=168500&osVersion=15.1.1&networkType=wifi&partner=&d_brand=iPhone&d_model=iPhone13,3`,
                                    // 'form':``,
                                    cookie,
                                    algo: {
                                        appId: '68877',
                                    }
                                }
                            )
                            console.log(r)
                        }
                    }
                }
            }
            for (let i of Array(30)) {
                let join = await this.algo.curl({
                        'url': `https://api.m.jd.com/api?client=ios&clientVersion=${this.clientVersion}&appid=jdchoujiang_h5&t=1675839283161&functionId=lotteryDrawJoin&body={"configCode":"${activityCode}"}&openid=-1&build=168500&osVersion=15.1.1&networkType=wifi&partner=&d_brand=iPhone&d_model=iPhone13,3&configCode=${activityCode}`,
                        cookie,
                        algo: {
                            appId: '56f82',
                        }
                    }
                )
                if (!this.haskey(join, 'success')) {
                    break
                }
                // console.log(join)
                if (join.data.rewardName) {
                    if (!join.data.rewardName.includes("谢谢")) {
                        gifts.push(join.data.rewardName)
                    }
                    console.log('抽奖获得:', join.data.rewardName)
                }
                else {
                    console.log("啥都没抽到")
                }
                await this.wait(2000)
            }
        }
        if (beans>0) {
            this.notices(`获得京豆: ${beans}`, p.user)
        }
    }

    async bgl(p) {
        let cookie = p.cookie
        console.log("抽奖中...")
        for (let i of Array(10)) {
            let l = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=babelGetLottery`,
                    'form': `body=%7B%22enAwardK%22%3A%22${encodeURIComponent(p.inviter.enAwardK)}%22%2C%22awardSource%22%3A%221%22%2C%22srv%22%3A%22%7B%5C%22bord%5C%22%3A%5C%220%5C%22%2C%5C%22fno%5C%22%3A%5C%220-0-2%5C%22%2C%5C%22mid%5C%22%3A%5C%22${p.inviter.mid}%5C%22%2C%5C%22bi2%5C%22%3A%5C%222%5C%22%2C%5C%22bid%5C%22%3A%5C%220%5C%22%2C%5C%22aid%5C%22%3A%5C%22${p.inviter.aid}%5C%22%7D%22%2C%22encryptProjectId%22%3A%22${p.inviter.encryptProjectId}%22%2C%22encryptAssignmentId%22%3A%22${p.inviter.encryptAssignmentId}%22%2C%22authType%22%3A%222%22%2C%22riskParam%22%3A%7B%22platform%22%3A%223%22%2C%22orgType%22%3A%222%22%2C%22openId%22%3A%22-1%22%2C%22pageClickKey%22%3A%22Babel_WheelSurf%22%2C%22eid%22%3A%22UT42BFT33TGS6GOIOWXCCOFR2T5UM44HG27BZ3JBLL5TQWMEHHCGMANY7T3YNDDBPISS4SS7Z7C7T3OFBOP5QFT2KI%22%2C%22fp%22%3A%2272e488edc504c9c767b6866b3576387c%22%2C%22shshshfp%22%3A%22c23f1c90f0550b5c54792f20fb6ba35b%22%2C%22shshshfpa%22%3A%22dc7ab86b-e448-fce6-09f4-bc6cbb608517-1711437197%22%2C%22shshshfpb%22%3A%22BApXcqszQTOpAjBZ7Fg8SUrs91RsApjTNBlMCdrhW9xJ1NN1Sb4LRlxX-7i2a%22%2C%22childActivityUrl%22%3A%22https%253A%252F%252Fpro.m.jd.com%252Fmall%252Factive%252F${p.inviter.id}%252Findex.html%253Fstath%253D47%2526navh%253D44%2526tttparams%253DTMjLskeyJnTGF0IjoiMjMuOTM5MTkyIiwidW5fYXJlYSI6IjE2XzEzNDFfMTM0N180NDc1MCIsImRMYXQiOiIiLCJwcnN0YXRlIjoiMCIsImFkZHJlc3NJZCI6Ijc2NTc3NTQ4ODIiLCJsYXQiOiIwLjAwMDAwMCIsInBvc0xhdCI6IjIzLjkzOTE5MiIsInBvc0xuZyI6IjExNy42MTEyMyIsImdwc19hcmVhIjoiMF8wXzBfMCIsImxuZyI6IjAuMDAwMDAwIiwidWVtcHMiOiIwLTAtMCIsImdMbmciOiIxMTcuNjExMjMiLCJtb2RlbCI6ImlQaG9uZTEzLDMiLCJkTG5nIjoiIn60%25253D%22%2C%22userArea%22%3A%22-1%22%2C%22client%22%3A%22%22%2C%22clientVersion%22%3A%22%22%2C%22uuid%22%3A%22%22%2C%22osVersion%22%3A%22%22%2C%22brand%22%3A%22%22%2C%22model%22%3A%22%22%2C%22networkType%22%3A%22%22%2C%22jda%22%3A%22-1%22%7D%2C%22siteClient%22%3A%22apple%22%2C%22mitemAddrId%22%3A%22%22%2C%22geo%22%3A%7B%22lng%22%3A%220.000000%22%2C%22lat%22%3A%220.000000%22%7D%2C%22addressId%22%3A%22%22%2C%22posLng%22%3A%22123.61123%22%2C%22posLat%22%3A%2223.969192%22%2C%22un_area%22%3A%2216_1234_1314_44750%22%2C%22gps_area%22%3A%220_0_0_0%22%2C%22homeLng%22%3A%22123.61123%22%2C%22homeLat%22%3A%2223.969192%22%2C%22homeCityLng%22%3A%22%22%2C%22homeCityLat%22%3A%22%22%2C%22focus%22%3A%22%22%2C%22innerAnchor%22%3A%22%22%2C%22cv%22%3A%222.0%22%2C%22gLng1%22%3A%22%22%2C%22gLat1%22%3A%22%22%2C%22head_area%22%3A%22%22%2C%22fullUrl%22%3A%22https%3A%2F%2Fpro.m.jd.com%2Fmall%2Factive%2F34oVq6LqN9Yshb8Y841RXHG3Nzf7%2Findex.html%3Fstath%3D47%26navh%3D44%26tttparams%3DTMjLskeyJnTGF0IjoiMjMuOTM5MTkyIiwidW5fYXJlYSI6IjE2XzEzNDFfMTM0N180NDc1MCIsImRMYXQiOiIiLCJwcnN0YXRlIjoiMCIsImFkZHJlc3NJZCI6Ijc2NTc3NTQ4ODIiLCJsYXQiOiIwLjAwMDAwMCIsInBvc0xhdCI6IjIzLjkzOTE5MiIsInBvc0xuZyI6IjExNy42MTEyMyIsImdwc19hcmVhIjoiMF8wXzBfMCIsImxuZyI6IjAuMDAwMDAwIiwidWVtcHMiOiIwLTAtMCIsImdMbmciOiIxMTcuNjExMjMiLCJtb2RlbCI6ImlQaG9uZTEzLDMiLCJkTG5nIjoiIn60%253D%22%7D&screen=1170*2259&client=wh5&clientVersion=${this.clientVersion}&appid=wh5&ext=%7B%22prstate%22%3A%220%22%7D&functionId=babelGetLottery`,
                    cookie,
                    algo: {
                        appId: '35fa0',
                    }
                }
            )
            // console.log(l)
            console.log(this.haskey(l, 'promptMsg') || l)
            if (this.haskey(l, 'prizeName')) {
                this.print(`获得: ${l.prizeName}`, p.user)
            }
            if (!this.haskey(l, 'chances') || this.haskey(l, 'chances', '0')) {
                break
            }
            else {
                await this.wait(1000)
            }
        }
    }

    async hudongz(p) {
        // console.log(345)
        let cookie = p.cookie;
        let encryptProjectId = p.inviter.encryptProjectId
        let appid = p.inviter.appid || "signed_wh5"
        let sourceCode = p.inviter.sourceCode || "content_ecology"
        let appids = this.unique(['signed_wh5', appid,])
        for (let appid of appids) {
            var l = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=queryInteractiveInfo&appid=${appid}&body={"encryptProjectId":"${encryptProjectId}","ext":{"rewardEncryptAssignmentId":null,"needNum":50},"sourceCode":"${sourceCode}"}&sign=11&t=1646206781226`,
                    cookie,
                    algo: {
                        appId: '81adb'
                    }
                }
            )
            if (this.haskey(l, 'assignmentList')) {
                break
            }
            else {
                await this.wait(500)
            }
        }
        let lotteryId
        let lotteryCount = 30
        if (this.haskey(l, 'projectName', '通天塔红包雨')) {
            console.log("当前活动类型: 通天塔红包雨")
            for (let i of this.haskey(l, 'assignmentList')) {
                if (i.completionFlag) {
                    console.log(`已经抽过奖`)
                }
                else {
                    appid = 'redrain-2021'
                    lotteryId = i.encryptAssignmentId
                    lotteryCount = 1
                }
            }
        }
        else {
            console.log(this.haskey(l, 'projectName'))
            for (let i of this.haskey(l, 'assignmentList')) {
                if (i.completionFlag) {
                    console.log(`任务已经完成: ${i.assignmentName}`)
                }
                else {
                    console.log(`正在运行: ${i.assignmentName}`)
                    let extraType = i.ext.extraType
                    if (appid == 'babelh5') {
                        appid = this.appIds[p.index % this.appIds.length]
                    }
                    if (this.haskey(i, `ext.${i.ext.extraType}`)) {
                        let extra = i.ext[extraType]
                        if (extraType == 'sign1') {
                            let sign = await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=doInteractiveAssignment`,
                                    'form': `appid=${appid}&body=${this.dumps(await this.logBody(
                                        {
                                            "encryptProjectId": encryptProjectId,
                                            "sourceCode": sourceCode,
                                            "encryptAssignmentId": i.encryptAssignmentId,
                                            "completionFlag": true,
                                            "itemId": "1",
                                        }
                                    ))}&sign=11&t=1653132222710`,
                                    cookie
                                }
                            )
                            console.log(sign)
                            if (this.haskey(sign, 'msg', '场景不匹配')) {
                                this.finish.push(p.number)
                            }
                        }
                        else if (extraType == 'assistTaskDetail') {
                            let index = parseInt(p.index) + 1
                            for (let o of Array(i.assignmentTimesLimit)) {
                                for (let k of Array(0)) {
                                    let assist = await this.curl({
                                            'url': `https://api.m.jd.com/client.action?functionId=doInteractiveAssignment`,
                                            'form': `appid=${appid}&body=${this.dumps(await this.logBody(
                                                {
                                                    "encryptProjectId": encryptProjectId,
                                                    "sourceCode": sourceCode,
                                                    "encryptAssignmentId": i.encryptAssignmentId,
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
                                            cookie
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
                                    if (['shoppingActivity', 'productsInfo', 'browseShop'].includes(extraType)) {
                                        let d = await this.curl({
                                                'url': `https://api.m.jd.com/client.action?functionId=doInteractiveAssignment`,
                                                'form': `appid=${appid}&body=${this.dumps(await this.logBody(
                                                    {
                                                        encryptProjectId,
                                                        "encryptAssignmentId": i.encryptAssignmentId,
                                                        "itemId": j.itemId || j.advId,
                                                        sourceCode,
                                                        "actionType": 1,
                                                    }
                                                ))}&sign=11&t=1653132222710`,
                                                cookie
                                            }
                                        )
                                        // console.log(d)
                                        await this.wait((i.ext.waitDuration || 0) * 1000 + 500)
                                    }
                                    let s = await this.curl({
                                            'url': `https://api.m.jd.com/client.action?functionId=doInteractiveAssignment`,
                                            'form': `appid=${appid}&body=${this.dumps(await this.logBody(
                                                {
                                                    encryptProjectId,
                                                    "encryptAssignmentId": i.encryptAssignmentId,
                                                    "itemId": j.itemId || j.advId,
                                                    sourceCode,
                                                }
                                            ))}&sign=11&t=1653132222710`,
                                            cookie
                                        }
                                    )
                                    console.log(i.assignmentName, s.msg)
                                    if (this.haskey(s, 'msg', '风险等级未通过')) {
                                        return
                                    }
                                    if (this.dumps(s).includes('火爆')) {
                                        break
                                    }
                                    await this.wait(1000)
                                }
                            } catch (e) {
                            }
                        }
                    }
                    else {
                        if (i.assignmentName.includes("抽奖")) {
                            lotteryId = i.encryptAssignmentId
                        }
                    }
                }
            }
        }
        let gifts = []
        if (lotteryId) {
            console.log('抽奖中...')
            for (let i = 0; i<lotteryCount; i++) {
                let body = await this.logBody(
                    {
                        encryptProjectId,
                        "encryptAssignmentId": lotteryId,
                        "completionFlag": true,
                        "ext": {"exchangeNum": 1},
                        sourceCode,
                    }
                )
                let r = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=doInteractiveAssignment`,
                        'form': `appid=${appid}&body=${this.dumps(body)}&sign=11&t=1646207845798`,
                        cookie
                    }
                )
                if (!r) {
                    break
                }
                else if (['风险等级未通过', "未登录", '兑换积分不足', '场景不匹配', '活动太火爆了'].includes(r.msg) || this.dumps(r).includes('火爆')) {
                    console.log(r.msg)
                    break
                }
                if (this.haskey(r, 'rewardsInfo.successRewards')) {
                    for (let g in r.rewardsInfo.successRewards) {
                        let data = r.rewardsInfo.successRewards[g]
                        for (let k of data) {
                            console.log("抽奖获得:", k.rewardName)
                            gifts.push(k.rewardName)
                        }
                    }
                }
                else {
                    console.log(`什么也没有抽到`)
                }
            }
        }
        if (p.inviter.projectId.length>0) {
            for (let i of p.inviter.projectId) {
                l = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=queryInteractiveInfo`,
                        'form': `appid=${appid}&body={"encryptProjectId":"${i[1]}","ext":{"rewardEncryptAssignmentId":null,"needNum":50},"sourceCode":"${sourceCode}"}&sign=11&t=1646206781226`,
                        cookie
                    }
                )
                if (this.haskey(l, 'assignmentList') && l.assignmentList.length == 1) {
                    for (let kk of Array(10)) {
                        let r = await this.curl({
                                'url': `https://api.m.jd.com/client.action?uuid=60f0226f67be77007d7dc5817801e282dda1211e&client=wh5&clientVersion=${this.clientVersion}&osVersion=15.6.1&networkType=wifi&ext=%7B%22prstate%22:%220%22%7D&appid=${appid}&functionId=doInteractiveAssignment&body={"geo":{"lng":"","lat":""},"mcChannel":0,"encryptProjectId":"${i[1]}","encryptAssignmentId":"${l.assignmentList[0].encryptAssignmentId}","sourceCode":"${sourceCode}","itemId":"","actionType":"","completionFlag":true,"ext":{"exchangeNum":1}}`,
                                cookie,
                                form: "",
                            }
                        )
                        if (!r) {
                            break
                        }
                        else if (['风险等级未通过', "未登录", '兑换积分不足', '场景不匹配'].includes(r.msg)) {
                            console.log(r.msg)
                            break
                        }
                        if (this.haskey(r, 'rewardsInfo.successRewards')) {
                            for (let g in r.rewardsInfo.successRewards) {
                                let data = r.rewardsInfo.successRewards[g]
                                for (let k of data) {
                                    console.log('获得:', k.rewardName)
                                    gifts.push(k.rewardName)
                                }
                            }
                        }
                        else {
                            console.log(`什么也没有抽到`)
                        }
                    }
                }
            }
        }
        if (gifts.length>0) {
            console.log("奖品汇总:")
            this.print(gifts.join("\n"), p.user)
        }
    }

    async tewuz(p) {
        let cookie = p.cookie;
        let list = await this.curl({
                'url': `https://api.m.jd.com/?uuid=&client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskList&t=1649852207375&body={"source":"star_gift","activityId":${p.inviter.activityId}}`,
                cookie
            }
        )
        let lotteryId
        let gifts = []
        let encryptProjectId = p.inviter.encryptProjectId
        let appid = p.inviter.appid
        if (this.haskey(list, 'data.bizMsg', '风控')) {
            console.log(p.user, '风控')
            return
        }
        if (!this.haskey(list, 'data.result.taskList')) {
            console.log("没有获取到数据...")
            return
        }
        for (let i of this.haskey(list, 'data.result.taskList')) {
            if (i.completionFlag) {
                console.log(`任务已经完成: ${i.assignmentName}`)
            }
            else {
                let extraType = i.ext.extraType
                if (this.haskey(i, `ext.${i.ext.extraType}`)) {
                    let extra = i.ext[extraType]
                    for (let j of extra) {
                        if (i.ext.extraType == 'brandMemberList' && this.profile.openCard) {
                            let jo = await this.algo.curl({
                                    'url': `https://api.m.jd.com/client.action`,
                                    'form': `functionId=bindWithVender&body={"venderId":"${j.vendorIds}","shopId":"${j.vendorIds}","bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0,"channel":4202,"appid":"27004","needSecurity":true,"bizId":"shopmember_m_jd_com"}&t=1715046616857&appid=shopmember_m_jd_com&clientVersion=${this.clientVersion}&client=H5&&x-api-eid-token=jdd03UT42BFT33TGS6GOIOWXCCOFR2T5UM44HG27BZ3JBLL5TQWMEHHCGMANY7T3YNDDBPISS4SS7Z7C7T3OFBOP5QFT2KIAAAAMPKC6XVGYAAAAACHGDUSO4UHYMGEX`,
                                    cookie,
                                    algo: {
                                        appId: '27004'
                                    }
                                }
                            )
                            console.log("正在开卡:", this.haskey(jo, 'message') || jo)
                        }
                        let s = await this.curl({
                                url: `https://api.m.jd.com/?uuid=&client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"star_gift","activityId":${p.inviter.activityId},"encryptProjectId":"${p.inviter.encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":1,"itemId":"${j.advId || j.itemId}","actionType":1}`,
                                cookie
                            }
                        )
                        if (i.ext.waitDuration) {
                            console.log(`等待: ${i.ext.waitDuration}s`)
                            await this.wait(i.ext.waitDuration * 1000)
                            s = await this.curl({
                                    url: `https://api.m.jd.com/?uuid=&client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"star_gift","activityId":${p.inviter.activityId},"encryptProjectId":"${p.inviter.encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":1,"itemId":"${j.advId || j.itemId}","actionType":0}`,
                                    cookie
                                }
                            )
                            console.log(s)
                        }
                        else {
                            console.log(i.assignmentName, this.haskey(s, 'data.bizMsg'))
                        }
                    }
                }
                else {
                    if (i.assignmentName.includes("抽奖")) {
                        lotteryId = i.encryptAssignmentId
                    }
                }
            }
        }
        if (lotteryId) {
            let r = await this.curl({
                    'url': `https://api.m.jd.com/?uuid=&client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskLottery&t=${this.timestamp}&body={"source":"star_gift","activityId":${p.inviter.activityId},"encryptProjectId":"${p.inviter.encryptProjectId}"}`,
                    cookie
                }
            )
            if (this.haskey(r, 'data.result.rewards')) {
                for (let g in r.data.result.rewards) {
                    let data = r.data.result.rewards[g]
                    if (data.beanNum) {
                        this.print(`京豆: ${data.beanNum}`, p.user)
                    }
                    else {
                        console.log(`获得:`, data)
                    }
                }
            }
            else {
                console.log(`什么也没有抽到`)
            }
        }
        if (gifts.length>0) {
            this.notices(gifts.join("\n"), p.user)
        }
    }
}

module.exports = Main;
