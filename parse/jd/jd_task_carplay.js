const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东头文字J"
        this.cron = "36 0,9,21 * * *"
        this.help = 'main'
        this.task = 'local'
        this.import = ['fs', 'jdUrl', 'jdObf', 'fileCache']
    }

    async prepare() {
        this.fileExpire = this.haskey(this.fileCache, 'isvObfuscator_expire') || 1800
        this.fileSalt = this.haskey(this.fileCache, 'isvObfuscator_salt') || "abcdefg"
        this.cache = this.modules["fileCache"]
        await this.cache.connect({file: `${this.dirname}/temp/isvToken.json`})
        try {
            let txt = this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_carplay.json`).toString()
            this.dict = this.loads(txt)
        } catch (e) {
        }
    }

    async main(p) {
        let cookie = p.cookie
        let isvObfuscator = await this.isvToken(p)
        if (!this.haskey(this.dict, `${p.user}.carId`)) {
            for (let i = 0; i<3; i++) {
                var load = await this.curl({
                        'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/activity/load?open_id=&mix_nick=&push_way=2&user_id=`,
                        'json': this.dmCreateSign({
                            "jsonRpc": "2.0",
                            "params": {
                                "commonParameter": {
                                    "appkey": "33694314",
                                    "m": "POST",
                                    "sign": "8747140084354352e0cf1182bd8a50a1",
                                    "timestamp": this.timestamp,
                                    "userId": ""
                                },
                                "admJson": {
                                    "actId": 1760007,
                                    "jdToken": isvObfuscator.token,
                                    "shopId": null,
                                    "method": "/jdCardRunning/activity/load",
                                    "userId": "",
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
            this.dict[p.user] = {buyerNick, actId: "1760007"}
        }
        else {
            var buyerNick = this.dict[p.user].buyerNick
        }
        // let userId = this.haskey(load, 'data.data.missionCustomer.userId') || 10299171
        for (let n = 0; n<2; n++) {
            let state = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/mission/completeState?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                    'json': this.dmCreateSign({
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "appkey": "33694314",
                                "m": "POST",
                                "sign": "01318582341e551203062cab91c06f5b",
                                "timestamp": this.timestamp,
                                "userId": 10299171
                            },
                            "admJson": {
                                "method": "/jdCardRunning/mission/completeState",
                                "userId": 10299171,
                                "actId": 1760007,
                                buyerNick
                            }
                        }
                    })
                }
            )
            if (n == 0) {
                this.assert(this.haskey(state, 'data.data'), '没有获取到数据')
                let user = this.userName(cookie)
            }
            for (let i of this.haskey(state, 'data.data')) {
                if (!i.isComplete) {
                    switch (i.type) {
                        case 'openCard':
                        case 'shareAct':
                        case  'payTrade':
                        case 'bingCar':
                            console.log("跳过运行:", i.missionName)
                            break
                        default:
                            console.log('正在运行:', i.missionName)
                            for (let j = 0; j<((i.dayTop - (i.hasGotNum || 0)) || 1); j++) {
                                let json = this.dmCreateSign({
                                    "jsonRpc": "2.0",
                                    "params": {
                                        "commonParameter": {
                                            "appkey": "33694314",
                                            "m": "POST",
                                            "sign": "483652713a93f651c8fbf78144c0d897",
                                            "timestamp": this.timestamp,
                                            "userId": 10299171
                                        },
                                        "admJson": {
                                            "missionType": i.type,
                                            "method": "/jdCardRunning/mission/completeMission",
                                            "userId": 10299171,
                                            "actId": 1760007,
                                            buyerNick
                                        }
                                    }
                                })
                                if (i.type == 'collectShop') {
                                    let shop = await this.curl({
                                            'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/cusShop/getCusShop?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                                            json: this.dmCreateSign({
                                                "jsonRpc": "2.0",
                                                "params": {
                                                    "commonParameter": {
                                                        "appkey": "33694314",
                                                        "m": "POST",
                                                        "sign": "fe4a2b637d048202c10bf203d1fcd065",
                                                        "timestamp": this.timestamp,
                                                        "userId": 10299171
                                                    },
                                                    "admJson": {
                                                        "method": "/jdCardRunning/cusShop/getCusShop",
                                                        "userId": 10299171,
                                                        "actId": 1760007,
                                                        buyerNick
                                                    }
                                                }
                                            })
                                        }
                                    )
                                    json.params.admJson.shopId = this.haskey(shop, 'data.data.cusShop.userId')
                                }
                                else if (i.type == "addCart") {
                                    let product = await this.curl({
                                            'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/cusShop/getCusShopProduct?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                                            json: this.dmCreateSign({
                                                "jsonRpc": "2.0",
                                                "params": {
                                                    "commonParameter": {
                                                        "appkey": "33694314",
                                                        "m": "POST",
                                                        "sign": "fe4a2b637d048202c10bf203d1fcd065",
                                                        "timestamp": this.timestamp,
                                                        "userId": 10299171
                                                    },
                                                    "admJson": {
                                                        "method": "/jdCardRunning/cusShop/getCusShop",
                                                        "userId": 10299171,
                                                        "actId": 1760007,
                                                        buyerNick
                                                    }
                                                }
                                            })
                                        }
                                    )
                                    json.params.admJson.goodsNumId = this.haskey(product, 'data.data.cusShopProduct.numId')
                                }
                                let s = await this.curl({
                                        'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/mission/completeMission?mix_nick=${buyerNick}`,
                                        json: this.dmCreateSign(json)
                                    }
                                )
                                console.log(this.haskey(s, 'data.data.remark'))
                                await this.wait(this.rand(500, 2000))
                            }
                            break
                    }
                }
                else if (n == 0) {
                    console.log(`任务完成:`, i.missionName)
                }
            }
            await this.wait(1000)
        }
        let carInfo = await this.curl({
                'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/carInfo/getCarInfo?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                json: this.dmCreateSign({
                    "jsonRpc": "2.0",
                    "params": {
                        "commonParameter": {
                            "appkey": "33694314",
                            "m": "POST",
                            "sign": "251b47e7191893293e351703f5962055",
                            "timestamp": this.timestamp,
                            "userId": 10299171
                        },
                        "admJson": {
                            "method": "/jdCardRunning/carInfo/getCarInfo",
                            "userId": 10299171,
                            "actId": 1760007,
                            buyerNick
                        }
                    }
                })
            }
        )
        var carId
        if (this.haskey(carInfo, 'data.data')) {
            carInfo.data.data.forEach(function(v, k) {
                if (v.isUnlock) {
                    carId = v.id
                }
            })
        }
        if (!carId) {
            carId = this.dict[p.user].carId || 1
        }
        else {
            this.dict[p.user].carId = carId
        }
        for (let i = 0; i<3; i++) {
            let game = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/game/playGame?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                    json: this.dmCreateSign({
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "appkey": "33694314",
                                "m": "POST",
                                "sign": "5999962d9eacf5fa58ad9c68ad359060",
                                "timestamp": this.timestamp,
                                "userId": 10299171
                            },
                            "admJson": {
                                carId,
                                "carName": "电瓶车",
                                "method": "/jdCardRunning/game/playGame",
                                "userId": 10299171,
                                "actId": 1760007,
                                buyerNick
                            }
                        }
                    })
                }
            )
            if (!this.haskey(game, 'data.data.gameLogId')) {
                console.log("可能没有游戏次数")
                break
            }
            let gameLogId = game.data.data.gameLogId
            await this.wait(this.random(2000, 3000))
            let r = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/game/sendGameAward?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                    json: this.dmCreateSign({
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "appkey": "33694314",
                                "m": "POST",
                                "sign": "c5b454977badf09e6210518195a8d043",
                                "timestamp": this.timestamp,
                                "userId": 10299171
                            },
                            "admJson": {
                                gameLogId,
                                "point": 1000,
                                "method": "/jdCardRunning/game/sendGameAward",
                                "userId": 10299171,
                                "actId": 1760007,
                                buyerNick
                            }
                        }
                    })
                }
            )
            console.log("获得游戏积分", this.haskey(r, 'success'))
            await this.wait(1000)
        }
        let bing = await this.curl({
                'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/activity/load?open_id=&mix_nick=${buyerNick}&push_way=2&user_id=10299171`,
                json: this.dmCreateSign({
                    "jsonRpc": "2.0",
                    "params": {
                        "commonParameter": {
                            "appkey": "33694314",
                            "m": "POST",
                            "sign": "de718d86d6f8a7a8780c9b73b8246fe2",
                            "timestamp": this.timestamp,
                            "userId": 10299171
                        },
                        "admJson": {
                            "actId": 1760007,
                            "jdToken": isvObfuscator.token,
                            "shopId": null,
                            "method": "/jdCardRunning/activity/load",
                            "userId": 10299171,
                            buyerNick
                        }
                    }
                })
            }
        )
        if (this.haskey(bing, 'data.data.missionCustomer.totalPoint')) {
            this.print(`当前分数: ${bing.data.data.missionCustomer.remainPoint}`, p.user)
            this.dict[p.user].energyValue = bing.data.data.missionCustomer.totalPoint
            this.dict[p.user].point = bing.data.data.missionCustomer.remainPoint
        }
    }

    async extra() {
        await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_carplay.json`, this.dumps(this.dict), (error) => {
            if (error) return console.log("写入化失败" + error.message);
            console.log("carplay写入成功");
        })
        if (this.dumps(this.dict) != "{}") {
            for (let k of this.cookies.help) {
                let z = this.userName(k)
                for (let i in this.dict) {
                    if (!this.dict[i].complete && this.dict[i].actId == '1760007') {
                        console.log(`账号 ${i} 助力账号 ${z}`)
                        let s = await this.curl({
                                'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/mission/completeMission?open_id=&mix_nick=${this.dict[i].buyerNick}`,
                                json: this.dmCreateSign({
                                    "jsonRpc": "2.0",
                                    "params": {
                                        "commonParameter": {
                                            "appkey": "33694314",
                                            "m": "POST",
                                            "sign": "848002a32f83fabe3c578029ecf884c0",
                                            "timestamp": this.timestamp,
                                            "userId": 10299171
                                        },
                                        "admJson": {
                                            "missionType": "shareAct",
                                            "inviterNick": this.dict[z].buyerNick,
                                            "method": "/jdCardRunning/mission/completeMission",
                                            "userId": 10299171,
                                            "actId": 1760007,
                                            "buyerNick": this.dict[i].buyerNick
                                        }
                                    }
                                })
                            }
                        )
                        console.log(this.haskey(s, 'data.data.remark') || this.haskey(s, 'errorMessage'))
                        let error = this.haskey(s, 'errorMessage') || ''
                        await this.wait(1000)
                        if (error.includes('上限')) {
                            this.dict[i].complete = 1
                        }
                    }
                }
            }
            for (let i in this.dict) {
                this.dict[i].complete = 0
            }
        }
        if (this.cache.set) {
            console.log(`关闭缓存....`)
            await this.cache.close()
        }
    }

    dmCreateSign(params) {
        let t = params.params.admJson
        let r = (new Date).valueOf()
        let n = "85623312044258464325227666883546";
        let a = "25747717";
        let o = JSON.stringify(t)
        let s = encodeURIComponent(o)
        let c = new RegExp("'", "g")
        let A = new RegExp("~", "g")
        s = s.replace(c, "%27")
        s = s.replace(A, "%7E")
        let d = a + "appKey" + a + "admJson" + s + "timestamp" + r + n
        params.params.commonParameter.appkey = a
        params.params.commonParameter.timestamp = r
        params.params.commonParameter.sign = this.md5(d.toLowerCase())
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
