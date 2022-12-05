const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东支付返京豆"
        this.cron = "6 6 */3 * *"
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://rsp.jd.com/rights/receiveJdBean/v1`,
                'form': `lt=m&an=plus.mobile`,
                cookie
            }
        )
        if (this.haskey(s, 'rs')) {
            let r = await this.curl({
                    'url': `https://rsp.jd.com/rights/couponAndPopup/v1`,
                    'form': `lt=m&an=plus.mobile&orderCount=${s.rs.orderCount}&receiveAmount=${s.rs.receiveAmount}&platform=1&eid=X567ABSDWR4O4QUS3DVSU5WUIT7F2RHYYSBQ2QDS7C6D332RYIENBOUACPR6EUMOYBYXNBJKHTKZFGFEQOKA2G2C54&fp=5a8a629fa098e740cbb939ef4fbfbec3`,
                    cookie
                }
            )
            if (this.haskey(r, 'rs')) {
                this.print(`返京豆: ${r.rs.receiveAmount}`, p.user)
            }
            else {
                console.log(r)
            }
        }
        else {
            console.log("没有返豆订单")
        }
    }
}

module.exports = Main;
