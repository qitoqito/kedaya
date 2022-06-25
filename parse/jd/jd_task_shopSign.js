const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东店铺连续签到"
        this.cron = "33 0,15 * * *"
        this.task = 'local'
        this.verify = 1
        this.model = 'user'
        this.thread = 3
        this.readme = '追加: filename_expand="id1|id2"\n自定义: filename_custom="id1|id2"\n请自行通过其他渠道获取签到ID\n账号通知类似,只推送一个方便查看'
    }

    async prepare() {
        let array = []
        if (this.custom) {
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
                let url = `https://api.m.jd.com/api?appid=interCenter_shopSign&t=${this.timestamp}&loginType=2&functionId=interact_center_shopSign_getActivityInfo&body={"token":"${i}","venderId":""}`
                try {
                    let s = await this.curl(url)
                    let info = {
                        'activityId': s.data.id,
                        'venderId': s.data.venderId,
                        'token': i,
                        continuePrizeRuleList: s.data.continuePrizeRuleList
                    }
                    let shopInfo = await this.curl({
                            'url': `https://api.m.jd.com/?functionId=lite_getShopHomeBaseInfo&body={"venderId":"${s.data.venderId}","source":"appshop"}&t=1646398923902&appid=jdlite-shop-app&client=H5`,
                        }
                    )
                    if (this.haskey(shopInfo, 'result.shopInfo.shopName')) {
                        info.shopName = shopInfo.result.shopInfo.shopName
                    }
                    this.shareCode.push(info)
                    this.plan.valid.push(i)
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
        let s = await this.curl({
                'url': `https://api.m.jd.com/api?appid=interCenter_shopSign&loginType=2&functionId=interact_center_shopSign_getSignRecord&body={"token":"${p.inviter.token}","venderId":${p.inviter.venderId},"activityId":${p.inviter.activityId},"type":56,"actionType":7}&jsonp=jsonp1004`,
                cookie
            }
        )
        let days = this.haskey(s, 'data.days')
        if (days>=maxDay) {
            console.log(`签到已满${maxDay}天,跳出签到`, p.inviter.token, `https://shop.m.jd.com/?venderId=${p.inviter.venderId}`)
            this.plan.except.push(p.inviter.token)
        }
        else {
            let signIn = await this.curl({
                    'url': `https://api.m.jd.com/api?appid=interCenter_shopSign&loginType=2&functionId=interact_center_shopSign_signCollectGift&body={"token":"${p.inviter.token}","venderId":${p.inviter.venderId},"activityId":${p.inviter.activityId},"type":56,"actionType":7}`,
                    cookie
                }
            )
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
