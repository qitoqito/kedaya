const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东黄金饺助力"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo', 'logBill', 'jdSign']
        this.verify = 1
        this.model = 'shuffle'
        this.interval = 2000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: 'latest',
            type: 'main'
        })
        this.sign = new this.modules.jdSign()
        for (let cookie of this.cookies.help) {
            let home = await this.algo.curl({
                    'url': `https://api.m.jd.com/api?functionId=goldDumplingsHome`,
                    'form': `functionId=goldDumplingsHome&body={"envType":1,"linkId":"tCWe8wh2f-Lll_RNU1J2_g"}&t=1734509423656&appid=activities_platform&client=ios&clientVersion=13.8.1&loginType=2&loginWQBiz=wegame`,
                    cookie,
                    algo: {
                        appId: 'bdf7a'
                    }
                }
            )
            if (this.haskey(home, 'data.inviter')) {
                this.shareCode.push({
                    inviter: home.data.inviter,
                    user: this.userName(cookie)
                })
            }
            await this.wait(500)
        }
    }

    async main(p) {
        let cookie = p.cookie;
        console.log("正在助力:", p.inviter.user)
        let help = await this.algo.curl({
                'url': `https://api.m.jd.com/api?functionId=goldDumplingsHelp`,
                'form': `functionId=goldDumplingsHelp&body={"envType":1,"linkId":"tCWe8wh2f-Lll_RNU1J2_g","isJdApp":true,"inviter":"${p.inviter.inviter}"}&t=1734530397943&appid=activities_platform&client=ios&clientVersion=13.8.1&loginType=2&loginWQBiz=wegame`,
                cookie,
                algo: {
                    appId: '9e491'
                }
            }
        )
        console.log(this.haskey(help, ['data.helpResultMsg', 'data']) || help)
    }
}

module.exports = Main;
