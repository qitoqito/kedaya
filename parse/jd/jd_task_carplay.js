const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东头文字J"
        this.cron = "36 0,9,21 * * *"
        this.help = 'main'
        this.task = 'local'
        this.import = ['fs']
    }

    async prepare() {
        try {
            let txt = this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_carplay.json`).toString()
            this.dict = this.loads(txt)
        } catch (e) {
        }
        this.inviteDict = {}
    }

    async main(p) {
        let cookie = p.cookie
        let timeout = 500
        try {
            let data = this.dict[p.user] || {}
            if (data.buyerNick) {
                var buyerNick = data.buyerNick
            }
            else {
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
                // console.log(getFansInfo)
                this.assert(this.haskey(getFansInfo, 'msg'), "没有获取到用户信息")
                var buyerNick = getFansInfo.msg
                this.dict[p.user] = {
                    buyerNick
                }
            }
            let actId = 1760007
            console.log(buyerNick)
            this.inviteDict[this.userPin(cookie)] = buyerNick
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
                        await this.wait(500)
                        continue
                    }
                    console.log(i, d.msg || d.errorMsg)
                    if (d.msg == '今日已完成该任务') {
                        break
                    }
                    if (!this.haskey(d, 'succ')) {
                        break
                    }
                    await this.wait(500)
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
                        await this.wait(500)
                        continue
                    }
                    if (!this.haskey(follow, 'succ')) {
                        break
                    }
                    console.log('follow', follow.msg)
                    if (follow.msg == '今日已完成该任务') {
                        break
                    }
                    await this.wait(500)
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
                    await this.wait(500)
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
                    await this.wait(500)
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
                    await this.wait(500)
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
                        await this.wait(500)
                        continue
                    }
                    if (this.haskey(start, 'succ')) {
                        await this.wait(5500)
                        let game = await this.curl({
                                'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/carPlayUpdate`,
                                body: {
                                    actId,
                                    buyerNick,
                                    "behavior": "run",
                                    "energyValue": this.rand(200000, 50000)
                                }, timeout,
                                referer: 'https://mpdz-car-dz.isvjcloud.com'
                            }
                        )
                        console.log('game', this.haskey(game, 'data') || this.haskey(game, 'errorMsg'))
                        if (!this.haskey(game, 'succ')) {
                            break
                        }
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
                this.dict[p.user].energyValue = f.data.energyValue
                this.notices(`当前积分: ${f.data.energyValue}`, p.user)
            }
            //
        } catch
            (e) {
            console.log(e)
        }
    }

    async extra() {
        await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_carplay.json`, this.dumps(this.dict), (error) => {
            if (error) return console.log("写入化失败" + error.message);
            console.log("carplay写入成功");
        })
        if (this.dumps(this.inviteDict) != '{}') {
            let help = {}
            for (let cookie of this.cookies['help']) {
                let pin = this.userPin(cookie)
                if (this.inviteDict[pin]) {
                    help[this.inviteDict[pin]] = pin
                }
            }
            let s = Object.keys(help)
            let n = this.rand(1, 23)
            let count = s.length
            for (let i in this.inviteDict) {
                try {
                    let inviter = s[n % count]
                    n++
                    if (inviter == this.inviteDict[i]) {
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
                                "buyerNick": this.inviteDict[i],
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

module.exports = Main;
