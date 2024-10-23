const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东优惠券删除"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.import = ['jdAlgo']
        this.interval = 2000
        this.hint = {
            blackList: "删除关键词,多个用|隔开"
        }
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: "latest",
            referer: 'https://servicewechat.com/wx91d27dbf599dff74/760/page-frame.html'
        })
        if (this.profile.custom) {
            var str = this.profile.custom
        }
        else if (this.profile.blackList) {
            var str = this.profile.blackList
        }
        else {
            var str = "专营店|个护|卖场店"
        }
        console.log("本次删除关键词:", str)
        this._blackList = str
    }

    async main(p) {
        let cookie = p.cookie;
        let list = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action?functionId=queryJdCouponListAppletForJd&appid=jdmini-wx-search&body={"bizModelCode":"6","externalLoginType":"1","bizModeClientType":"WxMiniProgram","appId":"wx91d27dbf599dff74","token":"1999de6cba778f25f29720b0bbf7ff8b","tenantCode":"jgminise","sourceType":"wx_inter_myjd_couponlist","state":1,"wxadd":1,"filterswitch":1,"s":""}`,
                // 'form':``,
                cookie,
                algo: {
                    appId: '245ec'
                }
            }
        )
        let rm = []
        let reg = new RegExp(this._blackList)
        if (this.haskey(list, 'coupon.useable')) {
            for (let i of list.coupon.useable) {
                if (this.match(reg, i.limitStr)) {
                    rm.push(i.couponid)
                }
            }
        }
        let n = 0
        if (rm.length>0) {
            for (let _ of Array(Math.ceil(rm.length / 50))) {
                let cp = rm.splice(0, 50).map(d => {
                    return `${d},1,0`
                }).join("|")
                let del = await this.algo.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=deleteCouponListApplet&appid=jdmini-wx-search&body={"bizModelCode":"6","externalLoginType":"1","bizModeClientType":"WxMiniProgram","appId":"wx91d27dbf599dff74","token":"1999de6cba778f25f29720b0bbf7ff8b","tenantCode":"jgminise","sourceType":"wx_inter_myjd_couponlist","couponinfolist":"${cp}"}&uuid=21466657159301714025030891&openudid=21466657159301714025030891&xAPIScval2=wx&g_ty=ls&g_tk=1678530361`,
                        cookie
                    }
                )
                if (this.haskey(del, 'deleteresult')) {
                    console.log("删除中:", del.deleteresult.length)
                    n += del.deleteresult.length
                }
                await this.wait(2000)
            }
        }
        if (n) {
            this.print(`删除${n}个优惠券`, p.user)
        }
        else {
            console.log("本次执行,没有可删除的优惠券")
        }
    }
}

module.exports = Main;
