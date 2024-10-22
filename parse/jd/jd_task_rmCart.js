const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东删除购物车"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.readme = "购物车删除,慎用脚本"
        this.import = ['jdAlgo']
        this.delay = 1200
        this.interval = 8000
        this.hint = {
            whiteList: '保留关键词,关键词1|关键词2',
            blackList: '只删除关键词,关键词1|关键词2'
        }
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo(
            {
                version: 'latest',
                type: "main",
                headers: {
                    "referer": "https://cart.jd.com/cart_index/",
                }
            }
        )
    }

    async main(p) {
        let cookie = p.cookie
        let cart = await this.algo.curl({
                'url': `https://api.m.jd.com/api?functionId=pcCart_jc_getCurrentCart&appid=JDC_mall_cart&loginType=3&t=1717947580116&client=pc&clientVersion=1.0.0&body={"serInfo":{"user-key":""},"cartExt":{"specialId":1}}`,
                cookie,
                algo: {
                    appId: 'f961a'
                }
            }
        )
        if (!this.haskey(cart, 'resultData.cartInfo.vendors')) {
            return "没有获取到数据"
        }
        let skus = []
        let packs = []
        let whiteList, blackList
        if (this.profile.whiteList) {
            whiteList = (this.profile.whiteList).split(",").join('|')
        }
        else if (this.profile.blackList) {
            blackList = (this.profile.blackList).split(",").join('|')
        }
        if (this.haskey(cart, 'resultData.cartInfo.vendors')) {
            for (let i of cart.resultData.cartInfo.vendors) {
                for (let j of this.haskey(i, 'sorted')) {
                    if (this.haskey(j, 'item.items')) {
                        if (j.item.items.length>0) {
                            for (let k of j.item.items) {
                                if (whiteList) {
                                    if (!k.item.Name.match(whiteList)) {
                                        packs.push(
                                            {
                                                "num": k.item.Num.toString(),
                                                "ybPackId": j.item.promotionId,
                                                "sType": "11",
                                                "TheSkus": [{"num": k.item.Num.toString(), "Id": k.item.Id.toString()}],
                                                "Id": j.item.promotionId
                                            }
                                        )
                                    }
                                }
                                else if (blackList) {
                                    if (k.item.Name.match(blackList)) {
                                        packs.push(
                                            {
                                                "num": k.item.Num.toString(),
                                                "ybPackId": j.item.promotionId,
                                                "sType": "11",
                                                "TheSkus": [{"num": k.item.Num.toString(), "Id": k.item.Id.toString()}],
                                                "Id": j.item.promotionId
                                            }
                                        )
                                    }
                                }
                                else {
                                    let packss = {
                                        "num": k.item.Num.toString(),
                                        "ybPackId": (j.item.promotionId || j.item.Id).toString(),
                                        "sType": "11",
                                        "TheSkus": [{"num": k.item.Num.toString(), "Id": k.item.Id.toString()}],
                                        "Id": (j.item.promotionId || j.item.vid).toString()
                                    }
                                    if (this.haskey(k, 'item.skuUuid')) {
                                        packss.skuUuid = k.item.skuUuid
                                        packss.TheSkus[0].skuUuid = k.item.skuUuid
                                        // packss.sType = "4"
                                        packss.useUuid = false
                                        packss.TheSkus[0].useUuid = false
                                    }
                                    packs.push(
                                        packss
                                    )
                                }
                                // if (k.item.stockState != "无货" && k.item.checkBoxText != "预售") {
                                // }
                            }
                        }
                        else {
                            if (whiteList) {
                                if (!j.item.Name.match(whiteList)) {
                                    skus.push(
                                        {
                                            "num": j.item.Num.toString(),
                                            "Id": j.item.Id.toString(),
                                            "skuUuid": j.item.skuUuid,
                                            "useUuid": j.item.useUuid
                                        }
                                    )
                                }
                            }
                            else if (blackList) {
                                if (j.item.Name.match(blackList)) {
                                    skus.push(
                                        {
                                            "num": j.item.Num.toString(),
                                            "Id": j.item.Id.toString(),
                                            "skuUuid": j.item.skuUuid,
                                            "useUuid": j.item.useUuid
                                        }
                                    )
                                }
                            }
                            else {
                                skus.push(
                                    {
                                        "num": j.item.Num.toString(),
                                        "Id": j.item.Id.toString(),
                                        "skuUuid": j.item.skuUuid,
                                        "useUuid": j.item.useUuid
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
        console.log('即将删除购物车数目:', skus.length + packs.length)
        if (skus.length>0 || packs.length>0) {
            let cartRemove = await this.algo.curl({
                    'url': `https://api.m.jd.com/api`,
                    'form': `functionId=pcCart_jc_cartRemove&appid=JDC_mall_cart&body=${this.dumps({
                        "operations": [{
                            "carttype": "4",
                            "TheSkus": skus,
                            "ThePacks": packs
                        }], "serInfo": {}
                    })}`,
                    cookie,
                }
            )
            this.notices(`删除购物车: ${skus.length + packs.length}`, p.user)
        }
    }
}

module.exports = Main;
