const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东头文字J"
        this.cron = "36 0,9,21 * * *"
        this.help = 'main'
        this.task = 'local'
        // this.work = 16
        // this.thread = 3
        this.import = ['fs', 'jdUrl']
    }

    async prepare() {
        // try {
        //     let txt = this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_carplay.json`).toString()
        //     this.dict = this.loads(txt)
        // } catch (e) {
        // }
        this.inviteDict = {}
    }

    async main(p) {
        let cookie = p.cookie
        let isvObfuscator = await this.curl(this.modules.jdUrl.app('isvObfuscator', {
            "url": `https://mpdz-car-dz.isvjcloud.com`,
            "id": ""
        }, 'post', cookie))
        let load = await this.curl({
                'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/activity/load?open_id=&mix_nick=&push_way=2&user_id=`,
                'json': {
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
                },
            }
        )
        if (this.haskey(load, 'errorMessage', '获取京东用户信息失败~')) {
            console.log('获取京东用户信息失败~')
            return
        }
        let buyerNick = this.haskey(load, 'data.data.missionCustomer.buyerNick')
        // let userId = this.haskey(load, 'data.data.missionCustomer.userId') || 10299171
        for (let n = 0; n<2; n++) {
            let state = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/mission/completeState?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                    'json': {
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
                    }
                }
            )
            if (n == 0) {
                this.assert(this.haskey(state, 'data.data'), '没有获取到数据')
                let user = this.userName(cookie)
                if (this.cookies.help.includes(cookie)) {
                    this.inviteDict[user] = {
                        buyerNick
                    }
                }
                this.dict[user] = {
                    buyerNick
                }
            }
            for (let i of this.haskey(state, 'data.data')) {
                if (!i.isComplete) {
                    // console.log(i)
                    switch (i.type) {
                        case "addCart":
                        case "specialSign":
                        case "collectShop":
                        case "viewCarMeet":
                        case "viewCarButler":
                        case "viewPlus":
                        case "viewCarLife":
                        case "viewCarChannel":
                        case "viewCommodity":
                            console.log('正在运行:', i.missionName)
                            // let shopList=[1000088545,102074]
                            for (let j = 0; j<((i.dayTop - (i.hasGotNum || 0)) || 1); j++) {
                                let json = {
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
                                }
                                if (i.type == 'collectShop') {
                                    let shop = await this.curl({
                                            'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/cusShop/getCusShop?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                                            json: {
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
                                            }
                                        }
                                    )
                                    json.params.admJson.shopId = this.haskey(shop, 'data.data.cusShop.shopId')
                                }
                                else if (i.type == "addCart") {
                                    let product = await this.curl({
                                            'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/cusShop/getCusShopProduct?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                                            json: {
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
                                            }
                                        }
                                    )
                                    json.params.admJson.goodsNumId = this.haskey(product, 'data.data.cusShopProduct.numId')
                                }
                                let s = await this.curl({
                                        'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/mission/completeMission?mix_nick=${buyerNick}`,
                                        json
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
        for (let i = 0; i<3; i++) {
            let game = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/game/playGame?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                    json: {
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
                                "carId": 1,
                                "carName": "电瓶车",
                                "method": "/jdCardRunning/game/playGame",
                                "userId": 10299171,
                                "actId": 1760007,
                                buyerNick
                            }
                        }
                    }
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
                    json: {
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
                                "point": 100,
                                "method": "/jdCardRunning/game/sendGameAward",
                                "userId": 10299171,
                                "actId": 1760007,
                                buyerNick
                            }
                        }
                    }
                }
            )
            console.log("获得积分100", this.haskey(r, 'success'))
            await this.wait(1000)
        }
    }

    async extra() {
        if (this.dumps(this.inviteDict) != "{}") {
            for (let z in this.inviteDict) {
                for (let i in this.dict) {
                    if (!this.dict[i].complete) {
                        console.log(`账号 ${i} 助力账号${z}`)
                        let s = await this.curl({
                                'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/mission/completeMission?open_id=&mix_nick=${this.dict[i].buyerNick}`,
                                json: {
                                    "jsonRpc": "2.0",
                                    "params": {
                                        "commonParameter": {
                                            "appkey": "33694314",
                                            "m": "POST",
                                            "sign": "848002a32f83fabe3c578029ecf884c0",
                                            "timestamp": 1654872785601,
                                            "userId": 10299171
                                        },
                                        "admJson": {
                                            "missionType": "shareAct",
                                            "inviterNick": this.inviteDict[z].buyerNick,
                                            "method": "/jdCardRunning/mission/completeMission",
                                            "userId": 10299171,
                                            "actId": 1760007,
                                            "buyerNick": this.dict[i].buyerNick
                                        }
                                    }
                                }
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
        }
        // await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_carplay.json`, this.dumps(this.dict), (error) => {
        //     if (error) return console.log("写入化失败" + error.message);
        //     console.log("carplay写入成功");
        // })
        // if (this.dumps(this.inviteDict) != '{}') {
        //     let help = {}
        //     for (let cookie of this.cookies['help']) {
        //         let pin = this.userPin(cookie)
        //         if (this.inviteDict[pin]) {
        //             help[this.inviteDict[pin]] = pin
        //         }
        //     }
        //     let s = Object.keys(help)
        //     let n = this.rand(1, 23)
        //     let count = s.length
        //     for (let i in this.inviteDict) {
        //         try {
        //             let inviter = s[n % count]
        //             n++
        //             if (inviter == this.inviteDict[i]) {
        //                 inviter = s[n % count]
        //                 n++
        //             }
        //             let share = await this.curl({
        //                     'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/participantBehavior`,
        //                     body: {
        //                         "actId": "1760007",
        //                         "buyerNick": inviter,
        //                         "behavior": "share"
        //                     }
        //                 }
        //             )
        //             let ss = await this.curl({
        //                     'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/participantBehavior`,
        //                     body: {
        //                         "actId": "1760007",
        //                         "buyerNick": this.inviteDict[i],
        //                         "inviterNick": inviter,
        //                         "behavior": "inviteHelp"
        //                     }
        //                 }
        //             )
        //             console.log(`${i} 正在给 ${help[inviter]} 助力: ${ss.msg || ss.errorMsg}`)
        //         } catch (e) {
        //         }
        //     }
        // }
    }
}

module.exports = Main;
