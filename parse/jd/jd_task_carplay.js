const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东头文字J"
        this.cron = "36 6,21 * * *"
        this.help = 'main'
        this.task = 'local'
    }

    async main(p) {
        let cookie = p.cookie
        let timeout = 5000
        try {
            let isvObfuscator = await this.curl({
                url: 'https://api.m.jd.com/client.action',
                form: 'functionId=isvObfuscator&body=%7B%22id%22%3A%22%22%2C%22url%22%3A%22https%3A%2F%2Fddsj-dz.isvjcloud.com%22%7D&uuid=5162ca82aed35fc52e8&client=apple&clientVersion=10.0.10&st=1631884203742&sv=112&sign=fd40dc1c65d20881d92afe96c4aec3d0',
                cookie: p.cookie
            })
            for (let i of Array(3)) {
                var getFansInfo = await this.curl({
                        'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/getFansInfo`,
                        'body': {
                            "data": isvObfuscator.token,
                            "source": "01",
                            "actId": "1760007"
                        }, timeout,
                        referer: 'https://mpdz-car-dz.isvjcloud.com'
                    }
                )
                if (this.haskey(getFansInfo, 'msg')) {
                    break
                }
            }
            this.assert(this.haskey(getFansInfo, 'msg'), "没有获取到用户信息")
            let buyerNick = getFansInfo.msg
            console.log(buyerNick)
            this.dict[this.userPin(cookie)] = buyerNick
            let actId = this.haskey(getFansInfo, 'data.actId') || 1760007
            let signin = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/signGetEnergy`,
                    'body': {
                        actId,
                        buyerNick,
                        "energyValue": 10,
                        "day": 1
                    }, timeout,
                    referer: 'https://mpdz-car-dz.isvjcloud.com'
                }
            )
            console.log('signin', this.haskey(signin, 'msg') || this.haskey(signin, 'errorMsg'))
            let t = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/loadTaskTimes`,
                    body: {
                        actId,
                        buyerNick,
                    }, timeout,
                    referer: 'https://mpdz-car-dz.isvjcloud.com'
                }
            )
            let task = ['browseItem', 'browseShop', 'carSelection', 'refueling']
            for (let i of task) {
                for (let n = 0; n<3 - (this.haskey(t, `data.${i}`) || 0); n++) {
                    let d = await this.curl({
                            'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/participantBehavior`,
                            body: {
                                actId,
                                buyerNick,
                                "behavior": i
                            },
                            timeout,
                            referer: 'https://mpdz-car-dz.isvjcloud.com'
                        }
                    )
                    if (!d) {
                        await this.wait(5000)
                        continue
                    }
                    console.log(i, d.msg || d.errorMsg)
                    if (d.msg == '今日已完成该任务') {
                        break
                    }
                    if (!this.haskey(d, 'succ')) {
                        break
                    }
                    await this.wait(5000)
                }
            }
            for (let n = 0; n<3 - (this.haskey(t, `data.favouriteShop`) || 0); n++) {
                let loadShopGroup = await this.curl({
                        'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/loadShopGroup`,
                        body: {
                            actId,
                            buyerNick,
                            "shopGroupType": "favouriteShop"
                        }, timeout,
                        referer: 'https://mpdz-car-dz.isvjcloud.com'
                    }
                )
                if (this.haskey(loadShopGroup, 'succ')) {
                    let follow = await this.curl({
                            'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/favouriteShopSingle`,
                            body: {
                                actId,
                                buyerNick,
                                "shopId": loadShopGroup.data.shopId
                            }, timeout,
                            referer: 'https://mpdz-car-dz.isvjcloud.com'
                        }
                    )
                    if (!follow) {
                        await this.wait(5000)
                        continue
                    }
                    if (!this.haskey(follow, 'succ')) {
                        break
                    }
                    console.log('follow', follow.msg)
                    if (follow.msg == '今日已完成该任务') {
                        break
                    }
                    await this.wait(5000)
                }
                else {
                    console.log('follow', this.haskey(loadShopGroup, 'errorMsg'))
                    break
                }
            }
            for (let n = 0; n<3 - (this.haskey(t, `data.browseItem`) || 0); n++) {
                let loadItemGroup = await this.curl({
                        'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/loadItemGroup`,
                        body: {
                            actId,
                            buyerNick,
                            "itemGroupType": "browseItem"
                        }, timeout,
                        referer: 'https://mpdz-car-dz.isvjcloud.com'
                    }
                )
                if (!loadItemGroup) {
                    await this.wait(5000)
                    continue
                }
                if (loadItemGroup.succ) {
                    let add = await this.curl({
                            'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/addItemSingle`,
                            body: {
                                actId,
                                buyerNick,
                                "shopId": loadItemGroup.data.shopId,
                                "itemId": loadItemGroup.data.itemId,
                            }, timeout,
                            referer: 'https://mpdz-car-dz.isvjcloud.com'
                        }
                    )
                    if (!this.haskey(add, 'succ')) {
                        break
                    }
                    console.log('add', add.msg)
                    await this.wait(5000)
                }
                else {
                    console.log('add', loadItemGroup.errorMsg)
                    break
                }
            }
            let order = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/loadFinishedOrderState`,
                    body: {
                        actId,
                        buyerNick,
                    }, timeout,
                    referer: 'https://mpdz-car-dz.isvjcloud.com'
                }
            )
            console.log('order', this.haskey(order, 'msg') || this.haskey(order, 'errorMsg'))
            let times = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/checkCarPlayTimes`,
                    body: {
                        actId,
                        buyerNick,
                    }, timeout,
                    referer: 'https://mpdz-car-dz.isvjcloud.com'
                }
            )
            if ((this.haskey(times, 'data.times') || 0)>0) {
                for (let n of Array(times.data.times)) {
                    let start = await this.curl({
                            'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/carPlayTimesReduce`,
                            body: {
                                actId,
                                buyerNick,
                            }, timeout,
                            referer: 'https://mpdz-car-dz.isvjcloud.com'
                        }
                    )
                    if (!start) {
                        await this.wait(5000)
                        continue
                    }
                    if (this.haskey(start, 'succ')) {
                        await this.wait(5000)
                        let game = await this.curl({
                                'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/carPlayUpdate`,
                                body: {
                                    actId,
                                    buyerNick,
                                    "behavior": "run",
                                    "energyValue": this.rand(200000, 500000)
                                }, timeout,
                                referer: 'https://mpdz-car-dz.isvjcloud.com'
                            }
                        )
                        console.log('game', this.haskey(game, 'msg') || this.haskey(game, 'errorMsg'))
                        if (!this.haskey(game, 'succ')) {
                            break
                        }
                        await this.wait(5000)
                    }
                    else {
                        break
                    }
                }
            }
            let f = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/getEnergyData`,
                    'body': {
                        actId,
                        buyerNick
                    }, timeout,
                    referer: 'https://mpdz-car-dz.isvjcloud.com'
                }
            )
            if (this.haskey(f, 'data.energyValue')) {
                console.log(`当前积分: ${f.data.energyValue}`)
                this.notices(`当前积分: ${f.data.energyValue}`, p.user)
            }
            //
        } catch
            (e) {
            console.log(e)
        }
    }

    async extra() {
        if (this.dumps(this.dict) != '{}') {
            let help = {}
            for (let cookie of this.cookies['help']) {
                let pin = this.userPin(cookie)
                if (this.dict[pin]) {
                    help[this.dict[pin]] = pin
                }
            }
            let s = Object.keys(help)
            let n = 1
            let count = s.length
            for (let i in this.dict) {
                try {
                    let inviter = s[n % count]
                    n++
                    if (inviter == this.dict[i]) {
                        inviter = s[n % count]
                        n++
                    }
                    let share = await this.curl({
                            'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/participantBehavior`,
                            body: {
                                "actId": "1760007",
                                "buyerNick": inviter,
                                "behavior": "share"
                            }
                        }
                    )
                    let ss = await this.curl({
                            'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/participantBehavior`,
                            body: {
                                "actId": "1760007",
                                "buyerNick": this.dict[i],
                                "inviterNick": inviter,
                                "behavior": "inviteHelp"
                            }
                        }
                    )
                    console.log(`${i} 正在给 ${help[inviter]} 助力: ${ss.msg || ss.errorMsg}`)
                } catch (e) {
                }
            }
        }
    }
}

module
    .exports = Main;
