const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东头文字J兑换"
        this.cron = "6 6 6 6 6"
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
        this.assert(isvObfuscator.token, "没有获取到isvToken")
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
        if (Object.keys(this.plan).length<1) {
            let exchangeLoad = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/exchange/exchangeLoad?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                    json: this.dmCreateSign({
                        "jsonRpc": "2.0",
                        "params": {
                            "commonParameter": {
                                "appkey": "21699045",
                                "m": "POST",
                                "sign": "68d02291f8b4408c04892a34096ead81",
                                "timestamp": this.timestamp,
                                "userId": 10299171
                            },
                            "admJson": {
                                "method": "/jdCardRunning/exchange/exchangeLoad",
                                "userId": 10299171,
                                "actId": 1760007,
                                buyerNick
                            }
                        }
                    })
                }
            )
            if (this.haskey(exchangeLoad, 'data.data.awardSettings')) {
                this.plan = (this.column(exchangeLoad.data.data.awardSettings, ['awardDes', 'id'], 'awardName'))
            }
        }
        if (Object.keys(this.plan).length>0) {
            if (this.profile.reward && this.plan[`${this.profile.reward}京豆`]) {
                console.log(`即将兑换: ${this.profile.reward}京豆, 使用分数: ${this.plan[`${this.profile.reward}京豆`].awardDes}, 兑换id: ${this.plan[`${this.profile.reward}京豆`].id}`)
                let r = await this.curl({
                        'url': `https://mpdz-car-dz.isvjcloud.com/dm/front/jdCardRunning/exchange/exchangeJdMarket?open_id=&mix_nick=${buyerNick}&user_id=10299171`,
                        json: this.dmCreateSign({
                            "jsonRpc": "2.0",
                            "params": {
                                "commonParameter": {
                                    "appkey": "21699045",
                                    "m": "POST",
                                    "sign": "759451083317110114e49c9534f2c250",
                                    "timestamp": 1656250808526,
                                    "userId": 10299171
                                },
                                "admJson": {
                                    "awardId": this.plan[`${this.profile.reward}京豆`].id,
                                    "method": "/jdCardRunning/exchange/exchangeJdMarket",
                                    "userId": 10299171,
                                    "actId": 1760007,
                                    buyerNick
                                }
                            }
                        })
                    }
                )
                let msg = this.haskey(r, 'errorMessage') || ''
                if (msg.includes('成功')) {
                    this.print(`成功兑换: ${this.profile.reward}京豆`, p.user)
                }
                else if (msg.includes('本月京豆已兑完')) {
                    this.jump = 1
                    console.log('本月京豆已兑完,退出运行')
                }
                else {
                    console.log(msg || '错误了')
                }
            }
            else {
                console.log(`请先正确设置reward兑换选项`)
            }
        }
    }

    async extra() {
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
