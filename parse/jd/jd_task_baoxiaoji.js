const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东报销机"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.turn = 2
        this.interval = 1000
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: '4.7'
        })
        for (let cookie of this.cookies.help) {
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/api?functionId=fissionHome`,
                    'form': `functionId=fissionHome&body={"linkId":"RAXK1uc0RfxJl7dS25LI6g","isJDApp":true,"manual":true,"helpPin":""}&t=1725631688407&appid=activities_platform&client=ios&clientVersion=13.2.6&loginType=2&loginWQBiz=wegame`,
                    cookie,
                    algo: {
                        appId: '973a9'
                    }
                }
            )
            if (this.haskey(s, 'data.sharePin')) {
                if (s.data.status != 2) {
                    this.shareCode.push({
                        sharePin: s.data.sharePin,
                        user: this.userName(cookie)
                    })
                }
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        if (this.turnCount == 0) {
            if (p.inviter.sharePin) {
                console.log("正在助力:", p.inviter.user)
                let help = await this.algo.curl({
                        'url': `https://api.m.jd.com/api?functionId=fissionHelp`,
                        'form': `functionId=fissionHelp&body={"linkId":"RAXK1uc0RfxJl7dS25LI6g","popType":1,"helpPin":"${p.inviter.sharePin}"}&t=1725631709673&appid=activities_platform&client=ios&clientVersion=13.2.6&loginType=2&loginWQBiz=wegame`,
                        algo: {appId: '36d93'},
                        cookie
                    }
                )
                if (this.haskey(help, 'data.helpResult')) {
                    console.log("助力成功...")
                    this.complete.push(p.index)
                }
                else if (this.haskey(help, 'data.failMsg')) {
                    console.log(help.data.failMsg)
                    if (help.data.failMsg.includes("完成")) {
                        this.finish.push(p.number)
                    }
                    if (help.data.failMsg.includes("上限")) {
                        this.complete.push(p.index)
                    }
                }
            }
        }
        else {
            console.log("检测红包中....")
            let draw = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=comp_data_interact`,
                    'form': `appid=baoxiaoji&functionId=comp_data_interact&body={"token":"l27lXwlPDecqlumUHiseM","fnCode":"start","commParams":{"ubbLoc":"bxjzdtask","lid":"0_0_0_0","client":0},"bizParams":{"actLinkId":"KRdHK//8ViutvuQ2DrBqHQ==","bizScene":"hdBxj"}}`,
                    cookie
                }
            )
            if (this.haskey(draw, 'data.stagePrizeDtoList.0.rewardDtos.0')) {
                for (let i of draw.data.stagePrizeDtoList[0].rewardDtos) {
                    if (i.hongBaoDataDto) {
                        this.print(`红包: ${i.hongBaoDataDto.amount}`, p.user)
                    }
                }
            }
        }
    }
}

module.exports = Main;
