const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东特价汪汪庄园"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 10)},${this.rand(14, 21)} * * *`
        this.help = 2
        this.task = 'local'
        this.import = ['jdAlgo', 'fs']
        this.delay = 600
        this.interval = 3000
        this.hint = {
            merge: '1 # 执行购买与合成任务',
        }
    }

    async prepare() {
        this.linkId = this.profile.linkId || "LsQNxL7iWDlXUs6cFl-AAg"
        this.clientVersion = "13.0.1"
        this.build = "1247"
        this.algo = new this.modules.jdAlgo({
            type: "main",
            version: "latest"
        })
        this.inviteIds = []
        let fcode = []
        try {
            let txt = this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_joyPark.json`).toString()
            this.code = this.loads(txt)
        } catch (e) {
        }
    }

    async main(p) {
        let cookie = p.cookie;
        try {
            this.dict[p.user] = {}
            await this.baseInfo(p)
            await this.joyList(p)
            console.log("获取数据中...", this.dict[p.user])
            await this.shopList(p)
            await this.two(p)
            let list = await this.algoCurl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=apTaskList&body={"linkId":"${this.linkId}"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                    cookie
                }
            )
            for (let i of this.haskey(list, 'data')) {
                if (i.taskType == 'SHARE_INVITE') {
                    if (!this.inviteIds.includes(i.id)) {
                        this.inviteIds.push(i.id)
                    }
                    if (this.cookies.help.includes(p.cookie) && this.dict[p.user].invitePin) {
                        // if (this.dict[p.user].invitePin) {
                        let shareCode = {
                            user: p.user,
                            inviterPin: this.dict[p.user].invitePin
                        }
                        console.log('获取助力码:', shareCode)
                        this.code.push(shareCode)
                    }
                }
                if (i.taskDoTimes != i.taskLimitTimes) {
                    let ok = 0
                    for (let j = 0; j<i.taskLimitTimes - i.taskDoTimes; j++) {
                        if (ok) {
                            break
                        }
                        console.log(`正在做:`, i.taskTitle, i.taskType)
                        switch (i.taskType) {
                            case 'ORDER_MARK':
                                break
                            case 'SHARE_INVITE':
                                this.inviteId = i.id
                                break
                            case 'SIGN':
                                let ss = await this.algoCurl({
                                        'url': `https://api.m.jd.com/`,
                                        'form': `functionId=apDoTask&body={"taskType":"SIGN","taskId":${i.id},"openUdId":"","cityId":"1234","provinceId":"16","countyId":"1234","linkId":"${this.linkId}"}&t=1681048184898&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                                        cookie,
                                        algo: {
                                            appId: 'cd949'
                                        }
                                    }
                                )
                                let dd = await this.algoCurl({
                                        'url': `https://api.m.jd.com/`,
                                        'form': `functionId=apTaskDrawAward&body={"taskType":"${i.taskType}","taskId":${i.id},"linkId":"${this.linkId}"}&t=1681048184898&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                                        cookie,
                                        algo: {
                                            appId: "55276"
                                        }
                                    }
                                )
                                if (this.haskey(dd, 'success')) {
                                    console.log('任务完成:', dd.success)
                                    await this.baseInfo(p)
                                    await this.two(p)
                                }
                                break
                            case 'BROWSE_CHANNEL':
                            case  'BROWSE_PRODUCT' :
                                let detail = await this.algoCurl({
                                        'url': `https://api.m.jd.com/`,
                                        'form': `functionId=apTaskDetail&body={"taskType":"${i.taskType}","taskId":${i.id},"openUdId":"","cityId":"1234","provinceId":"16","countyId":"1234","channel":4,"linkId":"${this.linkId}"}&t=1681346461637&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=0721076da75ec3ea8e5f481e6d68bb4b7420c38d&build=${this.build}&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidId7f9812189s4Ywiz164KTQqoeSyoW1uZwmMItV216n8pCJ26eJPEqZb5n8VkyLjW71hRQ6fhLku8USG3jg%2BHtZ7ecv%2BJ2CWEYpUd99P1GvH7bppT`,
                                        cookie
                                    }
                                )
                                if (this.haskey(detail, 'data.taskItemList')) {
                                    let s = await this.algoCurl({
                                            'url': `https://api.m.jd.com/`,
                                            form: `functionId=apDoTask&body={"taskType":"${i.taskType}","taskId":${i.id},"openUdId":"","cityId":"1234","provinceId":"16","countyId":"1234","channel":4,"linkId":"${this.linkId}","taskInsert":true,"itemId":"${encodeURIComponent((detail.data.taskItemList[j] || detail.data.taskItemList[0]).itemId)}"}&t=1681346461752&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=0721076da75ec3ea8e5f481e6d68bb4b7420c38d&build=${this.build}&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidId7f9812189s4Ywiz164KTQqoeSyoW1uZwmMItV216n8pCJ26eJPEqZb5n8VkyLjW71hRQ6fhLku8USG3jg%2BHtZ7ecv%2BJ2CWEYpUd99P1GvH7bppT`,
                                            cookie,
                                            algo: {
                                                appId: 'cd949'
                                            }
                                        }
                                    )
                                    if (this.haskey(s, 'success')) {
                                        let d = await this.algoCurl({
                                                'url': `https://api.m.jd.com/`,
                                                'form': `functionId=apTaskDrawAward&body={"taskType":"${i.taskType}","taskId":${i.id},"linkId":"${this.linkId}"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&build=${this.build}&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=11.4&partner=&eid=eidIb24b812115s9jUHzkyfNSICH4T313nxTSY1B9QqDr0IUV8vdzISUvNGSXxO%2BeCNY01V69ImKsiy4ptOddRzE0E%2F950ionHyQBWNiEguhXNM%2B%2BD5v`,
                                                cookie,
                                                algo: {
                                                    appId: "55276"
                                                }
                                            }
                                        )
                                        if (this.haskey(d, 'success')) {
                                            console.log('任务完成:', d.success)
                                            await this.baseInfo(p)
                                            await this.two(p)
                                        }
                                    }
                                    else {
                                        console.log(this.haskey(s, 'errMsg') || s)
                                        break
                                    }
                                }
                                else {
                                    let s = await this.algoCurl({
                                            'url': `https://api.m.jd.com/`,
                                            form: `functionId=apDoTask&body={"taskType":"${i.taskType}","taskId":${i.id},"openUdId":"","cityId":"1234","provinceId":"16","countyId":"1234","channel":4,"linkId":"${this.linkId}","taskInsert":true,"itemId":"${encodeURIComponent(i.taskSourceUrl)}"}&t=1681346461752&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=0721076da75ec3ea8e5f481e6d68bb4b7420c38d&build=${this.build}&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidId7f9812189s4Ywiz164KTQqoeSyoW1uZwmMItV216n8pCJ26eJPEqZb5n8VkyLjW71hRQ6fhLku8USG3jg%2BHtZ7ecv%2BJ2CWEYpUd99P1GvH7bppT`,
                                            cookie,
                                            algo: {
                                                appId: 'cd949'
                                            }
                                        }
                                    )
                                    if (this.haskey(s, 'success')) {
                                        let d = await this.algoCurl({
                                                'url': `https://api.m.jd.com/`,
                                                'form': `functionId=apTaskDrawAward&body={"taskType":"${i.taskType}","taskId":${i.id},"linkId":"${this.linkId}"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&build=${this.build}&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=11.4&partner=&eid=eidIb24b812115s9jUHzkyfNSICH4T313nxTSY1B9QqDr0IUV8vdzISUvNGSXxO%2BeCNY01V69ImKsiy4ptOddRzE0E%2F950ionHyQBWNiEguhXNM%2B%2BD5v`,
                                                cookie,
                                                algo: {
                                                    appId: "55276"
                                                }
                                            }
                                        )
                                        if (this.haskey(d, 'success')) {
                                            console.log('任务完成:', d.success)
                                            await this.baseInfo(p)
                                            await this.two(p)
                                        }
                                    }
                                    else {
                                        console.log(this.haskey(s, 'errMsg') || s)
                                        break
                                    }
                                }
                                break
                        }
                    }
                }
                else {
                    console.log(`任务完成`, i.taskTitle)
                }
            }
            await this.two(p)
            for (let __ of Array(2)) {
                let list = await this.algoCurl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=apTaskList&body={"linkId":"${this.linkId}"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                        cookie
                    }
                )
                for (let i of this.haskey(list, 'data')) {
                    if (i.canDrawAwardNum) {
                        for (let n of Array(i.canDrawAwardNum)) {
                            let d = await this.algoCurl({
                                    'url': `https://api.m.jd.com/`,
                                    'form': `functionId=apTaskDrawAward&body={"taskType":"${i.taskType}","taskId":${i.id},"linkId":"${this.linkId}"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&build=${this.build}&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=11.4&partner=&eid=eidIb24b812115s9jUHzkyfNSICH4T313nxTSY1B9QqDr0IUV8vdzISUvNGSXxO%2BeCNY01V69ImKsiy4ptOddRzE0E%2F950ionHyQBWNiEguhXNM%2B%2BD5v`,
                                    cookie,
                                    algo: {
                                        appId: "55276"
                                    }
                                }
                            )
                            if (this.haskey(d, 'success')) {
                                console.log(`获取${i.taskTitle}金币...`, d.success)
                                await this.baseInfo(p)
                                await this.two(p)
                            }
                        }
                    }
                }
            }
            let joys = []
            for (let i in this.dict[p.user].joy) {
                for (let j of this.dict[p.user].joy[i]) {
                    joys.push(j)
                }
            }
            if (this.dict[p.user].unlock && joys.length>0) {
                joys = joys.reverse()
                let min = Math.min(joys.length, this.dict[p.user].unlock)
                for (let i = 0; i<min; i++) {
                    let move = await this.algoCurl({
                            'url': `https://api.m.jd.com/`,
                            'form': `functionId=joyMove&body={"joyId":${joys[i]},"location":${i + 1},"linkId":"${this.linkId}"}&t=1681056608416&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                            cookie,
                            algo: {
                                appId: "50788"
                            }
                        }
                    )
                    console.log('移动狗子去工作...', this.haskey(move, 'success'))
                }
            }
            let cashPrize = await this.algoCurl({
                    'url': `https://api.m.jd.com/?functionId=gameMyCashPrize&body={"linkId":"${this.linkId}","pageNum":1,"pageSize":10}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&build=${this.build}&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=11.4&partner=&eid=eidIb24b812115s9jUHzkyfNSICH4T313nxTSY1B9QqDr0IUV8vdzISUvNGSXxO%2BeCNY01V69ImKsiy4ptOddRzE0E%2F950ionHyQBWNiEguhXNM%2B%2BD5v`,
                    // 'form':``,
                    cookie
                }
            )
            for (let i of this.haskey(cashPrize, 'data.items')) {
                if (i.prizeType == 4 && i.state == 0) {
                    let sss = await this.algoCurl({
                            'url': 'https://api.m.jd.com/',
                            form: `functionId=apCashWithDraw&body={"businessSource":"JOY_PARK","base":{"id":${i.id},"business":"joyPark","poolBaseId":${i.poolBaseId},"prizeGroupId":${i.prizeGroupId},"prizeBaseId":${i.prizeBaseId},"prizeType":${i.prizeType},"activityId":"${i.activityId}"},"linkId":"${this.linkId}","inviter":""}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=db953e5e7cc5812dae6b5e45a04201cc4f3e2030&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=13.7&partner=&eid=eidI16fe81226asdsrs6k2OTTyOBBbhCfGtXwbK7PBFBEWxOgr9KLEUyLLuTguf4fW8nrXFjtSacDPyb%2FWv6KWmFaBUhrlMiSnB5H42FsBr2f72YyFA4`,
                            cookie
                        }
                    )
                    if (this.haskey(sss, 'data.message'), "无效的openId，当前pin尚未绑定微信") {
                        console.log("无效的openId，当前pin尚未绑定微信")
                        break
                    }
                    this.print(`提现${i.prizeValue} ${this.haskey(sss, 'data.message')}`, p.user)
                    await this.wait(5000)
                }
            }
        } catch (e) {
        }
    }

    async two(p) {
        if (this.profile.merge) {
            await this.one(p)
            let cookie = p.cookie
            let joy = this.dict[p.user].joy || {}
            for (let i = 0; i<30; i++) {
                if (this.dict[p.user].coin>this.dict[p.user].buyCoin) {
                    if (this.dict[p.user].number>9) {
                        console.log("不能再养狗子了...")
                        break
                    }
                    let i = this.dict[p.user].buyLevel
                    let buy = await this.algoCurl({
                            'url': `https://api.m.jd.com/`,
                            'form': `functionId=joyBuy&body={"level":${i},"linkId":"${this.linkId}"}&t=1681023733345&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                            cookie,
                            algo: {
                                'appId': 'ffb36'
                            }
                        }
                    )
                    await this.baseInfo(p)
                    await this.joyList(p)
                    await this.shopList(p)
                    if (this.haskey(buy, 'data')) {
                        // console.log(`购买等级${i}的狗子成功...`, this.dict[p.user].joy[i])
                        console.log(`购买等级${i}的狗子成功...`, JSON.stringify(this.dict[p.user].joy))
                    }
                    else {
                        console.log(`购买等级${i}的狗子失败...`)
                        break
                    }
                }
                else {
                    console.log(this.dict[p.user].buyLevel ? `购买等级${this.dict[p.user].buyLevel}的牛牛金币不足...` : '金币不足...')
                    break
                }
                await this.one(p)
            }
        }
    }

    async one(p) {
        let cookie = p.cookie
        let joy = this.dict[p.user].joy || {}
        let isChange = 0
        for (let i in this.dict[p.user].joy) {
            if (this.dict[p.user].joy[i].length>1) {
                let list = this.dict[p.user].joy[i]
                let spl = this.slice(list, 2)
                for (let k = 0; k<spl.length; k++) {
                    let kk = spl[k].sort()
                    let merge = await this.algoCurl({
                            'url': `https://api.m.jd.com/?functionId=joyMergeGet&body={"joyOneId":${kk[0]},"joyTwoId":${kk[1]},"linkId":"${this.linkId}"}&t=1681023762664&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                            cookie,
                            algo: {
                                'appId': 'c3beb'
                            }
                        }
                    )
                    if (this.haskey(merge, 'data.joyPrizeVO.prizeName')) {
                        let prizeType = merge.data.joyPrizeVO.prizeType
                        if (prizeType == 2) {
                            this.print(`红包: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                        }
                        else if (prizeType == 3) {
                            this.print(`京豆: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                        }
                        else if (prizeType == 4) {
                            this.print(`现金: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                        }
                        else {
                            console.log(`升级奖励: ${merge.data.joyPrizeVO.prizeName}`)
                        }
                    }
                    if (this.haskey(merge, 'data.joyVO.id')) {
                        isChange++
                        let joyss = this.dict[p.user].joy
                        joyss[merge.data.joyVO.level] = joyss[merge.data.joyVO.level] || []
                        joyss[merge.data.joyVO.level].push(merge.data.joyVO.id)
                        joyss[i] = spl[k + 1] || []
                        console.log(`合成等级${parseInt(i) + 1}的狗子成功...`, JSON.stringify(joyss))
                    }
                    // console.log(`合成等级${parseInt(i) + 1}的狗子成功...`, this.dict[p.user].joy[parseInt(i) + 1])
                }
            }
        }
        if (isChange>0) {
            await this.baseInfo(p)
            await this.joyList(p)
        }
        if (joy["25"] && joy["26"] && joy["27"] && joy["28"] && joy["29"] && joy["25"].length>0 && joy["26"].length>0 && joy["27"].length>0 && joy["28"].length>0 && joy["29"].length>0) {
            for (let i = 21; i<25; i++) {
                if ((joy["25"].length + joy["26"].length + joy["27"].length + joy["28"].length + joy["29"].length)>5) {
                    break
                }
                if (!this.haskey(joy, `${i}.0`)) {
                    // if (this.dict[p.user].joy && (this.dict[p.user].joy[i] && this.dict[p.user].joy[i].length == 0) || !this.dict[p.user].joy[i]) {
                    let joyInfo = this.dict[p.user].shop[i]
                    if (joyInfo && this.dict[p.user].coin>0 && joyInfo.consume>0 && joyInfo.consume<this.dict[p.user].coin) {
                        if (this.dict[p.user].number>9) {
                            console.log("不能再养狗子了...")
                            break
                        }
                        let buy = await this.algoCurl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=joyBuy&body={"level":${i},"linkId":"${this.linkId}"}&t=1681023733345&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                                cookie,
                                algo: {
                                    'appId': 'ffb36'
                                }
                            }
                        )
                        await this.baseInfo(p)
                        await this.joyList(p)
                        await this.shopList(p)
                        if (this.haskey(buy, 'data')) {
                            // console.log(`购买等级${i}的狗子成功...`, this.dict[p.user].joy[i])
                            console.log(`购买等级${i}的狗子成功...`, JSON.stringify(this.dict[p.user].joy))
                        }
                        else {
                            console.log(`购买等级${i}的狗子失败...`)
                            break
                        }
                    }
                    else {
                        console.log(`没有足够的金币可以购买等级${i}的狗子...`)
                        break
                    }
                }
            }
            if (joy["21"] && joy["22"] && joy["23"] && joy["24"] && joy["21"].length>0 && joy["22"].length>0 && joy["23"].length>0 && joy["24"].length>0) {
                for (let i = 21; i<22; i++) {
                    let joyInfo = this.dict[p.user].shop[i]
                    if (joyInfo && this.dict[p.user].coin>0 && joyInfo.consume>0 && joyInfo.consume<this.dict[p.user].coin) {
                        if (this.dict[p.user].number>9) {
                            console.log("不能再养狗子了...")
                            break
                        }
                        let buy = await this.algoCurl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=joyBuy&body={"level":${i},"linkId":"${this.linkId}"}&t=1681023733345&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                                cookie,
                                algo: {
                                    'appId': 'ffb36'
                                }
                            }
                        )
                        await this.baseInfo(p)
                        await this.joyList(p)
                        await this.shopList(p)
                        if (this.haskey(buy, 'data')) {
                            // console.log(`购买等级${i}的狗子成功...`, this.dict[p.user].joy[i])
                            console.log(`购买等级${i}的狗子成功...`, JSON.stringify(this.dict[p.user].joy))
                        }
                        else {
                            console.log(`购买等级${i}的狗子失败...`)
                            break
                        }
                    }
                    else {
                        console.log(`没有足够的金币可以购买等级${i}的狗子...`)
                        break
                    }
                }
                for (let i in this.dict[p.user].joy) {
                    if (this.dict[p.user].joy[i] && this.dict[p.user].joy[i].length>1 && this.dict[p.user].joy[i].length % 2 == 0
                    ) {
                        let list = this.dict[p.user].joy[i]
                        let spl = this.slice(list, 2)
                        for (let k of spl) {
                            let kk = k.sort()
                            let merge = await this.algoCurl({
                                    'url': `https://api.m.jd.com/?functionId=joyMergeGet&body={"joyOneId":${kk[0]},"joyTwoId":${kk[1]},"linkId":"${this.linkId}"}&t=1681023762664&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                                    cookie,
                                    algo: {
                                        'appId': 'c3beb'
                                    }
                                }
                            )
                            if (this.haskey(merge, 'data.joyPrizeVO.prizeName')) {
                                let prizeType = merge.data.joyPrizeVO.prizeType
                                if (prizeType == 2) {
                                    this.print(`红包: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                                }
                                else if (prizeType == 3) {
                                    this.print(`京豆: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                                }
                                else if (prizeType == 4) {
                                    this.print(`现金: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                                }
                                else {
                                    console.log(`升级奖励: ${merge.data.joyPrizeVO.prizeName}`)
                                }
                            }
                            await this.baseInfo(p)
                            await this.joyList(p)
                            // console.log(`合成等级${parseInt(i) + 1}的狗子成功...`, this.dict[p.user].joy[parseInt(i) + 1])
                            console.log(`合成等级${parseInt(i) + 1}的狗子成功...`, JSON.stringify(this.dict[p.user].joy))
                        }
                    }
                }
            }
        }
        else {
            for (let i in this.dict[p.user].joy) {
                if (this.dict[p.user].joy[i] && this.dict[p.user].joy[i].length>1 && this.dict[p.user].joy[i].length % 2 == 0
                ) {
                    let list = this.dict[p.user].joy[i]
                    let spl = this.slice(list, 2)
                    for (let k of spl) {
                        let kk = k.sort()
                        let merge = await this.algoCurl({
                                'url': `https://api.m.jd.com/?functionId=joyMergeGet&body={"joyOneId":${kk[0]},"joyTwoId":${kk[1]},"linkId":"${this.linkId}"}&t=1681023762664&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                                cookie,
                                algo: {
                                    'appId': 'c3beb'
                                }
                            }
                        )
                        if (this.haskey(merge, 'data.joyPrizeVO.prizeName')) {
                            let prizeType = merge.data.joyPrizeVO.prizeType
                            if (prizeType == 2) {
                                this.print(`红包: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                            }
                            else if (prizeType == 3) {
                                this.print(`京豆: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                            }
                            else if (prizeType == 4) {
                                this.print(`现金: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                            }
                            else {
                                console.log(`升级奖励: ${merge.data.joyPrizeVO.prizeName}`)
                            }
                        }
                        await this.baseInfo(p)
                        await this.joyList(p)
                        // console.log(`合成等级${parseInt(i) + 1}的狗子成功...`, this.dict[p.user].joy[parseInt(i) + 1])
                        console.log(`合成等级${parseInt(i) + 1}的狗子成功...`, JSON.stringify(this.dict[p.user].joy))
                    }
                }
            }
            for (let i in this.dict[p.user].joy) {
                if (this.dict[p.user].joy[i] && this.dict[p.user].joy[i].length % 2 == 1 && i<this.dict[p.user].buyLevel) {
                    let joyInfo = this.dict[p.user].shop[i]
                    if (joyInfo && this.dict[p.user].coin>0 && joyInfo.consume>0 && joyInfo.consume<this.dict[p.user].coin) {
                        if (this.dict[p.user].number>9) {
                            console.log("不能再养狗子了...")
                            break
                        }
                        let buy = await this.algoCurl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=joyBuy&body={"level":${i},"linkId":"${this.linkId}"}&t=1681023733345&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                                cookie,
                                algo: {
                                    'appId': 'ffb36'
                                }
                            }
                        )
                        if (this.haskey(buy, 'data')) {
                            await this.shopList(p)
                            // console.log(`购买等级${i}的狗子成功...`, this.dict[p.user].joy[i])
                            console.log(`购买等级${i}的狗子成功...`, JSON.stringify(this.dict[p.user].joy))
                            // 此处为了防止有低等级狗子合并购买逻辑混乱
                            let list = this.dict[p.user].joy[i]
                            if (list && list.length>1) {
                                let spl = this.slice(list, 2)
                                for (let k of spl) {
                                    let kk = k.sort()
                                    let merge = await this.algoCurl({
                                            'url': `https://api.m.jd.com/?functionId=joyMergeGet&body={"joyOneId":${kk[0]},"joyTwoId":${kk[1]},"linkId":"${this.linkId}"}&t=1681023762664&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                                            cookie,
                                            algo: {
                                                'appId': 'c3beb'
                                            }
                                        }
                                    )
                                    if (this.haskey(merge, 'data.joyPrizeVO.prizeName')) {
                                        let prizeType = merge.data.joyPrizeVO.prizeType
                                        if (prizeType == 2) {
                                            this.print(`红包: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                                        }
                                        else if (prizeType == 3) {
                                            this.print(`京豆: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                                        }
                                        else if (prizeType == 4) {
                                            this.print(`现金: ${merge.data.joyPrizeVO.prizeName}`, p.user)
                                        }
                                        else {
                                            console.log(`升级奖励: ${merge.data.joyPrizeVO.prizeName}`)
                                        }
                                    }
                                    // console.log(`合成等级${parseInt(i) + 1}的狗子成功...`, this.dict[p.user].joy[parseInt(i) + 1])
                                    console.log(`合成等级${parseInt(i) + 1}的狗子成功...`, JSON.stringify(this.dict[p.user].joy))
                                }
                            }
                            await this.baseInfo(p)
                            await this.joyList(p)
                        }
                        else {
                            console.log(`购买等级${i}的狗子失败...`)
                        }
                    }
                    else {
                        console.log(`没有足够的金币可以购买等级${i}的狗子...`)
                    }
                }
            }
        }
    }

    async joyList(p) {
        let cookie = p.cookie
        for (let i of Array(2)) {
            var joyList = await this.algoCurl({
                    'url': `https://api.m.jd.com/?functionId=joyList&body={"linkId":"${this.linkId}"}&t=1681056608416&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                    // 'form':``,
                    cookie,
                    algo: {
                        'appId': 'e18ed'
                    }
                }
            )
            if (this.haskey(joyList, 'data')) {
                break
            }
        }
        if (this.haskey(joyList, 'data')) {
            let number = joyList.data.joyNumber
            var joy = {}
            for (let i of joyList.data.activityJoyList) {
                joy[i.level] = joy[i.level] || []
                joy[i.level].push(i.id)
            }
            if (this.haskey(joyList, 'data.workJoyInfoList')) {
                for (let i of joyList.data.workJoyInfoList) {
                    if (this.haskey(i, 'joyDTO.id')) {
                        let move = await this.algoCurl({
                                'url': 'https://api.m.jd.com/',
                                'form': `functionId=joyMove&body={"joyId":${i.joyDTO.id},"location":0,"linkId":"${this.linkId}"}&t=1681056608416&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                                cookie,
                                algo: {
                                    'appId': '50788'
                                }
                            }
                        )
                        if (this.haskey(move, 'success')) {
                            joy[i.joyDTO.level] = joy[i.joyDTO.level] || []
                            joy[i.joyDTO.level].push(i.joyDTO.id)
                        }
                    }
                }
            }
            let list = Object.keys(joy).map(d => parseInt(d))
            let min = Math.min(...list)
            let max = Math.max(...list)
            for (let i = min; i<max; i++) {
                joy[i] = joy[i] || []
            }
            let unlock = joyList.data.workJoyInfoList.filter(d => d.unlock).length
            let obj = {
                joy,
                number,
                min,
                unlock
            }
            this.dict[p.user] = {...this.dict[p.user], ...obj}
            return obj
        }
        else {
            let obj = {
                joy: {}
            }
            this.dict[p.user] = {...this.dict[p.user], ...obj}
            return obj
        }
    }

    async shopList(p) {
        let cookie = p.cookie
        let s = await this.algoCurl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=gameShopList&body={"linkId":"${this.linkId}"}&t=1681017994034&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                cookie
            }
        )
        this.assert(!this.haskey(s, 'code', 1000), "未登录")
        let data = this.haskey(s, 'data')
        if (data) {
            let obj = {shop: this.column(data, '', 'userLevel')}
            this.dict[p.user] = {
                ...this.dict[p.user], ...obj
            }
            return obj
        }
        else {
            return {}
        }
    }

    async baseInfo(p) {
        let cookie = p.cookie;
        let inviterPin = ''
        let helpUser = ''
        if (this.code.length>0) {
            let help = this.code[(p.index + 1) % this.code.length] || {}
            inviterPin = help.inviterPin
            helpUser = help.user
            if (!this.taskId) {
                let list = await this.algoCurl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=apTaskList&body={"linkId":"${this.linkId}"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&build=${this.build}&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=11.4&partner=&eid=eidIb24b812115s9jUHzkyfNSICH4T313nxTSY1B9QqDr0IUV8vdzISUvNGSXxO%2BeCNY01V69ImKsiy4ptOddRzE0E%2F950ionHyQBWNiEguhXNM%2B%2BD5v`,
                    }
                )
                for (let i of this.haskey(list, 'data')) {
                    if (i.taskType == 'SHARE_INVITE') {
                        this.taskId = i.id
                    }
                }
            }
        }
        for (let i of Array(2)) {
            if (this.inviteIds.length>1) {
                this.taskId = this.random(this.inviteIds, 1)[0]
            }
            var baseInfo = await this.algoCurl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=joyBaseInfo&body={"taskId":"${inviterPin ? this.taskId : ''}","inviteType":"1","inviterPin":"${inviterPin}","linkId":"${this.linkId}"}&t=1681012535084&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                    cookie,
                    algo: {
                        appId: "4abce"
                    }
                }
            )
            this.assert(!this.haskey(baseInfo, 'code', 1000), "未登录")
            if (this.haskey(baseInfo, 'data')) {
                break
            }
            else if (this.haskey(baseInfo, 'errMsg', 'blackfail')) {
                console.log("狗子在小黑屋里面...")
                break
            }
            else {
                await this.wait(1200)
            }
        }
        var data = this.haskey(baseInfo, 'data')
        if (this.haskey(baseInfo, 'data.level') == 1 && !this.haskey(baseInfo, 'data.joyCoin')) {
            await this.algoCurl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=newStartReward&body={"linkId":"${this.linkId}"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=ac8de0507e3bccfcee30434ea6a95ba205f3cd2e&build=${this.build}&screen=320*568&networkType=wifi&d_brand=iPhone&d_model=iPhone8,4&lang=zh_CN&osVersion=12.4.1&partner=&eid=eidI090d81224bscIblmpzYcQDWGoQSX55nkcSG5aB%2BFlo3hvVyC4wn4S871p7pfxUVwUU5MgWGRiYJpcqhLmRZOQHgk0m14nGGUawiNWiHeJ%2BASFN1W`,
                    cookie
                }
            )
        }
        if (this.haskey(baseInfo, 'data.level') == 30) {
            let joyRestart = await this.algoCurl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=joyRestart&body={"linkId":"${this.linkId}"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                    cookie,
                    algo: {
                        'appId': '4abce'
                    }
                }
            )
            console.log(`已经满级了,正在切换场景`)
            await this.algoCurl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=newStartReward&body={"linkId":"${this.linkId}"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=ac8de0507e3bccfcee30434ea6a95ba205f3cd2e&build=${this.build}&screen=320*568&networkType=wifi&d_brand=iPhone&d_model=iPhone8,4&lang=zh_CN&osVersion=12.4.1&partner=&eid=eidI090d81224bscIblmpzYcQDWGoQSX55nkcSG5aB%2BFlo3hvVyC4wn4S871p7pfxUVwUU5MgWGRiYJpcqhLmRZOQHgk0m14nGGUawiNWiHeJ%2BASFN1W`,
                    cookie
                }
            )
            for (let i of Array(2)) {
                baseInfo = await this.algoCurl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=joyBaseInfo&body={"taskId":"","inviteType":"","inviterPin":"","linkId":"${this.linkId}"}&t=1681012535084&appid=activities_platform&client=ios&clientVersion=${this.clientVersion}&cthr=1&uuid=bd573a56457eba54de7a6c0787c1fbb4fde28eb2&build=${this.build}&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidI08a2812293saa9h49%2BwmQbOdWcGqiWsHQ2vYen7SFhReSdDTvgVd9CzRHKrkpiAq6WU2YgJf8TchQcbWEAdBOCTuiYEdV5DxTHW0eO1PylPf2QAx`,
                        cookie,
                        algo: {
                            appId: "4abce"
                        }
                    }
                )
                data = this.haskey(baseInfo, 'data')
                if (data) {
                    break
                }
                else {
                    await this.wait(2000)
                }
            }
        }
        if (this.haskey(data, 'invitePin')) {
            var compact = {
                coin: data.joyCoin,
                buyCoin: data.fastBuyCoin,
                level: data.level,
                buyLevel: data.fastBuyLevel,
                invitePin: data.invitePin,
            }
            if (inviterPin) {
                compact.helpPin = inviterPin
                compact.helpUser = helpUser
            }
            this.dict[p.user] = {...this.dict[p.user], ...compact}
        }
        else {
            this.dict[p.user] = {joy: {}, shop: {}}
            var compact = {joy: {}, shop: {}}
        }
        return compact
    }

    async extra() {
        let code = []
        let dict = this.column(this.code, 'inviterPin', 'user') || {}
        for (let i in dict) {
            code.push({user: i, inviterPin: dict[i]})
        }
        await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_joyPark.json`, this.dumps(this.random(code, code.length)), (error) => {
            if (error) return console.log("写入化失败" + error.message);
            console.log("助力列表写入成功");
        })
    }

    async algoCurl(p) {
        let cookie = p.cookie
        if (p.curl) {
            var s = await this.curl(p)
        }
        else {
            var s = await this.algo.curl(p)
        }
        return s
    }
}

module.exports = Main;
