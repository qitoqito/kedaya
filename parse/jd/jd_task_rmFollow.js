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
                    'url': `https://api.m.jd.com/client.action`,
                    form: 'functionId=getFollowShop&body={"page":1,"activityStatus":1,"refresh":false,"pageSize":20,"channel":"jg_shop"}&t=1721701312676&appid=shop_m_jd_com&clientVersion=13.1.2&client=wh5&screen=1170*2532&uuid=1d2057c82bc10bed6b30fcf24c8ede39&loginType=2&x-api-eid-token=jdd03BEKUSIICX7NIA2GGINTXC5QERR6B54KI6TFAJ7B4DI337FEFP4DTEMJ2Z7PKJQUV4OH6P3U74CEGNVTDWIZGD4JSXIAAAAMQ3VSF6CQAAAAACYUXLQXVUJSGIYX',
                    cookie,
                    referer: 'https://shop.m.jd.com/favorite/home',
                    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.33(0x18002129) NetType/WIFI Language/zh_CN miniProgram/wx91d27dbf599dff74"
                }
            )
            if (this.haskey(s, 'result.showShopList')) {
                s = s.result
                console.log("当前店铺收藏数:", s.totalCount)
                if (s.totalCount>0) {
                    page = Math.ceil(s.totalCount / 20)>1 ? this.rand(1, Math.ceil(s.totalCount / 20)) : 1
                    // shopName
                    if (this.profile.whiteList || this.dict.whiteList) {
                        let whiteList = (this.profile.whiteList || this.dict.whiteList).split(",").join('|')
                        var data = s.showShopList.filter(d => !d.shopName.match(whiteList))
                    }
                    else if (this.profile.blackList || this.dict.blackList) {
                        let blackList = (this.profile.blackList || this.dict.blackList).blackList.split(",").join('|')
                        var data = s.showShopList.filter(d => d.shopName.match(blackList))
                    }
                    else {
                        var data = s.showShopList
                    }
                    if (data.length>0) {
                        console.log(`正在删除:`, this.column(data, 'shopName').join("|"))
                        let rm = await this.curl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `functionId=followShop&body={"shopId":"${this.column(data, 'shopId').join(",")}","follow":false,"sourceRpc":"shop_app_myollows_shop","channel":"jg_shop"}&t=1721702313509&appid=shop_m_jd_com&clientVersion=13.1.2&client=wh5&screen=1170*2532&uuid=1d2057c82bc10bed6b30fcf24c8ede39&loginType=2&x-api-eid-token=jdd03BEKUSIICX7NIA2GGINTXC5QERR6B54KI6TFAJ7B4DI337FEFP4DTEMJ2Z7PKJQUV4OH6P3U74CEGNVTDWIZGD4JSXIAAAAMQ3VSF6CQAAAAACYUXLQXVUJSGIYX`,
                                cookie
                            }
                        )
                        console.log(this.haskey(rm, 'msg') || '')
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
