const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东cookie检测"
        this.cron = "50 7-23 * * *"
        // this.help = 2
        this.thread = 6
        this.task = 'all'
    }

    async main(p) {
        let cookie = p.cookie
        let s = await this.curl({
                'url': `https://plogin.m.jd.com/cgi-bin/ml/islogin`,
                // 'form':``,
                cookie
            }
        )
        let s2 = await this.curl({
                'url': `https://wq.jd.com/bases/orderlist/list?order_type=3&start_page=1&page_size=10&last_page=0&callersource=mainorder&traceid=1173839808217437357&t=1619852939462&sceneval=2&g_ty=ls&g_tk=5381`,
                cookie
            }
        )
        if ((s.islogin == '0' && s2.errCode == '13')) {
            this.notices("账号过期了呀🐶", p.user) 
        }
        else {
            console.log("账号还没过期呢🍀")
        }
    }
}

module.exports = Main;
