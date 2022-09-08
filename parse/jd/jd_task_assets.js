const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东资产汇总"
        this.cron = "30 8,22 * * *"
        this.task = 'local'
        this.import = ['crypto-js']
        // this.thread = 6
    }

    async middle(p) {
        this.dict[p.user] = {}
    }

    async main(p) {
        await this.getScore(p)
        await this.getRedpacket(p)
        await this.getJingtie(p)
        await this.getBean(p)
        await this.getXibean(p)
        await this.getCash(p)
        await this.getMs(p)
        await this.getEarn(p)
        await this.getCoin(p)
        await this.getEgg(p)
        // await this.getCattle(p)
        await this.getPet(p)
        await this.getFarm(p)
        let t = []
        for (let i in this.dict[p.user]) {
            let data = this.dict[p.user][i]
            switch (i) {
                case 'score':
                    t.push(`🐵 有京享值: ${data || 0}分`)
                    break
                case 'jingtie':
                    t.push(`🦁 账户京贴: ${data || 0}元`)
                    break
                case 'redpacket':
             t.push(`🦊 当前红包: ${data.all}元`)
                    t.push(`🦊 即将到期: ${data.expire}元`)
                    t.push(`🦊 还未生效: ${data.disable}元`)
                    t.push(`🦊 通用红包: ${data.current[0]}元, 过期: ${data.current[1]}元`)
                    t.push(`🦊 商城红包: ${data.app[0]}元, 过期: ${data.app[1]}元`)
                    t.push(`🦊 京喜红包: ${data.pingou[0]}元, 过期: ${data.pingou[1]}元`)
                    t.push(`🦊 极速红包: ${data.lite[0]}元, 过期: ${data.lite[1]}元`)
                    t.push(`🦊 京微红包: ${data.wechat[0]}元, 过期: ${data.wechat[1]}元`)
                    t.push(`🦊 健康红包: ${data.healthy[0]}元, 过期: ${data.healthy[1]}元`)
                    break
                case 'bean':
                    t.push(`🐶 当前京豆: ${data.all}京豆`)
                    t.push(`🐶 今日收入: ${data.today[0]}京豆, 支出: ${data.today[1]}京豆`)
                    t.push(`🐶 昨天收入: ${data.yesterday[0]}京豆, 支出: ${data.yesterday[1]}京豆`)
                    if (data.expire) {
                        for (let i of data.expire.reverse()) {
                            t.push(`🙊 即将过期: ${i.eventMassage} ${i.amount}京豆`)
                        }
                    }
                    break
                case 'xibean':
                    t.push(`🐻 当前喜豆: ${data || 0}喜豆`)
                    break
                case'cash':
                    t.push(`🐰 换领现金: 可兑换${data || 0}元`)
                    break
                case 'ms':
                    t.push(`🦁 换秒秒币: 可兑换${(data / 1000).toFixed(2)}元`)
                    break
                case 'earn':
                    t.push(`🐹 京东赚赚: 可兑换${(data / 10000).toFixed(2)}元`)
                    break
                case 'coin':
                    t.push(`🐯 极速金币: 可兑换${(data / 10000).toFixed(2)}元`)
                    break
                case 'cattle':
                    t.push(`🐮 牛牛福利: 可兑换${(data / 1000).toFixed(2)}元`)
                    break
                case 'egg':
                    t.push(`🐥 京喜牧场: 可兑换鸡蛋${data || 0}个`)
                    break
                case 'pet':
                    t.push(`🐙 东东萌宠: ${data.goods}, 完成: ${data.complete}-${data.percent}%/${data.exchange}`)
                    break
                case 'farm':
                    t.push(`🐨 东东农场: ${data.goods}, 完成: ${data.complete}/${data.exchange}, 还需浇水: ${(data.exchange - data.complete) / 10}次, 进度: ${data.percent}%`)
                    break
                default:
                    console.log(i)
                    break
            }
        }
        t.push('=============================================')
        console.log([...[`🐽 当前用户: ${p.user}`], ...t].join("\n"))
        this.dict[p.user].echo = [...[`🐽 京东资产`], ...t].join("\n")
    }

    async getFarm(p) {
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=initForFarm`,
                'form': `body={"version":11,"channel":3}&client=apple&clientVersion=10.0.4&osVersion=13.7&appid=wh5&loginType=2&loginWQBiz=interact`,
                cookie: p.cookie
            }
        )
        try {
            let goods = s.farmUserPro.name
            let exchange = s.farmUserPro.treeTotalEnergy
            let complete = s.farmUserPro.treeEnergy
            let percent = (complete / exchange * 100).toFixed(2)
            this.dict[p.user].farm = {
                exchange, complete, percent, goods
            }
        } catch (e) {
        }
    }

    async getScore(p) {
        let s = await this.curl({
                'url': `https://kai.jd.com/client?appId=applet_jpass&body=%257B%257D&functionId=UserExportService.getUserInfo&requestId=0.72076678870461081641259143802&sign=431fa578b3a6c82c50b37ed7e6406973&_s=2&_i=55`,
                cookie: p.cookie
            }
        )
        this.dict[p.user].score = this.haskey(s, 'data.data.score')
    }

    async getPet(p) {
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=initPetTown&body={"version":1}&appid=wh5&client=apple&clientVersion=10.3.0&build=167903&rfs=0000`,
                cookie: p.cookie
            }
        )
        try {
            let exchange = s.result.goodsInfo.exchangeMedalNum
            let complete = s.result.medalNum
            let percent = s.result.medalPercent
            let goods = s.result.goodsInfo.goodsName
            this.dict[p.user].pet = {
                exchange, complete, percent, goods
            }
        } catch (e) {
        }
    }

    async getCattle(p) {
        let s = await this.curl({
                'url': `https://m.jingxi.com/pgcenter/sign/UserSignNew?sceneval=2&source=&_stk=sceneval%2Csource&_ste=1&h5st=20211230215423499%3B5920835803695163%3B10012%3Btk01wa5851bd218ncp3z9sjXBSTjHt3rP0%2FamIoUtG7pyh%2F6YcCSs5ByrZVM9Z74o9h6ldFQp6Kf4Zg8yGLu%2BuGxE5uM%3B31e3a988d533781a2aecb8530cc31aee9db9a77fe07f0abe4a7c7a978719666d&sceneval=2&g_login_type=1&g_ty=ajax`,
                // 'form':``,
                cookie: p.cookie
            }
        )
        this.dict[p.user].cattle = this.haskey(s, 'data.pgAmountTotal')
    }

    async getEgg(p) {
        let s = await this.curl({
                'url': `https://m.jingxi.com/jxmc/queryservice/GetHomePageInfo?channel=6&sceneid=1001&activeid=null&activekey=null&isgift=1&isquerypicksite=1&isqueryinviteicon=1&isregionflag=0&_stk=activeid%2Cactivekey%2Cchannel%2Cisgift%2Cisqueryinviteicon%2Cisquerypicksite%2Cisregionflag%2Csceneid&_ste=1&_=1640871954955&sceneval=2&g_login_type=1&callback=jsonpCBKB&g_tk=1355537280&g_ty=ls`,
                // 'form':``,
                cookie: p.cookie
            }
        )
        this.dict[p.user].egg = this.haskey(s, 'data.eggcnt')
    }

    async getCoin(p) {
        let params = {
            functionId: 'MyAssetsService.execute',
            body: '{"method":"userCoinRecord","data":{"channel":1,"pageNum":1,"pageSize":20}}',
            appid: 'lite-android',
            client: 'apple',
            uuid: this.uuid(32),
            clientVersion: '8.3.6',
            t: this.timestamp
        }
        let m = Object.keys(params).sort().map(d => params[d]).join("&")
        params.sign = this.modules['crypto-js'].HmacSHA256(m, '12aea658f76e453faf803d15c40a72e0').toString()
        let s = await this.curl({
                url: 'https://api.m.jd.com/api',
                form: params,
                cookie: p.cookie
            }
        )
        this.dict[p.user].coin = this.haskey(s, 'data.goldBalance')
    }

    async getXibean(p) {
        let s = await this.curl({
                'url': `https://m.jingxi.com/activeapi/querybeanamount?_=1640870474493&sceneval=2&g_login_type=1&callback=jsonpCBKA&g_ty=ls`,
                // 'form':``,
                cookie: p.cookie
            }
        )
        this.dict[p.user].xibean = this.haskey(s, 'data.xibean')
    }

    async getEarn(p) {
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=interactTaskIndex&body=%7B%22mpVersion%22%3A%223.4.0%22%7D&appid=wh5&loginType=2&loginWQBiz=interact&g_ty=ls&g_tk=236619512`,
                // 'form':``,
                cookie: p.cookie
            }
        )
        this.dict[p.user].earn = this.haskey(s, 'data.totalNum')
    }

    async getJingtie(p) {
        let s = await this.curl({
                url: 'https://api.m.jd.com/client.action',
                form: 'functionId=getSecondWalletInfo&body=%7B%22newVersionType%22%3A%221%22%7D&uuid=3f8c65e9ff4630fd8d875d&client=apple&clientVersion=10.0.10&st=1643268844042&sv=121&sign=5d02a481067133e6ae075c0ac375ba32',
                cookie: p.cookie
            }
        )
        try {
            for (let i of s.floors) {
                for (let j of i.data.nodes) {
                    if (j.functionId == 'jingtie') {
                        this.dict[p.user].jingtie = j.subtitle.value.replace("￥", '')
                        break
                    }
                }
            }
        } catch (e) {
        }
    }

    async getRedpacket(p) {
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=myhongbao_getUsableHongBaoList`,
                'form': 'functionId=myhongbao_getUsableHongBaoList&body=%7B%22fp%22%3A%22-1%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22country%22%3A%22cn%22%2C%22openId%22%3A%22-1%22%2C%22childActivityId%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22platformId%22%3A%22appHongBao%22%2C%22isRvc%22%3A%22-1%22%2C%22orgType%22%3A%222%22%2C%22activityType%22%3A%221%22%2C%22shshshfpb%22%3A%22-1%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22organization%22%3A%22JD%22%2C%22pageClickKey%22%3A%22-1%22%2C%22platform%22%3A%221%22%2C%22eid%22%3A%22-1%22%2C%22appId%22%3A%22appHongBao%22%2C%22childActiveName%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%7D&uuid=487f7b22f68312d2c1bbc93b1aea44&client=apple&clientVersion=10.0.10&st=1652335589917&sv=111&sign=e47eb0c72c2a8107c714daf91cb89a65',
                cookie: p.cookie
            }
        )
        let end = Math.round(new Date(new Date().setHours(23, 59, 59)).getTime() / 1000) + 1
        let r = {
            current: [],
            app: [],
            lite: [],
            pingou: [],
            healthy: [],
            wechat: [],
        }
        let dict = {
            current: [0],
            currentExpire: [0],
            app: [0],
            pingou: [0],
            lite: [0],
            healthy: [0],
            wechat: [0],
            appExpire: [0],
            pingouExpire: [0],
            liteExpire: [0],
            healthyExpire: [0],
            wechatExpire: [0],
            all: [0],
            expire: [0],
            disable: [0],
        }
        try {
            for (let i of this.haskey(s, 'hongBaoList')) {
                dict.all.push(i.balance)
                let expire = end>i.endTime / 1000
                let disable = end - 2>i.beginTime / 1000
                let orgLimitStr = i.orgLimitStr
                if (disable) {
                    if (orgLimitStr.includes("商城")) {
                        dict.app.push(i.balance)
                        if (expire) {
                            dict.appExpire.push(i.balance)
                            dict.expire.push(i.balance)
                        }
                    }
                    else if (orgLimitStr.includes("京喜")) {
                        dict.pingou.push(i.balance)
                        if (expire) {
                            dict.pingouExpire.push(i.balance)
                            dict.expire.push(i.balance)
                        }
                    }
                    else if (orgLimitStr.includes("健康")) {
                        dict.healthy.push(i.balance)
                        if (expire) {
                            dict.healthyExpire.push(i.balance)
                            dict.expire.push(i.balance)
                        }
                    }
                    else if (orgLimitStr.includes("极速") || orgLimitStr.includes("特价")) {
                        dict.lite.push(i.balance)
                        if (expire) {
                            dict.liteExpire.push(i.balance)
                            dict.expire.push(i.balance)
                        }
                    }
                    else if (orgLimitStr.includes("小程序")) {
                        dict.wechat.push(i.balance)
                        if (expire) {
                            dict.wechatExpire.push(i.balance)
                            dict.expire.push(i.balance)
                        }
                    }
                    else {
                        dict.current.push(i.balance)
                        if (expire) {
                            dict.currentExpire.push(i.balance)
                            dict.expire.push(i.balance)
                        }
                    }
                }
                else {
                    dict.disable.push(i.balance)
                }
            }
        } catch (e) {
        }
        for (let i in r) {
            r[i] = [this.sum(dict[i], 2), this.sum(dict[`${i}Expire`], 2)].map(d => d == '0.00' ? 0 : d)
        }
        r.all = this.sum(dict.all, 2)
        r.expire = this.sum(dict.expire, 2)
        r.disable = this.sum(dict.disable, 2)
        this.dict[p.user].redpacket = r
    }

    async getRedpacket2(p) {
        let end = Math.round(new Date(new Date().setHours(23, 59, 59)).getTime() / 1000) + 1
        let s = await this.curl({
                'url': `https://m.jingxi.com/user/info/QueryUserRedEnvelopesV2?type=1&orgFlag=JD_PinGou_New&page=1&cashRedType=1&redBalanceFlag=1&channel=1&_=1640866930803&sceneval=2&g_login_type=1&callback=jsonpCBKA&g_ty=ls`,
                // 'form':``,
                cookie: p.cookie
            }
        )
        let r = {}
        try {
            r.all = this.haskey(s, 'data.balance')
            r.expire = this.haskey(s, 'data.expiredBalance')
            let current = [], app = [], pingou = [], lite = [], healthy = [], currentExpire = [], appExpire = [],
                pingouExpire = [], liteExpire = [], healthyExpire = []
            for (let i of this.haskey(s, 'data.useRedInfo.redList') || []) {
                // console.log(i)
                if (i.limitStr.includes('京喜')) {
                    pingou.push(i.balance)
                    if (end>i.endTime) {
                        pingouExpire.push(i.balance)
                    }
                }
                else if (i.limitStr.includes('商城')) {
                    app.push(i.balance)
                    if (end>i.endTime) {
                        appExpire.push(i.balance)
                    }
                }
                else if (i.limitStr.includes('极速')) {
                    lite.push(i.balance)
                    if (end>i.endTime) {
                        liteExpire.push(i.balance)
                    }
                }
                else if (i.limitStr.includes('健康')) {
                    healthy.push(i.balance)
                    if (end>i.endTime) {
                        healthyExpire.push(i.balance)
                    }
                }
                else {
                    current.push(i.balance)
                    if (end>i.endTime) {
                        currentExpire.push(i.balance)
                    }
                }
            }
            r.current = [current.length ? this.sum(current).toFixed(2) : 0, currentExpire.length ? this.sum(currentExpire).toFixed(2) : 0]
            r.app = [app.length ? this.sum(app).toFixed(2) : 0, appExpire.length ? this.sum(appExpire).toFixed(2) : 0]
            r.lite = [lite.length ? this.sum(lite).toFixed(2) : 0, liteExpire.length ? this.sum(liteExpire).toFixed(2) : 0]
            r.pingou = [pingou.length ? this.sum(pingou).toFixed(2) : 0, pingouExpire.length ? this.sum(pingouExpire).toFixed(2) : 0]
            r.healthy = [healthy.length ? this.sum(healthy).toFixed(2) : 0, healthyExpire.length ? this.sum(healthyExpire).toFixed(2) : 0]
        } catch (e) {
            console.log(e)
        }
        console.log(r)
        this.dict[p.user].redpacket = r
    }

    async getMs(p) {
        let s = await this.curl({
                url: 'https://api.m.jd.com/client.action',
                form: 'functionId=homePageV2&body=%7B%7D&uuid=41eba7a879f43e8922d&client=apple&clientVersion=10.0.10&st=1640864851292&sv=111&sign=26b1663eda1018aa4412a31160aaa57a&appid=SecKill2020',
                cookie: p.cookie
            }
        )
        this.dict[p.user]['ms'] = this.haskey(s, 'result.assignment.assignmentPoints')
    }

    async getCash(p) {
        let s = await this.curl({
                url: 'https://api.m.jd.com/client.action',
                form: 'functionId=cash_homePage&body=%7B%7D&uuid=72020c16f5774839249c65fb&client=apple&clientVersion=10.0.10&st=1640864548340&sv=121&sign=856e79e5a1ccd46a50fc9089b34a93ba',
                cookie: p.cookie
            }
        )
        this.dict[p.user]['cash'] = this.haskey(s, 'data.result.totalMoney')
    }

    async getBean(p) {
        let b = await this.curl({
            url: 'https://api.m.jd.com/client.action',
            form: 'functionId=jingBeanDetail&body=%7B%7D&uuid=bbf7dd32710a04388eec3dd&client=apple&clientVersion=10.0.10&st=1640919377235&sv=112&sign=8ddd454db0ddfa76947dab4c35cc07fb',
            cookie: p.cookie
        })
        try {
            let x = this.getDate(this.timestamp, 0, '-')
            let y = this.getDate(this.timestamp, -1, '-')
            let r = new RegExp(`${x}|${y}`)
            let xs = []
            let ys = []
            for (let i = 1; i<50; i++) {
                let params = {
                    "url": `https://api.m.jd.com/client.action?functionId=getJingBeanBalanceDetail`,
                    "form": `body=${escape(JSON.stringify({"pageSize": "20", "page": i.toString()}))}&appid=ld`,
                    'cookie': p.cookie
                }
                let s = await this.curl(params)
                if (!this.match(r, JSON.stringify(s))) {
                    break
                }
                for (let k of s.detailList) {
                    if (k.date.includes(x)) {
                        xs.push(k.amount)
                    }
                    else if (k.date.includes(y)) {
                        ys.push(k.amount)
                    }
                }
            }
            let xsa = xs.filter(d => d>0)
            let xsb = xs.filter(d => d<0)
            let ysa = ys.filter(d => d>0)
            let ysb = ys.filter(d => d<0)
            let bean = {}
            bean.today = [this.sum(xsa) || 0, this.sum(xsb) || 0]
            bean.yesterday = [this.sum(ysa) || 0, this.sum(ysb) || 0]
            bean.expire = this.haskey(b, 'others.jingBeanExpiringInfo.detailList')
            bean.all = this.haskey(b, 'others.jingBeanBalance.jingBeanCount')
            this.dict[p.user].bean = bean
        } catch (e) {
        }
    }

    async extra() {
        for (let cookie of this.cookies[this.task]) {
            let user = decodeURIComponent(this.userName(cookie))
            await this.notices(this.dict[user].echo, user, 6)
            // await this.wait(50)
        }
    }
}

module.exports = Main;
