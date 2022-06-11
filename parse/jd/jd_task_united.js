const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东大牌集合任务"
        // this.cron = "12 0,13 * * *"
        this.task = 'local'
        this.import = ['jdUrl']
        this.verify = 1
        // this.thread = 3
    }

    async prepare() {
        this.assert(this.profile.custom, '请正确填写custom')
        for (let i of this.unique(this.getValue('custom'))) {
            let a = await this.curl({
                    'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/openCardNew/shopProduct?mix_nick=BZwJHR`,
                    json: {
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "appkey": "51B59BB805903DA4CE513D29EC448375",
                                "m": "POST",
                                "timestamp": this.timestamp,
                                "userId": "10299171"
                            },
                            "admJson": {
                                "actId": "5e15292a037747739552fd2f12e_22060104",
                                "userId": "10299171",
                                "method": "/openCardNew/shopProduct",
                            }
                        }
                    }
                }
            )
            let skuList = []
            if (this.haskey(a, 'data.data.cusShopProductList')) {
                skuList = this.column(a.data.data.cusShopProductList, 'numId')
            }
            this.shareCode.push({
                actId: i, skuList
            })
        }
    }

    async main(p) {
        let cookie = p.cookie;
        try {
            let isvObfuscator = await this.curl(this.modules.jdUrl.app('isvObfuscator', {
                "url": `https://jinggengjcq-isv.isvjcloud.com`,
                "id": ""
            }, 'post', cookie))
            let gifts = 0
            if (this.haskey(isvObfuscator, 'message', '参数异常，请退出重试')) {
                console.log(`用户过期或者异常`)
                return
            }
            let load = await this.curl({
                    'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/openCardNew/activity_load?mix_nick=`,
                    'json': {
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "appkey": "51B59BB805903DA4CE513D29EC448375",
                                "m": "POST",
                                "timestamp": this.timestamp,
                                // "userId": "10299181"
                            },
                            "admJson": {
                                "actId": p.inviter.actId,
                                // "userId": "10299181",
                                "jdToken": isvObfuscator.token,
                                "source": "01",
                                "method": "/openCardNew/activity_load",
                                "buyerNick": ""
                            }
                        }
                    },
                }
            )
            if (this.haskey(load, 'errorMessage', '获取京东用户信息失败~')) {
                console.log('获取京东用户信息失败~')
                return
            }
            let buyerNick = this.haskey(load, 'data.data.buyerNick')
            let userId = (this.haskey(load, 'data.data.missionCustomer.userId') || 10299171).toString()
            for (let nn of Array(3)) {
                var state = await this.curl({
                        'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/openCardNew/mission/complete/state?mix_nick=${buyerNick}`,
                        'json': {
                            "jsonRpc": "2.0",
                            "params": {
                                "commonParameter": {
                                    "appkey": "51B59BB805903DA4CE513D29EC448375",
                                    "m": "POST",
                                    "timestamp": new Date().getTime(),
                                    userId
                                },
                                "admJson": {
                                    "actId": p.inviter.actId,
                                    userId,
                                    "method": "/openCardNew/mission/complete/state",
                                    buyerNick
                                }
                            }
                        }
                    }
                )
                if (this.haskey(state, 'data.data')) {
                    break
                }
            }
            this.assert(this.haskey(state, 'data.data'), '没有获取到数据')
            for (let i of this.haskey(state, 'data.data')) {
                if (!i.isComplete) {
                    let k = 0
                    if (['viewShop', 'viewGoods', 'uniteAddCart', 'uniteCollectShop'].includes(i.type)) {
                        console.log('正在运行:', i.missionName)
                        let json = {
                            "jsonRpc": "2.0",
                            "params": {
                                "commonParameter": {
                                    "appkey": "51B59BB805903DA4CE513D29EC448375",
                                    "m": "POST",
                                    "timestamp": new Date().getTime(),
                                    userId
                                },
                                "admJson": {
                                    "actId": p.inviter.actId,
                                    "missionType": i.type,
                                    "method": "/openCardNew/complete/mission",
                                    userId,
                                    buyerNick
                                }
                            }
                        }
                        for (let j = 0; j<(i.dayTop - (i.hasGotNum || 0)); j++) {
                            let s = await this.curl({
                                    'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/openCardNew/complete/mission?mix_nick=${buyerNick}`,
                                    json
                                }
                            )
                            let remark = this.haskey(s, 'data.data.remark') || ''
                            let num = this.match(/(\d+)个京豆/, remark)
                            if (num) {
                                k = 0
                                gifts += parseInt(num)
                            }
                            else {
                                k++
                            }
                            console.log(remark || '什么也没有啊')
                            if (k == 3) {
                                console.log(`检测到没有豆子奖励,退出浏览`)
                                break
                            }
                            await this.wait(this.rand(1000, 2000))
                        }
                    }
                }
                else {
                    console.log(`任务完成:`, i.missionName)
                }
            }
            if (gifts) {
                this.print(`获得京豆: ${gifts}`, p.user)
            }
            else {
                console.log(`什么也没有`)
            }
            let skuList = p.inviter.skuList
            if (skuList.length>0) {
                skuList = skuList.map(d => d.toString())
                let cart = await this.curl({
                        'url': `https://api.m.jd.com/api?functionId=pcCart_jc_getCurrentCart&appid=JDC_mall_cart&body={}`,
                        // 'form':``,
                        cookie: p.cookie,
                        headers: {
                            "referer": "https://cart.jd.com/cart_index/",
                            "user-agent": "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0",
                        }
                    }
                )
                let skus = []
                let packs = []
                if (this.haskey(cart, 'resultData.cartInfo.vendors')) {
                    for (let i of cart.resultData.cartInfo.vendors) {
                        for (let j of this.haskey(i, 'sorted')) {
                            if (this.haskey(j, 'item.items')) {
                                if (j.item.items.length>0) {
                                    for (let k of j.item.items) {
                                        if (skuList.includes(k.item.Id)) {
                                            packs.push(
                                                {
                                                    "num": k.item.Num.toString(),
                                                    "ybPackId": j.item.promotionId,
                                                    "sType": "11",
                                                    "TheSkus": [{
                                                        "num": k.item.Num.toString(),
                                                        "Id": k.item.Id.toString()
                                                    }],
                                                    "Id": j.item.promotionId
                                                }
                                            )
                                        }
                                    }
                                }
                                else {
                                    if (skuList.includes(j.item.Id)) {
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
                            cookie: p.cookie,
                            headers: {
                                "referer": "https://cart.jd.com/cart_index/",
                                "user-agent": "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0",
                            }
                        }
                    )
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = Main;
