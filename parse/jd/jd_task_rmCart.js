const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东删除购物车"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.readme = "购物车删除,慎用脚本"
        this.import = ['jdUrl']
    }

    async main(p) {
        let cookie = p.cookie
        let cart = await this.curl({
                'url': `https://api.m.jd.com/api?functionId=pcCart_jc_getCurrentCart&appid=JDC_mall_cart&body={}`,
                // 'form':``,
                cookie,
                headers: {
                    "referer": "https://cart.jd.com/cart_index/",
                    "user-agent": "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0",
                }
            }
        )
        let skus = []
        let packs = []
        let whiteList, blackList
        if (this.profile.whiteList || this.dict.whiteList) {
            whiteList = (this.profile.whiteList || this.dict.whiteList).split(",").join('|')
        }
        else if (this.profile.blackList || this.dict.blackList) {
            blackList = (this.profile.blackList || this.dict.blackList).split(",").join('|')
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
            let cartRemove = await this.curl({
                    'url': `https://api.m.jd.com/api`,
                    'form': `functionId=pcCart_jc_cartRemove&appid=JDC_mall_cart&body=${this.dumps({
                        "operations": [{
                            "carttype": "4",
                            "TheSkus": skus,
                            "ThePacks": packs
                        }], "serInfo": {}
                    })}`,
                    cookie,
                    headers: {
                        "referer": "https://cart.jd.com/cart_index/",
                        "user-agent": "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0",
                    }
                }
            )
            this.notices(`删除购物车: ${skus.length + packs.length}`, p.user)
        }
    }

    async backup(p) {
        let cookie = p.cookie
        let uuid = this.uuid(40)
        let u = this.modules.jdUrl.lite("lite_cart", {
            "syntype": "1",
            "noResponse": false,
            "userType": "1",
            "openudid": uuid,
            "cartuuid": uuid,
            "carttype": "1",
            "adid": ""
        }, 'post', cookie)
        let s = await this.curl(u)
        let skus = []
        if (this.haskey(s, 'cartInfo.vendors')) {
            for (let i of s.cartInfo.vendors) {
                for (let j of this.haskey(i, 'sorted')) {
                    for (let k of j.item.items) {
                        if (k.item.stockState != "无货" && k.item.checkBoxText != "预售") {
                            skus.push(
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
                }
            }
        }
        console.log('即将删除购物车数目:', skus.length)
        if (skus.length>0) {
            let uu = this.modules.jdUrl.lite("lite_cartRemove", {
                "syntype": "1",
                "noResponse": false,
                "userType": "1",
                "openudid": uuid,
                "hitNewUIStatus": "1",
                "cartuuid": uuid,
                "carttype": "4",
                "operations": [{
                    "ThePacks": skus
                }],
                "adid": ""
            }, 'post', cookie)
            let remove = await this.curl(uu)
        }
    }

    async backup1(p) {
        let cookie = p.cookie
        let list = []
        let name = []
        let n = 0
        let s = await this.curl({
                'url': `https://wq.jd.com/cart/view?g_ty=mp&g_tk=1117882496`,
                'form': `scene=0&all=0&type=0&callersrc=xcxcart&fckr=0&datatype=0&traceid=`,
                cookie
            }
        )
        try {
            for (let i of this.haskey(s, 'cartInfo.vendors')) {
                let sorteds = i.sorteds
                for (let j of sorteds) {
                    for (let items of j.items) {
                        if (this.count && n == parseInt(this.count)) {
                            break
                        }
                        name.push(`${items.id} -- ${items.name}`)
                        let dict = {
                            "skuId": items.id,
                            "num": items.num,
                            "itemType": items.itemType,
                            "skuUuid": items.skuUuid,
                            "useUuid": 0
                        }
                        if (j.promotionId) {
                            dict.promotionId = j.promotionId
                        }
                        if (j.isJingXi) {
                            dict.isJingXi = j.isJingXi
                        }
                        list.push(dict)
                        n++;
                    }
                }
            }
        } catch (e) {
        }
        if (list.length) {
            let ss = await this.curl({
                    'url': `https://wq.jd.com/cart/remove?g_ty=mp&g_tk=1117882496`,
                    'form': `locationid=&scene=0&all=0&type=0&callersrc=xcxcart&skus=${this.dumps(list)}&datatype=0&traceid=1394373979296293568`,
                    cookie
                }
            )
            console.log(ss)
            console.log(name.join("\n"))
            this.notices(`删除购物车商品数: ${list.length}`, p.user)
        }
        else {
            console.log('没有可以删除的商品')
        }
    }

    async backup2(p) {
        let cookie = p.cookie
        let s = await this.curl({
                'url': `https://wq.jd.com/deal/mshopcart/rmvCmdy?sceneval=2&g_login_type=1&g_ty=ajax`,
                'form': `pingouchannel=0&commlist=123,,1,123,11,123,0,skuUuid:aaa@@useUuid:0&type=0&checked=0&locationid=&templete=1&reg=1&scene=0&version=20190418&traceid=1394319544881167891&tabMenuType=1&sceneval=2`,
                cookie
            }
        )
        let list = []
        let name = []
        let n = 0
        try {
            let cart = s.cart.venderCart
            for (let i of cart) {
                for (let items of i.sortedItems) {
                    for (let products of items.polyItem.products) {
                        if (this.count && n == parseInt(this.count)) {
                            break
                        }
                        if (this.haskey(items, 'polyItem.promotion.pid')) {
                            list.push(`${products.mainSku.id},,1,${products.mainSku.id},11,${items.polyItem.promotion.pid},0,skuUuid:${products.skuUuid}@@useUuid:0`)
                        }
                        else {
                            list.push(
                                `${products.mainSku.id},,1,${products.mainSku.id},1,,0,skuUuid:${products.skuUuid}@@useUuid:0`
                            )
                        }
                        name.push(
                            `${products.mainSku.id} -- ${products.mainSku.name}`
                        )
                        n++
                    }
                }
            }
        } catch (e) {
        }
        if (list.length) {
            s = await this.curl({
                    'url': `https://wq.jd.com/deal/mshopcart/rmvCmdy?sceneval=2&g_login_type=1&g_ty=ajax`,
                    'form': `pingouchannel=0&commlist=${list.join("$")}&checked=0&locationid=&templete=1&reg=1&scene=0&version=20190418&traceid=&tabMenuType=1&sceneval=2`,
                    cookie
                }
            )
            console.log(name.join("\n"))
            this.notices(`删除购物车商品数: ${list.length}`, p.user)
        }
        else {
            console.log('没有可以删除的商品')
        }
    }
}

module.exports = Main;
