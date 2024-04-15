const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东共享云境"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.import = ['fs', 'jdUrl', 'jdObf', 'fileCache']
        this.readme = "活动日期:4.08 - 4.16"
    }

    async prepare() {
        this.fileExpire = this.haskey(this.fileCache, 'isvObfuscator_expire') || 1800
        this.fileSalt = this.haskey(this.fileCache, 'isvObfuscator_salt') || "abcdefg"
        this.cache = this.modules["fileCache"]
        await this.cache.connect({file: `${this.dirname}/temp/isvToken.json`})
        try {
            let txt = this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_jdGree.json`).toString()
            this.dict = this.loads(txt)
        } catch (e) {
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let isvObfuscator = await this.isvToken(p)
        let beans = 0
        if (!this.haskey(this.dict, `${p.user}.buyerNick`)) {
            for (let i = 0; i<3; i++) {
                var load = await this.curl({
                        'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/activity/load?open_id=&mix_nick=&user_id=10299171`,
                        'json': this.dmCreateSign({
                            "jsonRpc": "2.0",
                            "params": {
                                "commonParameter": {
                                    "m": "POST",
                                    "sign": "af9360c1dea2e6e958b1d1af70f8a074",
                                    "timestamp": 1713165949126,
                                },
                                "admJson": {
                                    "actId": "jdGreeSuperBrandDay",
                                    "jdToken": isvObfuscator.token,
                                    "method": "/jdGreeSuperBrandDay/activity/load",
                                    "buyerNick": ""
                                }
                            }
                        }),
                    }
                )
                if (this.haskey(load, 'data')) {
                    break
                }
            }
            if (this.haskey(load, 'errorMessage', '获取京东用户信息失败~')) {
                console.log('获取京东用户信息失败~')
                return
            }
            var buyerNick = this.haskey(load, 'data.data.missionCustomer.buyerNick')
            this.dict[p.user] = {buyerNick, actId: "jdGreeSuperBrandDay"}
        }
        else {
            var buyerNick = this.dict[p.user].buyerNick
        }
        let state = await this.curl({
                'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/mission/completeState?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                'json': this.dmCreateSign({
                    "jsonRpc": "2.0",
                    "params": {
                        "commonParameter": {
                            "m": "POST",
                            "sign": "01318582341e551203062cab91c06f5b",
                            "timestamp": this.timestamp,
                            "userId": 10299171
                        },
                        "admJson": {
                            "method": "/jdGreeSuperBrandDay/mission/completeState",
                            "userId": 10299171,
                            "actId": "jdGreeSuperBrandDay",
                            buyerNick
                        }
                    }
                })
            }
        )
        this.assert(this.haskey(state, 'data.data'), '没有获取到数据')
        let user = this.userName(cookie)
        for (let i of this.haskey(state, 'data.data')) {
            if (!i.isComplete) {
                switch (i.type) {
                    case 'openCard':
                    case 'shareAct':
                    case  'payTrade':
                    case 'bingCar':
                        console.log("跳过运行:", i.missionName)
                        break
                    case 'uniteAddCart':
                    case 'viewTimesVenue':
                    case 'viewTimesLive':
                    case 'viewTimesShop':
                    case 'viewTimesProduct':
                        console.log('正在运行:', i.missionName)
                        let product = await this.curl({
                                'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/shop/shopProductLoad?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                                json: this.dmCreateSign({
                                    "jsonRpc": "2.0",
                                    "params": {
                                        "commonParameter": {
                                            "m": "POST",
                                            "sign": "b234e740ab66c6b76ad69a82378dd423",
                                            "timestamp": 1713170874834,
                                            "userId": "10299171"
                                        },
                                        "admJson": {
                                            "type": "uniteAddCart",
                                            "method": "/jdGreeSuperBrandDay/shop/shopProductLoad",
                                            "userId": "10299171",
                                            "actId": "jdGreeSuperBrandDay",
                                            buyerNick
                                        }
                                    }
                                })
                            }
                        )
                        for (let _ of this.haskey(product, 'data.data')) {
                            console.log("子任务:", _.shopTitle)
                            let s = await this.curl({
                                    'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/mission/completeMission?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                                    json: this.dmCreateSign({
                                        "jsonRpc": "2.0",
                                        "params": {
                                            "commonParameter": {
                                                "m": "POST",
                                                "sign": "acb1ce6cdad22bbc3aae9a8139d7c8e1",
                                                "timestamp": 1713170881618,
                                                "userId": "10299171"
                                            },
                                            "admJson": {
                                                "missionType": i.type,
                                                "buyerNick": buyerNick,
                                                "goodsId": _.shopId,
                                                "method": "/jdGreeSuperBrandDay/mission/completeMission",
                                                "userId": "10299171",
                                                "actId": "jdGreeSuperBrandDay"
                                            }
                                        }
                                    })
                                }
                            )
                            console.log(this.haskey(s, 'data.data.remark'))
                            if (this.haskey(s, 'data.data.jdBeanNum')) {
                                console.log('获得京豆:', s.data.data.jdBeanNum)
                                beans = beans + s.data.data.jdBeanNum
                            }
                            if (this.haskey(s, 'data.data.card.id')) {
                                console.log('获得卡:', s.data.data.card.awardName)
                            }
                            await this.wait(1000)
                        }
                        break
                    case ' specialSign':
                        console.log('正在运行:', i.missionName, i.type)
                        for (let j = 0; j<((i.dayTop - (i.hasGotNum || 0)) || 1); j++) {
                            let s = await this.curl({
                                    'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/mission/completeMission?mix_nick=${buyerNick}`,
                                    json: this.dmCreateSign({
                                        "jsonRpc": "2.0",
                                        "params": {
                                            "commonParameter": {
                                                "m": "POST",
                                                "sign": "483652713a93f651c8fbf78144c0d897",
                                                "timestamp": this.timestamp,
                                                "userId": 10299171
                                            },
                                            "admJson": {
                                                "missionType": i.type,
                                                "method": "/jdGreeSuperBrandDay/mission/completeMission",
                                                "userId": 10299171,
                                                "actId": "jdGreeSuperBrandDay",
                                                buyerNick
                                            }
                                        }
                                    })
                                }
                            )
                            console.log(this.haskey(s, 'data.data.remark'))
                            if (this.haskey(s, 'data.data.jdBeanNum')) {
                                console.log('获得京豆:', s.data.data.jdBeanNum)
                                beans = beans + s.data.data.jdBeanNum
                            }
                            if (this.haskey(s, 'data.data.card.id')) {
                                console.log('获得卡:', s.data.data.card.awardName)
                            }
                            await this.wait(this.rand(500, 2000))
                        }
                        break
                }
            }
            else {
                console.log(`任务完成:`, i.missionName)
            }
        }
        await this.wait(1000)
        let card = await this.curl({
                'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/card/getInfo?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                json: {
                    "jsonRpc": "2.0",
                    "params": {
                        "commonParameter": {
                            "m": "POST",
                            "sign": "fde36adf5d76e0e006ab79eeb409fb35",
                            "timestamp": 1713181793395,
                            "userId": "10299171"
                        },
                        "admJson": {
                            "method": "/jdGreeSuperBrandDay/card/getInfo",
                            "userId": "10299171",
                            "actId": "jdGreeSuperBrandDay",
                            buyerNick
                        }
                    }
                }
            }
        )
        let allPowerful = null
        let full = []
        let empty = []
        for (let i of this.haskey(card, 'data.data')) {
            if (i.awardType == 'allPowerful') {
                allPowerful = i
            }
            else if (i.cardNum>0) {
                full.push(i)
            }
            else {
                empty.push(i)
            }
        }
        if (empty.length == 1 && allPowerful.cardNum>0) {
            let trans = await this.curl({
                    'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/card/transitionCard?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                    json: {
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "m": "POST",
                                "sign": "fde36adf5d76e0e006ab79eeb409fb35",
                                "timestamp": 1713181793395,
                                "userId": "10299171"
                            },
                            "admJson": {
                                "targetCardId": empty[0].id,
                                "method": "/jdGreeSuperBrandDay/card/transitionCard",
                                "userId": "10299171",
                                "actId": "jdGreeSuperBrandDay",
                                buyerNick
                            }
                        }
                    }
                }
            )
            console.log("兑换:", empty[0].awardName, this.dumps(trans))
            if (this.haskey(trans, "errorMessage", "兑换成功")) {
                let comp = await this.curl({
                        'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/card/compositeCard?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                        json: {
                            "jsonRpc": "2.0",
                            "params": {
                                "commonParameter": {
                                    "m": "POST",
                                    "sign": "fde36adf5d76e0e006ab79eeb409fb35",
                                    "timestamp": 1713181793395,
                                    "userId": "10299171"
                                },
                                "admJson": {
                                    "method": "/jdGreeSuperBrandDay/card/compositeCard",
                                    "userId": "10299171",
                                    "actId": "jdGreeSuperBrandDay",
                                    buyerNick
                                }
                            }
                        }
                    }
                )
                console.log("合成共鉴云镜卡", this.haskey(comp, 'data.data.msg'))
            }
        }
        else if (full.length == 4) {
            let comp = await this.curl({
                    'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/card/compositeCard?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                    json: {
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "m": "POST",
                                "sign": "fde36adf5d76e0e006ab79eeb409fb35",
                                "timestamp": 1713181793395,
                                "userId": "10299171"
                            },
                            "admJson": {
                                "method": "/jdGreeSuperBrandDay/card/compositeCard",
                                "userId": "10299171",
                                "actId": "jdGreeSuperBrandDay",
                                buyerNick
                            }
                        }
                    }
                }
            )
            console.log("合成共鉴云镜卡", this.haskey(comp, 'data.data.msg'))
        }
        console.log("抽奖中...")
        let draw = await this.curl({
                'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/interactive/drawPost?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                json: this.dmCreateSign({
                    "jsonRpc": "2.0",
                    "params": {
                        "commonParameter": {
                            "m": "POST",
                            "sign": "c14b558ab07007fec378d5ea8bd9f3ca",
                            "timestamp": 1713188375474,
                            "userId": "10299171"
                        },
                        "admJson": {
                            "method": "/jdGreeSuperBrandDay/interactive/drawPost",
                            "userId": "10299171",
                            "actId": "jdGreeSuperBrandDay",
                            buyerNick
                        }
                    }
                })
            }
        )
        if (this.haskey(draw, 'data.data.awardSetting')) {
            console.log(draw.data.data.awardSetting)
        }
        else {
            console.log(this.haskey(draw, 'errorMessage') || draw)
        }
        if (beans>0) {
            this.print(`获得京豆: ${beans}`, p.user)
        }
        let list = await this.curl(
            {
                'url': `https://mpdz-act-dz.isvjcloud.com/dm/front/jdGreeSuperBrandDay/awards/list?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                'json': this.dmCreateSign({
                    "jsonRpc": "2.0",
                    "params": {
                        "commonParameter": {
                            "m": "POST",
                            "sign": "01318582341e551203062cab91c06f5b",
                            "timestamp": this.timestamp,
                            "userId": 10299171
                        },
                        "admJson": {
                            "method": "/jdGreeSuperBrandDay/awards/list",
                            "userId": 10299171,
                            "actId": "jdGreeSuperBrandDay",
                            buyerNick
                        }
                    }
                })
            }
        )
        for (let _ of this.haskey(list, 'data.data.list')) {
            console.log("奖品列表:", _.awardName)
        }
    }

    async extra() {
        await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_jdGree.json`, this.dumps(this.dict), (error) => {
            if (error) return console.log("写入化失败" + error.message);
            console.log("jdGree写入成功");
        })
        if (this.cache.set) {
            console.log(`关闭缓存....`)
            await this.cache.close()
        }
    }

    dmCreateSign(params) {
        let t = params.params.admJson
        var n, r, u, s, o, c, d, l, p, f, h;
        n = "", r = "", u = (new Date).valueOf(), s = r, o = n, c = JSON.stringify(t), d = encodeURIComponent(c),
            l = new RegExp("'", "g"), p = new RegExp("~", "g"), d = d.replace(l, "%27"), d = d.replace(p, "%7E"),
            f = o + "a" + o + "b" + d + "c" + u + s
        params.params.commonParameter.timestamp = u
        params.params.commonParameter.sign = this.md5(f.toLowerCase())
        return params
    }

    async isvToken(p) {
        let cacheKey = this.md5(`${this.fileSalt}_isvObfuscator_${this.userName(p.cookie)}`)
        try {
            var isvObfuscator = await this.cache.get(cacheKey)
        } catch (e) {
        }
        if (!isvObfuscator) {
            var isvObfuscator = await this.curl(this.modules.jdObf.app('isvObfuscator', {
                "url": `https://lzdz1-isv.isvjcloud.com`,
                "id": ""
            }, 'post', p.cookie))
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
}

module.exports = Main;
