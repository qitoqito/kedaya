const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东当天京豆汇总"
        this.cron = "22 22 * * *"
        this.task = 'local'
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        let x = this.getDate(this.timestamp, 0, '-')
        let r = new RegExp(`${x}`)
        let xs = []
        let s = await this.curl({
                'url': `https://api.m.jd.com/?appid=jd-cphdeveloper-m&functionId=myBean&body={"tenantCode":"jgminise","bizModelCode":6,"bizModeClientType":"WxMiniProgram","externalLoginType":1}&sceneval=2&g_login_type=1&callback=draw_activetemporary&g_tk=610895985&g_ty=ls`,
                // 'form':``,
                cookie
            }
        )
        for (let k of this.haskey(s, 'list')) {
            if (k.createDate.includes(x)) {
                xs.push(k)
            }
        }
        let z = [], f = []
        let d = {}
        for (let i of xs) {
            d[i.visibleInfo] = d[i.visibleInfo] || {
                eventMassage: i.visibleInfo.replace(/参加|店铺活动|-奖励|\[|\]/g, ''),
                amount: 0
            }
            d[i.visibleInfo].amount += parseInt(i.amount)
        }
        let dict = Object.values(d).sort(function(a, b) {
            return b.amount - a.amount
        })
        let echo = [`🐹  今日总共收入: ${this.sum(this.column(dict, 'amount').filter(d => d>0)) || 0}  支出: ${this.sum(this.column(dict, 'amount').filter(d => d<0)) || 0}`]
        for (let i of dict) {
            if (parseInt(i.amount)<0) {
                echo.push(`🐶  [${i.amount}] ${i.eventMassage}`)
            }
            else {
                echo.push(`🦁  [${i.amount}] ${i.eventMassage}`)
            }
        }
        if (this.haskey(s,'willExpireNum')) {
            echo.push(`🙊  [${s.willExpireNum}] 即将过期`)
        }
        console.log(echo.join("\n"))
        this.notices(echo.join("\n"), p.user, 5)

    }

    async main123(p) {
        let cookie = p.cookie;
        let x = this.getDate(this.timestamp, 0, '-')
        let r = new RegExp(`${x}`)
        let xs = []
        for (let i = 1; i<20; i++) {
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
                    xs.push(k)
                }
            }
        }
        let z = [], f = []
        let d = {}
        for (let i of xs) {
            d[i.eventMassage] = d[i.eventMassage] || {
                eventMassage: i.eventMassage.replace(/参加|店铺活动|-奖励|\[|\]/g, ''),
                amount: 0
            }
            d[i.eventMassage].amount += parseInt(i.amount)
        }
        let dict = Object.values(d).sort(function(a, b) {
            return b.amount - a.amount
        })
        let echo = [`🐹  今日总共收入: ${this.sum(this.column(dict, 'amount').filter(d => d>0)) || 0}  支出: ${this.sum(this.column(dict, 'amount').filter(d => d<0)) || 0}`]
        for (let i of dict) {
            if (parseInt(i.amount)<0) {
                echo.push(`🐶  [${i.amount}] ${i.eventMassage}`)
            }
            else {
                echo.push(`🦁  [${i.amount}] ${i.eventMassage}`)
            }
        }
        console.log(echo.join("\n"))
        this.notices(echo.join("\n"), p.user, 5)
    }
}

module.exports = Main;
