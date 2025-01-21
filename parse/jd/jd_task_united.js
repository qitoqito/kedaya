const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东大牌集合任务"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.import = ['fs', 'jdUrl', 'jdObf', 'fileCache', 'jdSign']
        this.verify = 1
    }

    async prepare() {
        this.sign = new this.modules.jdSign()
        this.fileExpire = this.haskey(this.fileCache, 'isvObfuscator_expire') || 1800
        this.fileSalt = this.haskey(this.fileCache, 'isvObfuscator_salt') || "abcdefg"
        this.cache = this.modules["fileCache"]
        await this.cache.connect({file: `${this.dirname}/temp/isvToken.json`})
        this.assert(this.profile.custom, '请正确填写custom')
        for (let i of this.unique(this.getValue('custom'))) {
            let a = await this.curl({
                    'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/jdJoinCardtf/shop/shopProduct?open_id=&mix_nick=BZwJHR&push_way=1&user_id=10299171`,
                    json: {
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "m": "POST",
                                "oba": "6e5e793ff0ce0ac6293e2ee26f88dac6",
                                "timestamp": 1713947376182,
                                "userId": 10299171
                            },
                            "admJson": {
                                "actId": i,
                                "method": "/jdJoinCardtf/shop/shopProduct",
                                "userId": 10299171,
                                "pushWay": 1
                            }
                        }
                    }
                }
            )
            let skuList = []
            if (this.haskey(a, 'data.data.0.numId')) {
                skuList = this.column(a.data.data, 'numId')
            }
            this.shareCode.push({
                actId: i, skuList
            })
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let isvObfuscator = await this.isvToken(p)
        this.assert(isvObfuscator.token, "没有获取到isvToken")
        let gifts = 0
        if (this.haskey(isvObfuscator, 'message', '参数异常，请退出重试')) {
            console.log(`用户过期或者异常`)
            return
        }
        for (let i of Array(2)) {
            var load = await this.curl({
                    'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/jdJoinCardtf/activity/load?open_id=&mix_nick=&push_way=1&user_id=10299171`,
                    'json': {
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "oba": "259f36a73a857cfa37a7096fedb8bd60",
                                "m": "POST",
                                "timestamp": this.timestamp,
                                "userId": 10299171,
                            },
                            "admJson": {
                                "actId": p.inviter.actId,
                                "userId": 10299171,
                                "jdToken": isvObfuscator.token,
                                "source": "01",
                                "method": "/openCardNew/activity_load",
                                "buyerNick": ""
                            }
                        }
                    },
                }
            )
            if (this.haskey(load, 'data.data.missionCustomer.buyerNick')) {
                break
            }
            await this.wait(3000)
        }
        if (this.haskey(load, 'errorMessage', '获取京东用户信息失败~')) {
            console.log('获取京东用户信息失败~')
            return
        }
        let buyerNick = this.haskey(load, 'data.data.missionCustomer.buyerNick')
        let missionCustome = load.data.data.missionCustomer
        let bean = 0
        let shopList = await this.curl({
                'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/jdJoinCardtf/shop/shopList?open_id=&mix_nick=${buyerNick}&push_way=1&user_id=10299171`,
                json: {
                    "jsonRpc": "2.0",
                    "params": {
                        "commonParameter": {
                            "m": "POST",
                            "oba": "e4aae386ea7d1a32f77771570eea39cd",
                            "timestamp": this.timestamp,
                            "userId": 10299171
                        },
                        "admJson": {
                            "method": "/jdJoinCardtf/shop/shopList",
                            "userId": 10299171,
                            "actId": p.inviter.actId,
                            buyerNick,
                            "pushWay": 1
                        }
                    }
                }
            }
        )
        for (let i of this.haskey(shopList, 'data.data')) {
            let goodsNumId = i.shopId
            console.log("正在浏览:", i.shopTitle)
            let s = await this.curl({
                    'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/jdJoinCardtf/mission/completeMission?open_id=&mix_nick=${buyerNick}&push_way=1&user_id=10299171`,
                    json: {
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "m": "POST",
                                "oba": "259f36a73a857cfa37a7096fedb8bd60",
                                "timestamp": new Date().getTime(),
                                "userId": 10299171
                            },
                            "admJson": {
                                "missionType": "viewShop",
                                "goodsNumId": goodsNumId,
                                "method": "/jdJoinCardtf/mission/completeMission",
                                "userId": 10299171,
                                "actId": p.inviter.actId,
                                buyerNick,
                                "pushWay": 1
                            }
                        }
                    }
                }
            )
            // console.log(this.dumps(s))
            let remark = this.haskey(s, 'data.data.remark') || ''
            console.log(remark)
            if (this.haskey(s, 'data.data.sendStatus') == false) {
                break
            }
            if (this.haskey(s, 'data.data.sendStatus')) {
                let num = this.match(/(\d+)个京豆/, remark)
                bean += parseInt(num)
            }
            else {
                if (this.dumps(s).includes("上限")) {
                    break
                }
            }
            await this.wait(1000)
        }
        for (let _ of ['uniteAddCart', 'uniteCollectShop']) {
            if (_ == 'uniteAddCart' && missionCustome.hasAddCart) {
                continue
            }
            else if (_ == 'uniteCollectShop' && missionCustome.hasCollectShop) {
                continue
            }
            let collectShop = await this.curl({
                    'url': `https://jinggengjcq-isv.isvjcloud.com/dm/front/jdJoinCardtf/mission/completeMission?open_id=&mix_nick=${buyerNick}&push_way=1&user_id=10299171`,
                    json: {
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "m": "POST",
                                "oba": "b67770414453c05a26e57cde6ae600ab",
                                "timestamp": new Date().getTime(),
                                "userId": 10299171
                            },
                            "admJson": {
                                "actId": p.inviter.actId,
                                "missionType": _,
                                "method": "/jdJoinCardtf/mission/completeMission",
                                "userId": 10299171,
                                buyerNick,
                                "pushWay": 1
                            }
                        }
                    }
                }
            )
            let remark = this.haskey(collectShop, 'data.data.remark') || ''
            console.log(remark)
            if (this.haskey(collectShop, 'data.data.sendStatus')) {
                let num = this.match(/(\d+)个京豆/, remark)
                bean += parseInt(num)
            }
            await this.wait(1000)
        }
        if (bean>0) {
            this.print(`获得京豆: ${bean}`, p.user)
        }
    }

    async isvToken(p) {
        let cacheKey = this.md5(`${this.fileSalt}_isvObfuscator_${this.userName(p.cookie)}`)
        try {
            var isvObfuscator = await this.cache.get(cacheKey)
        } catch (e) {
        }
        if (!isvObfuscator) {
            var isvObfuscator = await this.sign.jdCurl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `body=${this.dumps({
                        "url": `https://lzdz1-isv.isvjcloud.com`,
                        "id": ""
                    })}&build=169063&client=apple&clientVersion=12.3.4&functionId=isvObfuscator`,
                    cookie: p.cookie
                }
            )
            if (!this.haskey(isvObfuscator, 'token')) {
                isvObfuscator = await this.curl(this.modules.jdObf.app('isvObfuscator', {
                    "url": `https://lzdz1-isv.isvjcloud.com`,
                    "id": ""
                }, 'post', p.cookie))
            }
            if (this.haskey(isvObfuscator, 'token') && this.cache.set) {
                await this.cache.set(cacheKey, isvObfuscator, parseInt(this.fileExpire))
                console.log("写入isvToken缓存成功...")
            }
        }
        else {
            console.log("读取isvToken缓存成功...")
        }
        console.log(`isvToken: ${this.haskey(isvObfuscator, 'token') || "没有获取到isvToken"}`)
        return isvObfuscator
    }

    async extra() {
        if (this.cache.set) {
            console.log(`关闭缓存....`)
            await this.cache.close()
        }
    }
}

module.exports = Main;
