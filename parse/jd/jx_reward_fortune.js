const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京喜财富岛红包兑换"
        // this.cron = "0,30 * * * *"
        this.timer = '00 00 *'
        this.thread = 2
        this.task = 'local'
        this.import = ['jdAlgo']
        this.readme = `兑换金额: filename_custom=兑换1|兑换2\n只运行账户: filename_work=pin1|pin2\n建议只跑要兑换的账号`
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': '92a36',
            'type': 'pingou',
            verify: 1,
            fp: '9465293893212901'
        })
        for (let i of this.cookies.main) {
            let ExchangeState = await this.algo.curl({
                url: `https://m.jingxi.com/jxbfd/user/ExchangeState?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=1628157961921&ptag=7155.9.47&dwType=2&_stk=_cfd_t%2CbizCode%2CdwEnv%2CdwType%2Cptag%2Csource%2CstrZone&_ste=1`,
                cookie: i
            })
            let d = {}
            if (this.haskey(ExchangeState, 'hongbao')) {
                this.dict = this.column(ExchangeState.hongbao, '', 'ddwPaperMoney');
                this.dict.hongbaopool = ExchangeState.hongbaopool
                break
            }
        }
    }

    async main(p) {
        let cookie = p.cookie
        let array = [111000, 100000, 11000, 10000, 1000, 500, 200, 100, 50]
        if (this.custom) {
            array = this.getValue('custom').map(d => d * 1000)
        }
        for (let i of array) {
            if (this.dict[i]) {
                let s = await this.algo.curl({
                    url: `https://m.jingxi.com/jxbfd/user/ExchangePrize?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=1628157961563&ptag=7155.9.47&dwType=3&dwLvl=${this.dict[i].dwLvl}&ddwPaperMoney=${this.dict[i].ddwPaperMoney}&strPoolName=${this.dict.hongbaopool}&_stk=_cfd_t%2CbizCode%2CddwPaperMoney%2CdwEnv%2CdwLvl%2CdwType%2Cptag%2Csource%2CstrPgUUNum%2CstrPgtimestamp%2CstrPhoneID%2CstrPoolName%2CstrZone&_ste=1`,
                    cookie
                })
                if (this.haskey(s, 'strAwardDetail.strName')) {
                    console.log(p.user, `成功兑换: ${s.strAwardDetail.strName}`)
                    this.notices(`成功兑换: ${s.strAwardDetail.strName}`, p.user)
                }
                else {
                    console.log(`${this.dict[i].strPrizeName}没有换到`, p.user)
                }
            }
        }
    }
}

module.exports = Main;
