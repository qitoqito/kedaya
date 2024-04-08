const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东支付返京豆"
        this.cron = "6 6 */3 * *"
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: 'main',
            version: '4.3'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let receive = await this.algo.curl({
                'url': `https://api.m.jd.com/api`,
                'form': `functionId=rights_receiveJdBean_v1&appid=plus_business&loginType=2&loginWQBiz=&body={}`,
                cookie,
                algo: {
                    appId: 'b63ff'
                }
            }
        )
        if (this.haskey(receive, 'rs.receiveAmount')) {
            this.print(`订单:${receive.rs.orderCount} 返豆: ${receive.rs.receiveAmount}`, p.user)
        }
        else {
            console.log(this.haskey(receive, 'msg') || receive)
        }
    }
}

module.exports = Main;
