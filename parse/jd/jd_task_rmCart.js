const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东删除购物车"
        // this.cron = "23 23 * * *"
        this.task = 'local'
        this.readme = `请谨慎使用该脚本\n建议配合filename_work字段,删除指定账户\n如需删除指定个数商品,请使用filename_count字段`
    }

    async backup(p) {
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

    async main(p) {
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
