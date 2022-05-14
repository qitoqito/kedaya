const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东京豆抽奖"
        this.cron = "51 5,23 * * *"
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            appId: "169f1",
            type: 'app',
            fp: "7442853010941133",
        })
    }

    async main(p) {
        let cookie = p.cookie
        let check = await this.algo.curl({
                'url': `https://api.m.jd.com/?appid=lottery_drew&functionId=vvipscdp_checkSendBean&body={"channelCode":"swat_system_id"}`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(check, 'data.canReceiveBean') && this.haskey(check, 'data.sendBeanAmount')) {
            console.log('京豆奖励:', check.data.sendBeanAmount, '即将抽奖')
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/?appid=lottery_drew&functionId=vvipscdp_raffleAct_index&body={"channelType":"1","channelCode":"quanqudao_system_id","lid":"U9Qm4U6a7NvHUFaLUS4QSw==","uuid":""}`,
                    // 'form':``,
                    cookie
                }
            )
            let raffleActKey = this.haskey(s, 'data.floorInfoList.0.detail.raffleActKey')
            if (raffleActKey) {
                let draw = await this.algo.curl({
                        'url': `https://api.m.jd.com/?appid=lottery_drew&functionId=vvipscdp_raffle_auto_send_bean&body={"raffleActKey":"${raffleActKey}","channelCode":"swat_system_id"}`,
                        // 'form':``,
                        cookie
                    }
                )
                if (this.haskey(draw, 'data.sendBeanAmount')) {
                    console.log("获得京豆", draw.data.sendBeanAmount)
                    this.notices(`获得京豆: ${draw.data.sendBeanAmount}`, p.user)
                }
            }
            else {
                console.log('没有获取到raffleActKey')
            }
        }
        else {
            console.log("没有抽奖次数")
        }
    }
}

module.exports = Main;
