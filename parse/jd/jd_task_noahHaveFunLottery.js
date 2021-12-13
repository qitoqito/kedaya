const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东金榜年终红包"
        // this.cron = "12 0,13 * * *"
        this.help = 2
        this.task = 'all'
        this.thread = 6
    }

    async main(p) {
        let cookie = p.cookie;
        for (let i of Array(6)) {
            let s = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=noahHaveFunLottery&appid=publicUseApi&body={"actId":"RRDatuwG21B3xri55BfGFYaj7UKZNf"}&t=1638877862533&client=wh5&clientVersion=1.0.0&sid=f6281f5b2c6b523063f2d24f505dd62w&uuid=&area=0_0_undefined_0&networkType=`,
                    cookie
                }
            )
            try {
                console.log(s.lotteryResult.hongBaoList[0].prizeName)
            } catch (e) {
                console.log("已经领取过了")
            }
        }
    }
}

module.exports = Main;
