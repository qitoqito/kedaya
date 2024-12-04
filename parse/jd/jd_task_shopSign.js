const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东店铺连续签到"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 1)} * * *`
        this.task = 'local'
        this.verify = 1
        this.model = 'user'
        this.import = ['jdAlgo', 'fileCache','logBill']
        this.delay = 2000
        this.hint = {
            token: "token1|token2"
        }
    }

    async prepare() {
        this.cache = this.modules["fileCache"]
        await this.cache.connect({file: `${this.dirname}/temp/jd_task_shopSign.json`})
        this.algo = new this.modules.jdAlgo({
            type: "main",
            version: "latest",
            appId: '4da33',
            referer:'https://h5.m.jd.com/'
        })
         this.clientVersion="13.2.8"
        let array = []
        if (this.profile.token) {
            array = this.profile.token.split("|")
        }
        else if (this.custom) {
            array = this.getValue('custom')
        }
        else if (this.expand) {
            let expand = this.getValue('expand')
            array = [...expand, ...array]
        }
        this.plan = {
            expire: [],
            valid: [],
            except: [],
            remain: []
        }
        for (let i of this.unique(array)) {
            if (i.length == 32) {
                try {
                    var ss = await this.cache.get(i) || {}
                    var info = this.jsonParse(ss)
                    if (this.haskey(info, 'continuePrizeRuleList')) {
                        this.shareCode.push(info)
                    }
                    else {
                        console.log("正在获取:", i)
                        var s = await this.algo.curl({
                            url: `https://api.m.jd.com/api?appid=interCenter_shopSign&t=${this.timestamp}&loginType=2&functionId=interact_center_shopSign_getActivityInfo&body={"token":"${i}","venderId":""}`,
                            referer: 'https://h5.m.jd.com/'
                        })
                        if (!this.haskey(s, 'data.id')) {
                            console.log("获取错误:", i)
                        }
                        else {
                            var info = {
                                'activityId': s.data.id,
                                'venderId': s.data.venderId,
                                'token': i,
                                continuePrizeRuleList: s.data.continuePrizeRuleList
                            }
                            let shopInfo = await this.algo.curl({
                                    'url': `https://api.m.jd.com/`,
                                    form: `functionId=whx_getMShopOutlineInfo&body={"venderId":"${s.data.venderId}","originReferer":"shopx","source":"m-shop"}&t=1727955137220&avifSupport=0&webpSupport=0&appid=wx_mini_app&clientVersion=11.0.0&client=wh5&uuid=08635116374331727444274533&loginType=11&area=&fp=c68b3c68639ae2d76f00dfb51e463e08f251bf09&x-api-eid-token=jdd01w4AJW3WEWJIK2JVHDEVNCEUOOF435MZ7XHM5J34FASC5FO6ESP46WE3GVA2M2U4NSY3HURCBUZP4QS7IHYFLNEFH5Z542NGUVUVRAZAVQYD3SBE7MD4ZHPQANBIRQCXUT32`,
                                    referer: 'https://servicewechat.com/wx91d27dbf599dff74/765/page-frame.html'
                                }
                            )
                            if (this.haskey(shopInfo, 'data.shopInfo.shopName')) {
                                info.shopName = shopInfo.data.shopInfo.shopName
                            }
                            await this.cache.set(i, info, (s.data.endTime - this.timestamp) / 1000)
                            await this.wait(1000)
                            this.shareCode.push(info)
                            this.plan.valid.push(i)
                        }
                    }
                } catch (e) {
                    this.plan.expire.push(i)
                }
            }
        }
    }

    async middle(p) {
        this.dict[p.user] = []
    }

    async main(p) {
        let cookie = p.cookie
        let dayDict = []
        if (p.inviter.continuePrizeRuleList) {
            for (let i of p.inviter.continuePrizeRuleList) {
                for (let j of i.prizeList) {
                    if (j.type == 4) {
                        dayDict[i.level] = `签到: ${i.level}天, 可得: ${j.discount}京豆`
                    }
                    else if (j.type == 10) {
                        dayDict[i.level] = `签到: ${i.level}天, 可得: ${j.discount}E卡`
                    }
                    else if (j.type == 14) {
                        dayDict[i.level] = `签到: ${i.level}天, 可得: ${j.discount / 100}红包`
                    }
                }
            }
        }
        let maxDay = this.sum(this.column(p.inviter.continuePrizeRuleList, 'days'))
        let s = await this.algo.curl({
                'url': `http://api.m.jd.com/api?appid=interCenter_shopSign&loginType=2&functionId=interact_center_shopSign_getSignRecord&body={"token":"${p.inviter.token}","venderId":${p.inviter.venderId},"activityId":${p.inviter.activityId},"type":56,"actionType":7}&jsonp=jsonp1004`,
                cookie,

            }
        )

        let days = this.haskey(s, 'data.days')
        if (days>=maxDay) {
            console.log(`签到已满${maxDay}天,跳出签到`, p.inviter.token, `https://shop.m.jd.com/?venderId=${p.inviter.venderId}`)
            this.plan.except.push(p.inviter.token)
        }
        else {
            let h5 = await this.algo.h5st({
                    'url': `https://api.m.jd.com`,form:`appid=interCenter_shopSign&loginType=2&functionId=interact_center_shopSign_signCollectGift&body={"token":"${p.inviter.token}","venderId":${p.inviter.venderId},"activityId":${p.inviter.activityId},"type":56,"actionType":7}`,
                    cookie,
                    algo:{
                        appId:'4da33',
                        version:'latest'
                    },
                    ciphers: "TLS_CHACHA20_POLY1305_SHA256:TLS_AES_256_GCM_SHA384"
                }
            )
            let signIn=await this.curl(h5)

            if (!signIn.success && this.haskey(signIn, 'msg').includes('未登录')) {
                console.log(signIn.msg)
                this.complete.push(p.index)
                return
            }
            if (this.haskey(signIn, 'msg', '当前不存在有效的活动!')) {
                this.plan.expire.push(p.inviter.token)
                let index = this.plan.valid.indexOf(p.inviter.token)
                delete this.plan.valid[index]
            }
            for (let day of Object.keys(dayDict)) {
                if (days<=day) {
                    console.log(p.index, `店铺: ${p.inviter.shopName} Token: ${p.inviter.token},${dayDict[day]}, 已经签到: ${signIn.success ? days + 1 : days}天`)
                    if (signIn.success) {
                        this.dict[p.user].push(`Token: ${p.inviter.token}, ${dayDict[day]}, 已经签到: ${signIn.success ? days + 1 : days}天`)
                    }
                    break
                }
            }
            signIn.success ? console.log(p.index, `签到成功`) : console.log(p.index, signIn.msg || `签到失败或者已经签到`)
        }
    }

    async extra() {
        if (this.plan.expire.length) {
            console.log([...['可能过期Token'], ...this.unique(this.plan.expire), ...['']].join('\n'))
            this.notices([...['可能过期Token'], ...this.unique(this.plan.expire), ...['']].join('\n'), 'message')
        }
        if (this.plan.valid.length) {
            console.log([...['有效Token'], ...this.plan.valid.filter(d => d), ...['']].join('\n'))
            this.notices([...['有效Token'], ...this.plan.valid.filter(d => d), ...['']].join('\n'), 'message')
        }
        if (this.plan.except.length) {
            console.log(this.unique([...['满签Token'], ...this.plan.except, ...['']]).join('\n'))
            this.notices(this.unique([...['满签Token'], ...this.plan.except, ...['']]).join('\n'), 'message')
            if (this.plan.valid.length) {
                let c = this.plan.valid.concat(this.plan.except).filter(v => !this.plan.valid.includes(v) || !this.plan.except.includes(v))
                if (c.length>0) {
                    console.log([...['剩余Token'], ...this.unique(c)].join('\n'))
                    this.notices([...['剩余Token'], ...this.unique(c)].join('\n'), 'message')
                }
            }
        }
        for (let i in this.dict) {
            if (this.dict[i].length) {
                this.notices(this.dict[i].join("\n"), 'message')
                break
            }
        }
    }
}

module.exports = Main;
