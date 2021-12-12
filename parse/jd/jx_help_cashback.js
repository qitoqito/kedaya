const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京喜购物返红包助力"
        this.cron = "15 */6 * * *"
        this.task = 'all'
        this.help = 'local'
        this.import = ['jdAlgo']
        this.verify = 1
        this.readme = `如需修改查询返现人数,请自行添加环境变量\nexport ${this.filename}_help=人数
        `
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': 10022,
            type: 'pingou',
        })
        for (let i = 0; i<this.cookies['help'].length; i += 5) {
            await Promise.all(this.cookies['help'].slice(i, i + 5).map(d => this.order(d, {})))
        }
    }

    async main(id) {
        id.url = `http://wq.jd.com/fanxianzl/zhuli/Help?groupid=${id.inviter.groupid}&_stk=groupid&_ste=2&g_ty=ls&g_tk=1710198667&sceneval=2&g_login_type=1`
        let s = await this.algo.curl(id)
        console.log(this.haskey(s, 'data.prize.discount'))
    }

    async order(cookie, p) {
        let url = `https://wq.jd.com/bases/orderlist/list?order_type=3&start_page=1&last_page=0&page_size=10&callersource=newbiz&t=${this.timestamp}&traceid=&g_ty=ls&g_tk=606717070`
        let s = await this.curl({
                url,
                cookie
            }
        )
        try {
            for (let k of s.orderList) {
                try {
                    let orderid = k.parentId != '0' ? k.parentId : k.orderId
                    console.log(`正在查询订单: ${orderid}`)
                    let url = `https://wq.jd.com/fanxianzl/zhuli/QueryGroupDetail?isquerydraw=1&orderid=${orderid}&groupid=&_=1619853863315&sceneval=2&g_login_type=1&g_ty=ls`
                    let ss = await this.algo.curl({
                            url,
                            cookie
                        }
                    )
                    if (ss.data.groupinfo) {
                        let now = parseInt(new Date() / 1000)
                        let end = ss.data.groupinfo.end_time
                        if (end>now && ss.data.groupinfo.openhongbaosum != ss.data.groupinfo.totalhongbaosum) {
                            let groupid = ss.data.groupinfo.groupid;
                            this.shareCode.push({
                                'groupid': groupid
                            })
                        }
                    }
                } catch (e) {
                    console.log(e.message());
                }
            }
        } catch (e) {
        }
    }
}

module.exports = Main;
