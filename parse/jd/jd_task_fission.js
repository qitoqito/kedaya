const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东互动助力活动"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.model = 'shuffle'
        this.verify = 1
        this.import = ['jdAlgo']
        this.hint = {
            linkId: '活动id,非链接id'
        }
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: 'latest'
        })
        this.linkId = this.custom || this.profile.linkId || 'PtBSe7lNfzviUeBFFxVMaw'
        for (let cookie of this.cookies.help) {
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/api?functionId=fissionHome`,
                    'form': `functionId=fissionHome&body={"linkId":"${this.linkId}","isJDApp":true,"manual":true,"helpPin":""}&t=1725631688407&appid=activities_platform&client=ios&clientVersion=13.2.6&loginType=2&loginWQBiz=wegame`,
                    cookie,
                    algo: {
                        appId: '973a9'
                    }
                }
            )
            if (this.haskey(s, 'code', 600001)) {
                s = await this.algo.curl({
                        'url': `https://api.m.jd.com/api?functionId=fissionHome`,
                        'form': `functionId=fissionHome&body={"linkId":"${this.linkId}","isJDApp":true,"manual":false,"helpPin":""}&t=1725631688407&appid=activities_platform&client=ios&clientVersion=13.2.6&loginType=2&loginWQBiz=wegame`,
                        cookie,
                        algo: {
                            appId: '973a9'
                        }
                    }
                )
            }
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
        console.log("正在助力:", p.inviter.user)
        let help = await this.algo.curl({
                'url': `https://api.m.jd.com/api?functionId=fissionHelp`,
                'form': `functionId=fissionHelp&body={"linkId":"${this.linkId}","popType":1,"helpPin":"${p.inviter.sharePin}"}&t=1725631709673&appid=activities_platform&client=ios&clientVersion=13.2.6&loginType=2&loginWQBiz=wegame`,
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

module.exports = Main;
