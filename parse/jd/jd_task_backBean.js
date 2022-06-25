const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东购物返豆"
        this.cron = "9 9 */3 * *"
        this.task = 'local'
        this.import = ['jdUrl']
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl(
            this.modules.jdUrl.app("jingBeanDetail", {"pageSize": 20, "pageNo": 1}, 'post', cookie)
        )
        if (this.haskey(s, 'others.jingBeanBackShopping.ballList')) {
            for (let i of this.haskey(s, 'others.jingBeanBackShopping.ballList')) {
                if (i.beanCount) {
                    let c = await this.curl(this.modules.jdUrl.app("collectBeans", {"orderIdSet": [i.orderId]}, 'post', cookie)
                    )
                    console.log(c)
                    if (c.isSuccess) {
                        this.print(`购物返豆${i.beanCount}`, p.user)
                    }
                }
            }
        }
        else {
            console.log("没有获取到购物返豆订单")
        }
    }
}

module.exports = Main;
