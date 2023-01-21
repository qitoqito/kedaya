const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东击鼓迎春"
        this.cron = ["1 0 1-4,14-20,22-31 * *", "1 0,20-23 21 * *", "1 0,20 5 * *"]
        this.import = ['jdAlgo']
        this.turn = 2
        this.help = "main"
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            appId: "5a721",
            type: 'app',
            version: "400"
        })
    }

    async main(p) {
        let cookie = p.cookie;
        if (this.turnCount == 1) {
            this.assert(this.code.length>0, "没有可以助力的账户")
            for (let i of this.code) {
                if (i.finish || i.assistNum == i.limit) {
                    console.log("助力已完成:", i.user)
                }
                else if (i.user == p.user
                ) {
                    console.log("不能助力自己")
                }
                else {
                    await this.wait(1000)
                    let window = await this.curl({
                            'url': `https://api.m.jd.com/`,
                            'form': `functionId=party_assistWindow&body={"area":"0_0_0_0","inviteCode":"${i.inviteCode}"}&client=apple&clientVersion=11.4.2&appid=signed_wh5&build=168451&osVersion=13.7&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&partner=&t=1674266515027`,
                            cookie
                        }
                    )
                    let help = await this.algo.curl({
                            'url': `https://api.m.jd.com/`,
                            form: `functionId=party_assist&body={"area":"0_0_0_0","inviteCode":"${i.inviteCode}","source":"3","uuid":"${this.uuid(16, 'nc')}"}&client=apple&clientVersion=11.4.2&appid=signed_wh5&build=168451&osVersion=13.7&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&partner=`,
                            cookie,
                            referer: "https://h5.m.jd.com/"
                        }
                    )
                    console.log("助力:", i.user, this.haskey(help, 'data.bizMsg') || help)
                    if (this.haskey(help, 'data.bizMsg').includes("成功")) {
                        i.assistNum++
                        console.log("助力成功次数:", i.assistNum)
                        if (i.assistNum == i.limit) {
                            i.finish = 1
                        }
                    }
                    break
                }
            }
        }
        else {
            if (this.turnCount == 2) {
                if (!this.cookies.help.includes(cookie)) {
                    console.log("不是被助力账户,此轮跳过运行")
                    return
                }
            }
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=party_welcome&body={"area":"0_0_0_0","uuid":"${this.uuid(16, 'nc')}"}&client=apple&clientVersion=11.4.2&appid=signed_wh5&build=168451&osVersion=13.7&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&partner=&t=1673853464447`,
                    cookie
                }
            )
            if (this.haskey(s, 'data.result.award')) {
                for (let i of this.haskey(s, 'data.result.award')) {
                    if (i.type == 2) {
                        this.print(`红包: ${i.amount}`, p.user)
                    }
                    else if (i.type == 1) {
                        this.print(`优惠券: ${i.amount} ${i.usageThreshold}`, p.user)
                    }
                    else if (i.type == 5) {
                        console.log(p.user, `祝福语: ${i.text1} ${i.text2}`)
                    }
                    else {
                        this.print(`未知类型: ${i.ype}`, p.user)
                        console.log("获得", i)
                    }
                }
            }
            else {
                console.log(this.haskey(s, 'data.bizMsg') || s)
            }
            for (let i of Array(3)) {
                let r = await this.algo.curl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=party_lottery&body={"area":"0_0_0_0","uuid":"${this.uuid(16, 'nc')}"}&client=apple&clientVersion=11.4.2&appid=signed_wh5&build=168451&osVersion=13.7&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&partner=&t=1673853500510`,
                        cookie
                    }
                )
                if (this.haskey(r, 'data.bizMsg').includes("用完")) {
                    break
                }
                if (this.haskey(r, 'data.result.award')) {
                    for (let i of this.haskey(r, 'data.result.award')) {
                        if (i.type == 2) {
                            this.print(`红包: ${i.amount}`, p.user)
                        }
                        else if (i.type == 1) {
                            this.print(`优惠券: ${i.amount} ${i.usageThreshold}`, p.user)
                        }
                        else if (i.type == 5) {
                            console.log(p.user, `祝福语: ${i.text1} ${i.text2}`)
                        }
                        else {
                            this.print(`未知类型: ${i.ype}`, p.user)
                            console.log("获得", i)
                        }
                    }
                }
                else {
                    console.log(this.haskey(s, 'data.bizMsg') || s)
                }
                await this.wait(1000)
            }
            if (this.cookies.help.includes(p.cookie)) {
                let invite = await this.curl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=party_inviteWindow&body={"area":"0_0_0_0","showAssistorsSwitch":true}&client=apple&clientVersion=11.4.0&appid=signed_wh5&build=168411&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&partner=&openudid=7b01d4690ef13716984dcfcf96068f36b41f6c51&t=1674263676698`,
                        cookie
                    }
                )
                if (this.haskey(invite, 'data.result.inviteCode')) {
                    let shareCode = {
                        user: p.user, assistNum: invite.data.result.assistNum,
                        inviteCode: invite.data.result.inviteCode,
                        finish: invite.data.result.assistNum == 10 ? 1 : 0,
                        limit: 10
                    }
                    console.log("助力码:", shareCode)
                    this.code.push(shareCode)
                    await this.curl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=party_assistNewCome&body={"area":"0_0_0_0"}&client=apple&clientVersion=11.4.0&appid=signed_wh5&build=168411&osVersion=15.1.1&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&partner=&openudid&t=1674263767984`,
                        cookie
                    })
                }
            }
        }
    }
}

module.exports = Main;
