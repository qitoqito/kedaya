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
        let array = [
            '0FA06CDDB52AE05A98F572BC102C051F',
            '97C1CE5FD22CC02A52DD6583B3E29F46',
            // '7D7881FDDBBAAFB999F6A794E2036A56'
        ]
        if (this.custom) {
            array = this.getValue('custom')
        }
        else if (this.expand) {
            let expand = this.getValue('expand')
            array = [...expand, ...array]
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
                } catch
                    (e) {
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
                }
            }
        }
        let signIn = await this.curl({
                'url': `https://api.m.jd.com/api?appid=interCenter_shopSign&loginType=2&functionId=interact_center_shopSign_signCollectGift&body={"token":"${p.inviter.token}","venderId":${p.inviter.venderId},"activityId":${p.inviter.activityId},"type":56,"actionType":7}`,
                cookie
            }
        )
        signIn.success ? console.log(p.user, `签到成功`) : console.log(p.user, `签到失败或者已经签到`)
        let s = await this.curl({
                'url': `https://api.m.jd.com/api?appid=interCenter_shopSign&loginType=2&functionId=interact_center_shopSign_getSignRecord&body={"token":"${p.inviter.token}","venderId":${p.inviter.venderId},"activityId":${p.inviter.activityId},"type":56,"actionType":7}&jsonp=jsonp1004`,
                // 'form':``,
                cookie
            }
        )
        let days = this.haskey(s, 'data.days')
        for (let day of Object.keys(dayDict)) {
            if (days<=day) {
                console.log(p.user, `店铺: ${p.inviter.shopName} Token: ${p.inviter.token},${dayDict[day]}, 已经签到: ${days}天`)
                if (signIn.success) {
                    this.dict[p.user].push(`Token: ${p.inviter.token}, ${dayDict[day]}, 已经签到: ${days}天`)
                }
                break
            }
        }
    }

    async extra() {
        for (let i in this.dict) {
            if (this.dict[i].length) {
                this.notices(this.dict[i].join("\n"))
                break
            }
        }
    }
}

module.exports = Main;
