const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东头文字J兑换"
        this.cron = "0 */2 * * *"
        this.help = 2
        this.task = 'local'
        this.import = ['fs']
    }

    async prepare() {
        try {
            let txt = this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_carplay.json`).toString()
            this.dict = this.loads(txt)
        } catch (e) {
            console.log(e)
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let timeout = 3000
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
        let energyValue
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
            energyValue = f.data.energyValue
        }
        let gifts = [{
            "marketValue": "5.0",
            "exchangeType": "fiveExchange",
            "isExchange": "0",
            "useEnergyValue": "2000"
        }, {
            "marketValue": "20.0",
            "exchangeType": "twentyExchange",
            "isExchange": "0",
            "useEnergyValue": "3000"
        }, {
            "marketValue": "50.0",
            "exchangeType": "fiftyExchange",
            "isExchange": "0",
            "useEnergyValue": "5000"
        }, {
            "marketValue": "500.0",
            "exchangeType": "fiveHundredExchange",
            "isExchange": "0",
            "useEnergyValue": "20000"
        }, {
            "marketValue": "1000.0",
            "exchangeType": "oneThousandExchange",
            "isExchange": "0",
            "useEnergyValue": "35000"
        }]
        let exchangeType
        let aa = []
        if (energyValue) {
            for (let i of gifts) {
                if (energyValue>=parseInt(i.useEnergyValue)) {
                    exchangeType = i.exchangeType
                    aa.push(i)
                }
            }
        }
        else {
            exchangeType = "oneThousandExchange"
            aa = [gifts]
        }
        if (exchangeType) {
            console.log(`剩余积分:`, energyValue, `正在兑换:`, exchangeType)
            let reward = await this.curl({
                    'url': `https://mpdz-car-dz.isvjcloud.com/ql/front/exchangeMarket`,
                    'body': {
                        actId,
                        buyerNick,
                        "type": exchangeType
                    }, timeout,
                    referer: 'https://mpdz-car-dz.isvjcloud.com'
                }
            )
            console.log(reward)
            if (this.haskey(reward, 'errorMsg', '啊哦~来晚了！本月京豆已兑完')) {
                console.log("没豆子了,跳出兑换")
                this.jump = 1
            }
            else {
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
                    energyValue = f.data.energyValue
                    // this.notices(`当前积分: ${f.data.energyValue}`, p.user)
                }
            }
        }
        else {
            console.log(energyValue)
        }
    }

    async extra() {
        await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_carplay.json`, this.dumps(this.dict), (error) => {
            if (error) return console.log("写入化失败" + error.message);
            console.log("carplay写入成功");
        })
    }
}

module.exports = Main;
