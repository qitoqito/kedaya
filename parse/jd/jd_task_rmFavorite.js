const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东删除商品收藏"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.import = ['jdAlgo']
        this.readme = '有频率限制,不要一次删除太多'
        this.delay = 1200
        this.interval = 8000
        this.hint = {
            whiteList: '保留关键词,关键词1|关键词2',
            blackList: '只删除关键词,关键词1|关键词2'
        }
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: 'main',
            version: '4.7'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let count = parseInt(this.profile.count || this.dict.count || 20)
        let page = 1
        for (let i = 0; i<count / 20; i++) {
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/?appid=jd-cphdeveloper-m&functionId=queryFollowProduct&body={"cp":${page},"pageSize":20,"category":"","promote":0,"cutPrice":0,"coupon":0,"stock":0,"tenantCode":"jgm","bizModelCode":"6","bizModeClientType":"M","externalLoginType":"1"}&loginType=2&uuid=40501164094171678865533299&openudid=40501164094171678865533299&sceneval=2&g_login_type=1&g_tk=646642342&g_ty=ajax&appCode=msd95910c4`,
                    // 'form':``,
                    cookie,
                    algo: {
                        appId: "c420a",
                        type: "main"
                    }
                }
            )
            if (this.haskey(s, 'followProductList')) {
                // console.log(s.data)
                console.log("当前商品收藏数:", s.totalNum)
                if (s.totalNum>0) {
                    page = Math.ceil(s.totalNum / 20)>1 ? this.rand(1, Math.ceil(s.totalNum / 20)) : 1
                    // commTitle
                    if (this.profile.whiteList || this.dict.whiteList) {
                        let whiteList = (this.profile.whiteList || this.dict.whiteList).split(",").join('|')
                        var data = s.followProductList.filter(d => !d.commTitle.match(whiteList))
                    }
                    else if (this.profile.blackList || this.dict.blackList) {
                        let blackList = (this.profile.blackList || this.dict.blackList).blackList.split(",").join('|')
                        var data = s.followProductList.filter(d => d.commTitle.match(blackList))
                    }
                    else {
                        var data = s.followProductList
                    }
                    // console.log(s.data)
                    // console.log(this.column(s.data, 'commTitle').join("|"))
                    if (data.length>0) {
                        console.log(`正在删除:`, this.column(data, 'commTitle').join("|"))
                        let rm = await this.algo.curl({
                                'url': `https://api.m.jd.com/api?functionId=batchCancelFavorite&body={"skus":"${this.column(data, 'commId').join(",")}"}&appid=follow_for_concert&client=pc`,
                                cookie
                            }
                        )
                        console.log(rm.resultMsg)
                    }
                    else {
                        break
                    }
                }
                else {
                    console.log("没有获取关注数据")
                    break
                }
            }
            else {
                console.log("可能黑ip了,没有获取到数据")
                break
            }
        }
    }
}

module.exports = Main;
