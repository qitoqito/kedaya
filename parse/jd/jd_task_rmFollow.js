const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东取关店铺"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.delay = 1200
        this.interval = 8000
        this.hint = {
            whiteList: '保留关键词,关键词1|关键词2',
            blackList: '只删除关键词,关键词1|关键词2',
            page: '删除页数,每页20条数据,默认3'
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let page = 1
        for (let i = 0; i<parseInt(this.profile.page || 3); i++) {
            let s = await this.curl({
                    'url': `https://wq.jd.com/fav/shop/QueryShopFavList?cp=1&pageSize=20&lastlogintime=1681810631&_=1681810636733&g_login_type=0&appCode=msd95910c4&callback=jsonpCBKA&g_tk=646642342&g_ty=ls`,
                    cookie
                }
            )
            if (this.haskey(s, 'data')) {
                // console.log(s.data)
                console.log("当前店铺收藏数:", s.totalNum)
                if (s.totalNum>0) {
                    page = Math.ceil(s.totalNum / 20)>1 ? this.rand(1, Math.ceil(s.totalNum / 20)) : 1
                    // shopName
                    if (this.profile.whiteList || this.dict.whiteList) {
                        let whiteList = (this.profile.whiteList || this.dict.whiteList).split(",").join('|')
                        var data = s.data.filter(d => !d.shopName.match(whiteList))
                    }
                    else if (this.profile.blackList || this.dict.blackList) {
                        let blackList = (this.profile.blackList || this.dict.blackList).blackList.split(",").join('|')
                        var data = s.data.filter(d => d.shopName.match(blackList))
                    }
                    else {
                        var data = s.data
                    }
                    if (data.length>0) {
                        console.log(`正在删除:`, this.column(data, 'shopName').join("|"))
                        let rm = await this.curl({
                                'url': `https://wq.jd.com/fav/shop/batchunfollow?shopId=${this.column(data, 'shopId').join(",")}&_=1681810861733&g_login_type=0&appCode=msd95910c4&callback=jsonpCBKE&g_tk=646642342&g_ty=ls`,
                                // 'form':``,
                                cookie
                            }
                        )
                        console.log(rm)
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
