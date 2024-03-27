const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东购物粉丝"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 8)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.delay = 1000
        this.hint = {
            openid: `微信抓包京东cookie里的open_id字段`
        }
        this.readme = "此活动需要微信登录京东获取账号open_id才能运行\n涉及隐私,不内置openid,请自行抓包获取,只需获取一个,尽量使用小号,然后填写字段: openid=xxxxx"
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: '4.4',
            type: 'main'
        })
        if (!this.profile.openid) {
            this.jump = 1
        }
    }

    async main(p) {
        let cookie = `open_id=${this.profile.openid};${p.cookie}`;
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/officialAccountSign_homePage?loginType=0&loginWQBiz=dzhsign`,
                'form': `appid=large_account&functionId=officialAccountSign_homePage&client=apple&clientVersion=1.0.0&loginType=1&loginWQBiz=dzhsign&body={}`,
                cookie,
                algo: {
                    "appId": "7c642",
                }
            }
        )
        let doTask = 0
        for (let i of this.haskey(home, 'data.scanTaskList')) {
            if (i.status == 2) {
                console.log("已完成:", i.assignName)
            }
            else {
                console.log("正在运行:", i.assignName)
                let d = await this.algo.curl({
                        'url': `https://api.m.jd.com/officialAccountSign_scan?loginType=0&loginWQBiz=dzhsign`,
                        'form': `appid=large_account&functionId=officialAccountSign_scan&client=apple&clientVersion=1.0.0&loginType=1&loginWQBiz=dzhsign&body={"actionType":1,"scanAssignmentId":"${i["scanAssignmentId"]}","itemId":"${i["itemId"]}"}`,
                        cookie
                    }
                )
                if (this.haskey(d, 'message').includes("火爆")) {
                    console.log("活动火爆")
                    return
                }
                else {
                    console.log(this.haskey(d, 'message'))
                    doTask++
                }
            }
        }
        if (doTask>0) {
            await this.wait(5000)
            for (let i of this.haskey(home, 'data.scanTaskList')) {
                if (i.status == 2) {
                }
                else {
                    let r = await this.algo.curl({
                            'url': `https://api.m.jd.com/officialAccountSign_scan`,
                            'form': `appid=large_account&functionId=officialAccountSign_scan&client=apple&clientVersion=1.0.0&loginType=1&loginWQBiz=dzhsign&body={"actionType":0,"scanAssignmentId":"${i["scanAssignmentId"]}","itemId":"${i["itemId"]}"}`,
                            cookie
                        }
                    )
                    console.log("正在领取:", i.assignName, this.haskey(r, 'message'))
                }
            }
        }
        let sign = await this.algo.curl({
                'url': `https://api.m.jd.com/officialAccountSign_sign?loginType=0&loginWQBiz=dzhsign`,
                'form': `appid=large_account&functionId=officialAccountSign_sign&client=apple&clientVersion=12.3.4&body={"itemId":"1"}`,
                cookie
            }
        )
        if (this.haskey(sign, 'data.signDays')) {
            console.log("签到成功,签到天数:", sign.data.signDays)
        }
        else {
            console.log(this.haskey(sign, 'message') || sign)
        }
        for (let i of this.haskey(home, "data.exchangeTaskList")) {
            if (i.rewardName.includes("京豆")) {
                let count = parseInt(i["rewardName"].replace("京豆", ""))
                let point = i["point"]
                if (count == point) {
                    let reward = await this.algo.curl(
                        {
                            "url": "https://api.m.jd.com/officialAccountSign_exchange",
                            "form": `appid=large_account&functionId=officialAccountSign_exchange&client=apple&clientVersion=1.0.0&loginType=1&loginWQBiz=dzhsign&body={"encryptAssignmentId":"${i["encryptAssignmentId"]}"}`,
                            cookie
                        }
                    )
                    if (this.haskey(reward, "subCode") == 0) {
                        this.print(`兑换京豆: ${point}`, p.user)
                    }
                    else {
                        console.log(reward)
                    }
                }
            }
        }
    }
}

module.exports = Main;
