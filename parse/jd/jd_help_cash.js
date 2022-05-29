const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东限时拆红包"
        this.cron = "1 8,20 * * *"
        this.help = 'main'
        this.task = 'all'
        this.verify = 1
    }

    async prepare() {
        for (let cookie of this.cookies.help) {
            let signin = await this.curl({
                    'url': 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=1555572061',
                    'form': 'functionId=cash_mob_sign&body={"breakReward":0}&appid=CashRewardMiniH5Env&clientVersion=9.2.0',
                    cookie
                }
            )
            let select = await this.curl({
                    'url': 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=1555572061',
                    'form': `functionId=cash_join_limited_redpacket&body={"id":5,"level":3}&appid=CashRewardMiniH5Env&clientVersion=9.2.0`,
                    cookie
                }
            )
            let s = await this.curl({
                    'url': 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=1555572061',
                    'form': 'functionId=cash_mob_home&body={"isLTRedPacket":"1"}&appid=CashRewardMiniH5Env&clientVersion=9.2.0',
                    cookie
                }
            )
            if (this.haskey(s, 'data.result.limitTimeRedPacket.redPacketProcess.processTips', '4/4')) {
                console.log("助力完成")
                continue
            }
            if (this.haskey(s, 'data.result.shareDate')) {
                this.shareCode.push(this.compact(s.data.result, ['shareDate', 'inviteCode']))
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=redpack_limited_assist&body={"inviteCode":"${p.inviter.inviteCode}","shareDate":"${p.inviter.shareDate}","source":1}&appid=CashRewardMiniH5Env&appid=9.1.0`,
                // 'form':``,
                cookie
            }
        )
        let msg = this.haskey(s, 'data.result.limitTimeAssist.tips')
        if (msg.includes('用完')) {
            this.complete.push(p.index)
        }
        if (msg.includes("领到")) {
            this.finish.push(p.number)
        }
        if (msg.includes('邀请已结束')) {
            this.finish.push(p.number)
        }
        console.log(msg || this.haskey(s, 'data.bizMsg'))
    }

    async extra() {
        for (let cookie of this.cookies.help) {
            let user = this.userName(cookie)
            let redpacket = []
            for (let i = 1; i<5; i++) {
                let s = await this.curl({
                    'url': 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=216923755',
                    'form': `functionId=cash_open_limited_redpacket&body={"node":${i}}&appid=CashRewardMiniH5Env&clientVersion=9.2.0`,
                    cookie
                })
                console.log(user, this.haskey(s, 'data.bizMsg'))
                if (this.haskey(s, 'data.result.amountStr')) {
                    redpacket.push(this.haskey(s, 'data.result.amountStr'))
                }
            }
            if (redpacket.length>0) {
                console.log(`获得红包: ${redpacket.join(" , ")}`, user)
                this.notices(`获得红包: ${redpacket.join(" , ")}`, user)
            }
        }
    }
}

module.exports = Main;
