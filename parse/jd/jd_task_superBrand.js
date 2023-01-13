const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东特物合集"
        this.cron = "33 10,15,20 * * *"
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
        this.turn = 3
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            appId: "8adfb",
            type: 'lite',
        })
        let sourcesList = ['card', 'sign', 'secondfloor']
        for (let source of sourcesList) {
            switch (source) {
                case "card":
                case "sign":
                    var url = `https://api.m.jd.com/?uuid=7b01d4690ef13716984dcfcf96068f36b41f6c51&client=wh5&appid=ProductZ4Brand&functionId=showSecondFloor${source[0].toUpperCase() + source.substr(1)}Info&t=${this.timestamp}&body={"source":"${source}"}`
                    break
                case "secondfloor":
                    var url = `https://api.m.jd.com/?uuid=7b01d4690ef13716984dcfcf96068f36b41f6c51&client=wh5&appid=ProductZ4Brand&functionId=superBrandSecondFloorMainPage&t=${this.timestamp}&body={"source":"${source}"}`
                    break
            }
            let s = await this.curl({
                    'url': url
                }
            )
            try {
                console.log(source, '获取详情', s.data.success)
                this.dict[source] = s.data.result.activityBaseInfo
                this.dict[source].status = s.data.success
            } catch (ee) {
            }
        }
        if (Object.keys(this.dict).length<1) {
            this.jump = 1
            console.log("没有获取到相关数据,不继续执行")
        }
    }

    async main(p) {
        let cookie = p.cookie
        if (this.turnCount == 1) {
            if (this.code.length<1) {
                console.log("没有可以助力的")
                return
            }
            for (let i of this.code) {
                try {
                    if (i.times<i.limit) {
                        let s = await this.curl({
                                'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=1635845724890&body={"source":"${i.source}","activityId":${i.activityId},"encryptProjectId":"${i.encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":2,"itemId":"${i.itemId}","actionType":0}`,
                                // 'form':``,
                                cookie
                            }
                        )
                        if (this.haskey(s, 'data.bizCode', '0')) {
                            i.times++
                        }
                        console.log("正在助力:", i.user, i.source, this.haskey(s, 'data.bizMsg'), i.times)
                    }
                    else {
                        console.log("不用再助力了:", i.user)
                    }
                } catch (e) {
                }
            }
        }
        else {
            if (this.turnCount == 2) {
                if (!this.cookies.help.includes(cookie)) {
                    console.log("不是被助力账号,此次将跳过运行")
                    return
                }
            }
            for (let source in this.dict) {
                try {
                    switch (source) {
                        case "card":
                            if (this.dict[source].status) {
                                await this.card(p, source)
                            }
                            break
                        case "sign":
                            if (this.dict[`${source}`].status) {
                                await this.sign(p, source)
                            }
                            break
                        case "secondfloor":
                            if (this.dict[`${source}`].status) {
                                await this.secondfloor(p, source)
                            }
                            break
                    }
                } catch (e) {
                }
            }
        }
    }

    async card(p, source) {
        let cookie = p.cookie;
        console.log(p.user, `开始: ${source}`)
        let l = await this.curl({
                'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskList&t=1635835060813&body={"source":"${source}","activityId":${this.dict[source].activityId},"assistInfoFlag":1}`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(l, 'data.bizMsg', '风控')) {
            console.log("风控用户")
            return
        }
        let boxNum = 0
        for (let i of this.haskey(l, 'data.result.taskList') || []) {
            boxNum = this.haskey(i, 'ext.cardAssistBoxRest') || boxNum
            if (i.assignmentName.includes('邀请') && i.assignmentTimesLimit != i.completionCnt) {
                if (this.cookies.help.includes(cookie)) {
                    let shareCode = {
                        source,
                        "encryptAssignmentId": i.encryptAssignmentId,
                        "itemId": i.ext.assistTaskDetail.itemId,
                        user: p.user,
                        "encryptProjectId": this.dict[source].encryptProjectId,
                        "activityId": this.dict[source].activityId,
                        times: i.completionCnt,
                        limit: i.assignmentTimesLimit
                    }
                    this.code.push(shareCode)
                    console.log("助力Code:", shareCode)
                }
            }
            else if (!i.completionFlag) {
                try {
                    console.log(p.user, `任务开始: ${i.assignmentName}`)
                    if (i.assignmentName.includes('下拉')) {
                        for (let kk of i.rewards) {
                            let ss = await this.curl({
                                    'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"encryptProjectId":"${this.dict[source].encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"itemId":"${kk.itemId}","actionType":0,"dropDownChannel":1}`,
                                    cookie
                                }
                            )
                            for (let r of this.haskey(ss, 'data.result.rewards')) {
                                if (r.awardName == '京豆') {
                                    console.log(p.user, `${r.desc}获得${r.beanNum}京豆`)
                                    this.notices(`${r.desc}获得${r.beanNum}京豆`, p.user)
                                }
                            }
                            console.log(p.user, ss.data.bizMsg);
                        }
                        console.log(p.user, `任务完成: ${i.assignmentName}`)
                    }
                    else if (i.assignmentName.includes('开卡') || i.assignmentName.includes('开通品牌会员')) {
                        console.log(p.user, `开卡任务`)
                        let vos = i.ext.brandMemberList
                        let dotime = i.assignmentTimesLimit - i.completionCnt
                        for (let t = 0; t<dotime; t++) {
                            console.log(p.user, i.assignmentName, "第", t + 1, "次")
                            let venderId = vos[t].vendorIds
                            if (this.profile.openCard) {
                                console.log(p.user, `开卡中${venderId}`)
                                for (let kk of Array(3)) {
                                    var o = await this.algo.curl({
                                            'url': `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"${venderId}","bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0,"channel":8018802}&clientVersion=9.2.0&client=H5&uuid=88888`,
                                            cookie
                                        }
                                    )
                                    if (o.success) {
                                        break
                                    }
                                }
                                console.log(p.user, `开卡中${venderId}`, o.message)
                                await this.wait(2000)
                            }
                            else {
                                console.log(p.user, `不开卡，尝试领取`)
                            }
                            let ss = await this.curl({
                                    'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"completionFlag":1,"encryptProjectId":"${this.dict[source].encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"actionType":0,"itemId":${vos[t].itemId}}`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            if (this.haskey(ss, 'data.result.rewards')) {
                                console.log(p.user, ss.data.result.rewards);
                                for (let r of ss.data.result.rewards) {
                                    if (r.awardName == '京豆') {
                                        console.log(p.user, `${r.desc}获得${r.beanNum}京豆`)
                                        this.notices(`${r.desc}获得${r.beanNum}京豆`, p.user)
                                    }
                                    if (r.awardType == 10000) {
                                        console.log(p.user, `已获得卡片，跳出`)
                                        break
                                    }
                                }
                            }
                            console.log(p.user, ss.data.bizMsg);
                            await this.wait(5000)
                        }
                        console.log(p.user, `任务完成: ${i.assignmentName}`)
                    }
                    else if (i.ext && this.dumps(i.ext) != '{}' && !i.assignmentName.includes('邀请') && !i.assignmentName.includes('开卡')) {
                        let vos = i.ext.sign2 || i.ext.followShop || i.ext.brandMemberList || i.ext.shoppingActivity
                        let dotime = i.assignmentTimesLimit - i.completionCnt
                        for (let t = 0; t<dotime; t++) {
                            console.log(p.user, i.assignmentName, "第", t + 1, "次")
                            let ss = await this.curl({
                                    'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"completionFlag":1,"encryptProjectId":"${this.dict[source].encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"actionType":0,"itemId":${vos[t].itemId}}`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            if (this.haskey(ss, 'data.result.rewards')) {
                                console.log(p.user, ss.data.result.rewards);
                                for (let r of ss.data.result.rewards) {
                                    if (r.awardName == '京豆') {
                                        console.log(p.user, `${r.desc}获得${r.beanNum}京豆`)
                                        this.notices(`${r.desc}获得${r.beanNum}京豆`, p.user)
                                    }
                                }
                            }
                            console.log(p.user, ss.data.bizMsg);
                            await this.wait(2000)
                        }
                        console.log(p.user, `任务完成: ${i.assignmentName}`)
                    }
                    else {
                        console.log(p.user, `跳过: ${i.assignmentName}`)
                    }
                } catch (e) {
                    console.log("err", e)
                }
            }
            else {
                console.log(p.user, `任务已完成: ${i.assignmentName}`)
            }
        }
        let s = await this.curl({
                'url': `https://api.m.jd.com/?uuid=7b01d4690ef13716984dcfcf96068f36b41f6c51&client=wh5&appid=ProductZ4Brand&functionId=showSecondFloorCardInfo&t=${this.timestamp}&body={"source":"${source}"}`,
                // 'form':``,
                cookie
            }
        )
        let info = this.haskey(s, 'data.result.activityCardInfo') || {}
        let divideTimeStatus = info.divideTimeStatus
        let divideStatus = info.divideStatus
        let cardStatus = info.cardStatus
        if (info && cardStatus) {
            if (!divideStatus) {
                let ss = await this.curl({
                        'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskLottery&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"encryptProjectId":"${this.dict[source].encryptProjectId}","tag":"divide"}`,
                        // 'form':``,
                        cookie
                    }
                )
                for (let r of this.haskey(ss, 'data.result.rewards')) {
                    if (r.awardName == '京豆') {
                        this.print(`${r.desc}获得${r.beanNum}京豆`, p.user)
                    }
                }
            }
            else {
                console.log(p.user, "已瓜分过了")
            }
        }
        else {
            console.log(p.user, "未到瓜分时间或者卡片未集齐")
        }
        let baseInfo = this.haskey(s, 'data.result.activityBaseInfo')
        if (baseInfo && boxNum) {
            console.log(p.user, "助力抽奖")
            for (let _ of Array(boxNum)) {
                let ss = await this.curl({
                        'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskLottery&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"encryptProjectId":"${baseInfo.encryptProjectId}"}`,
                        // 'form':``,
                        cookie
                    }
                )
                for (let r of ss.data.result.rewards) {
                    if (r.awardName == '京豆') {
                        console.log(p.user, `${r.desc}获得${r.beanNum}京豆`)
                        this.notices(`${r.desc}获得${r.beanNum}京豆`, p.user)
                    }
                }
            }
        }
        console.log(p.user, `完成: ${source}`)
    }

    async sign(p, source) {
        console.log(p.user, `开始: ${source}`)
        let cookie = p.cookie;
        let l = await this.curl({
                'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskList&t=1635835060813&body={"source":"${source}","activityId":${this.dict[source].activityId},"assistInfoFlag":1}`,
                // 'form':``,
                cookie
            }
        )
        // console.log(p.user,l);
        for (let i of this.haskey(l, 'data.result.taskList') || []) {
            // console.log(p.user,i);
            if (i.assignmentName.includes('邀请') && i.assignmentTimesLimit != i.completionCnt) {
                if (this.cookies.help.includes(cookie)) {
                    let shareCode = {
                        source,
                        "encryptAssignmentId": i.encryptAssignmentId,
                        "itemId": i.ext.assistTaskDetail.itemId,
                        user: p.user,
                        "encryptProjectId": this.dict[source].encryptProjectId,
                        "activityId": this.dict[source].activityId,
                        times: i.completionCnt,
                        limit: i.assignmentTimesLimit
                    }
                    this.code.push(shareCode)
                    console.log("助力Code:", shareCode)
                }
            }
            else if (i.assignmentType == 5) {
                console.log(p.user, `任务开始: ${i.assignmentName}`)
                if (!i.completionCnt) {
                    let ss = await this.curl({
                            'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"encryptProjectId":"${this.dict[source].encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"itemId":"${i.ext.sign1.itemId}","actionType":0}`,
                            cookie
                        }
                    )
                    if (this.haskey(ss, 'data.result.rewards')) {
                        console.log(p.user, ss.data.result.rewards);
                        for (let r of ss.data.result.rewards) {
                            if (r.quantity) {
                                console.log(p.user, `获得${r.quantity}积分`)
                            }
                        }
                    }
                    console.log(p.user, ss.data.bizMsg);
                }
                console.log(p.user, `任务完成: ${i.assignmentName}`)
            }
        }
        let s = await this.curl({
                'url': `https://api.m.jd.com/?uuid=7b01d4690ef13716984dcfcf96068f36b41f6c51&client=wh5&appid=ProductZ4Brand&functionId=showSecondFloorSignInfo&t=${this.timestamp}&body={"source":"${source}"}`,
                // 'form':``,
                cookie
            }
        )
        let activityUserInfo = s.data.result.activityUserInfo
        console.log(p.user, '当前积分：', activityUserInfo.userStarNum)
        console.log(p.user, `完成: ${source}`)
    }

    async secondfloor(p, source) {
        console.log(p.user, `开始: ${source}`)
        let cookie = p.cookie;
        let l = await this.curl({
                'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskList&t=1635835060813&body={"source":"${source}","activityId":${this.dict[source].activityId},"assistInfoFlag":1}`,
                // 'form':``,
                cookie
            }
        )
        for (let i of this.haskey(l, 'data.result.taskList') || []) {
            if (i.assignmentName.includes('邀请') && i.assignmentTimesLimit != i.completionCnt) {
                if (this.cookies.help.includes(cookie)) {
                    let shareCode = {
                        source,
                        "encryptAssignmentId": i.encryptAssignmentId,
                        "itemId": i.ext.assistTaskDetail.itemId,
                        user: p.user,
                        "encryptProjectId": this.dict[source].encryptProjectId,
                        "activityId": this.dict[source].activityId,
                        times: i.completionCnt,
                        limit: i.assignmentTimesLimit
                    }
                    this.code.push(shareCode)
                    console.log("助力Code:", shareCode)
                }
            }
            else if (!i.completionFlag) {
                try {
                    console.log(p.user, `任务开始: ${i.assignmentName}`)
                    if (i.assignmentName.includes('下拉')) {
                        for (let kk of i.rewards) {
                            let ss = await this.curl({
                                    'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"encryptProjectId":"${this.dict[source].encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"itemId":"${kk.itemId}","actionType":0,"dropDownChannel":1}`,
                                    cookie
                                }
                            )
                            console.log(p.user, ss.data.result.rewards);
                            for (let r of ss.data.result.rewards) {
                                if (r.awardName == '京豆') {
                                    console.log(p.user, `${r.desc}获得${r.beanNum}京豆`)
                                    this.notices(`${r.desc}获得${r.beanNum}京豆`, p.user)
                                }
                            }
                            console.log(p.user, ss.data.bizMsg);
                        }
                        console.log(p.user, `任务完成: ${i.assignmentName}`)
                    }
                    else if (i.assignmentName.includes('开卡') || i.assignmentName.includes('开通品牌会员')) {
                        console.log(p.user, `开卡任务`)
                        let vos = i.ext.brandMemberList
                        let dotime = i.assignmentTimesLimit - i.completionCnt
                        for (let t = 0; t<dotime; t++) {
                            console.log(p.user, i.assignmentName, "第", t + 1, "次")
                            let venderId = vos[t].vendorIds
                            if (this.profile.openCard) {
                                console.log(p.user, `开卡中${venderId}`)
                                for (let kk of Array(3)) {
                                    var o = await this.algo.curl({
                                            'url': `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"${venderId}","bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0,"channel":8018802}&clientVersion=9.2.0&client=H5&uuid=88888`,
                                            cookie
                                        }
                                    )
                                    if (o.success) {
                                        break
                                    }
                                }
                                console.log(p.user, `开卡中${venderId}`, o.message)
                                await this.wait(2000)
                            }
                            else {
                                console.log(p.user, `不开卡，尝试领取`)
                            }
                            let ss = await this.curl({
                                    'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"completionFlag":1,"encryptProjectId":"${this.dict[source].encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"actionType":0,"itemId":${vos[t].itemId}}`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            if (this.haskey(ss, 'data.result.rewards')) {
                                console.log(p.user, ss.data.result.rewards);
                                for (let r of ss.data.result.rewards) {
                                    if (r.awardName == '京豆') {
                                        console.log(p.user, `${r.desc}获得${r.beanNum}京豆`)
                                        this.notices(`${r.desc}获得${r.beanNum}京豆`, p.user)
                                    }
                                    if (r.awardType == 10000) {
                                        console.log(p.user, `已获得卡片，跳出`)
                                        break
                                    }
                                }
                            }
                            console.log(p.user, ss.data.bizMsg);
                            await this.wait(5000)
                        }
                        console.log(p.user, `任务完成: ${i.assignmentName}`)
                    }
                    else if (i.assignmentName.includes('分享海报')) {
                        let ss = await this.curl({
                                'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"completionFlag":1,"encryptProjectId":"${this.dict[source].encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"actionType":0,"itemId":""}`,
                                // 'form':``,
                                cookie
                            }
                        )
                        if (this.haskey(ss, 'data.result.rewards')) {
                            console.log(p.user, ss.data.result.rewards);
                            for (let r of ss.data.result.rewards) {
                                if (r.awardName == '京豆') {
                                    console.log(p.user, `${r.desc}获得${r.beanNum}京豆`)
                                    this.notices(`${r.desc}获得${r.beanNum}京豆`, p.user)
                                }
                            }
                        }
                        console.log(p.user, ss.data.bizMsg);
                        console.log(p.user, `任务完成: ${i.assignmentName}`)
                    }
                    else if (i.ext && this.dumps(i.ext) != '{}' && !i.assignmentName.includes('邀请') && !i.assignmentName.includes('开卡') && !i.assignmentName.includes('开通品牌会员')) {
                        let vos = i.ext.sign2 || i.ext.followShop || i.ext.brandMemberList || i.ext.shoppingActivity
                        let dotime = i.assignmentTimesLimit - i.completionCnt
                        for (let t = 0; t<dotime; t++) {
                            console.log(p.user, i.assignmentName, "第", t + 1, "次")
                            let ss = await this.curl({
                                    'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"completionFlag":1,"encryptProjectId":"${this.dict[source].encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"actionType":0,"itemId":${vos[t].itemId}}`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            if (this.haskey(ss, 'data.result.rewards')) {
                                console.log(p.user, ss.data.result.rewards);
                                for (let r of ss.data.result.rewards) {
                                    if (r.awardName == '京豆') {
                                        console.log(p.user, `${r.desc}获得${r.beanNum}京豆`)
                                        this.notices(`${r.desc}获得${r.beanNum}京豆`, p.user)
                                    }
                                }
                            }
                            console.log(p.user, ss.data.bizMsg);
                            await this.wait(2000)
                        }
                        console.log(p.user, `任务完成: ${i.assignmentName}`)
                    }
                    else {
                        console.log(p.user, `跳过: ${i.assignmentName}`)
                    }
                } catch (e) {
                    console.log("err", e)
                }
            }
            else {
                console.log(p.user, `任务已完成: ${i.assignmentName}`)
            }
        }
        let s = await this.curl({
                'url': `https://api.m.jd.com/?uuid=7b01d4690ef13716984dcfcf96068f36b41f6c51&client=wh5&appid=ProductZ4Brand&functionId=superBrandSecondFloorMainPage&t=${this.timestamp}&body={"source":"${source}"}`,
                // 'form':``,
                cookie
            }
        )
        let userStarNum = this.haskey(s, 'data.result.activityUserInfo.userStarNum')
        if (userStarNum>0) {
            for (let i = 1; i<(userStarNum + 1); i++) {
                console.log(p.user, `第${i}次抽奖`)
                let ss = await this.curl({
                        'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskLottery&t=${this.timestamp}&body={"source":"${source}","activityId":${this.dict[source].activityId},"encryptProjectId":"${this.dict[source].encryptProjectId}","tag":"divide"}`,
                        // 'form':``,
                        cookie
                    }
                )
                try {
                    for (let r of ss.data.result.rewards) {
                        if (r.awardName == '京豆') {
                            console.log(p.user, `${r.desc}获得${r.beanNum}京豆`)
                            this.notices(`${r.desc}获得${r.beanNum}京豆`, p.user)
                        }
                    }
                } catch (e) {
                }
                await this.wait(1000)
            }
        }
        else {
            console.log(p.user, "无抽奖机会")
        }
        console.log(p.user, `完成: ${source}`)
    }
}

module.exports = Main;
