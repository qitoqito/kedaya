const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东取关店铺"
        this.cron = "33 23 * * *"
        this.task = 'local'
        this.thread = 3
    }

    async prepare() {
        this.count = this.count || 60
    }

    async main(p) {
        let cookie = p.cookie
        let url = `https://wq.jd.com/fav/shop/QueryShopFavList?cp=1&pageSize=20&lastlogintime=${this.timestamp}&_=1629620296971&g_login_type=0&callback=jsonpCBKA&g_tk=1994796340&g_ty=ls&sceneval=2&g_login_type=1`
        let array = []
        let nn = 0
        let a = 0
        for (let i = 0, n = Math.ceil(this.count / 20); i<=n; i++) {
            let lists = await this.curl({url, cookie: p.cookie})
            if (lists.data) {
                // console.log(lists.data)
                let ss = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=followShop`,
                        'form': `functionId=followShop&body={"follow":"false","shopId":"${this.column(lists.data, 'shopId').join(",")}","award":"true","sourceRpc":"shop_app_home_follow"}&osVersion=13.7&appid=wh5&clientVersion=9.2.0&loginType=2&loginWQBiz=interact`,
                        cookie
                    }
                )
                console.log(ss.msg || ss)
                if (ss.msg) {
                    a += lists.data.length
                }
                else {
                    console.log("失败了")
                    break
                }
            }
            else {
                console.log("未获取到店铺关注信息")
                break
            }
        }
        if (a>0) {
            this.notices(`取关店铺数: ${a}`, p.user, 30)
        }
    }
}

module.exports = Main;
