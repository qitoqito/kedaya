const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东抽盲盒"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.import = ['jdAlgo', 'jdUrl']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': 'eb7b3',
            type: "web",
            version: "3.1"
        })
        let code = this.profile.custom || "464d2321dc1b4bbe8bea99cde34dd786"
        this.shareCode.push({code})
    }

    async main(p) {
        let cookie = p.cookie;
        let fp = this.uuid('lc', 32)
        let eid = this.uuid('c', 90)
        let uuid = this.uuid("lc", 40)
        let ac = await this.algo.curl({
                'url': `https://api.m.jd.com/api?client=iOS&clientVersion=11.3.0&appid=jdchoujiang_h5&t=1666758068322&functionId=freshgoodsActivityPage&body={"code":"${p.inviter.code}","friendPin":"${this.nextPin || ''}"}&openid=-1&uuid=${uuid}&build=168341&osVersion=11.4&networkType=wifi&partner=&d_brand=iPhone&d_model=iPhone8,4&code=${p.inviter.code}&friendPin=${this.nextPin || ''}"}`,
                // 'form':``,
                cookie
            }
        )
        let list = await this.algo.curl({
                'url': `https://api.m.jd.com/api?client=iOS&clientVersion=11.3.0&appid=jdchoujiang_h5&t=1666754193191&functionId=freshgoodsMyTask&body={"code":"${p.inviter.code}"}&build=168341&osVersion=15.1.1&networkType=wifi&partner=&d_brand=iPhone&d_model=iPhone13,3&code=${p.inviter.code}`,
                // 'form':``,
                cookie
            }
        )
        this.assert(list.data, '没有获取到数据')
        for (let n of Array(7)) {
            for (let i of list.data.myTasks) {
                if (!i.hasFinish && i.taskItem) {
                    let s = await this.algo.curl({
                            'url': `https://api.m.jd.com/api`,
                            'form': `https://api.m.jd.com/api?client=iOS&clientVersion=11.3.0&appid=jdchoujiang_h5&t=1666754541600&functionId=freshgoodsDoTask&body={"code":"${p.inviter.code}","taskType":${i.taskType},"taskId":${i.taskId},"eid":"${eid}","fp":"${fp}","itemId":"${i.taskItem.itemId}"}&openid=-1&uuid=${uuid}&build=168341&osVersion=15.1.1&networkType=wifi&partner=&d_brand=iPhone&d_model=iPhone13,3`,
                            cookie
                        }
                    )
                    if (this.haskey(s, 'data.rewardPoints')) {
                        console.log(`获得积分: ${s.data.rewardPoints}`)
                    }
                    else {
                        console.log(s.errorMessage)
                        if (this.haskey(s, 'errorMessage').includes("火爆")) {
                            return
                        }
                    }
                }
            }
            await this.wait(2000)
        }
        this.nextPin = list.data.pin
        for (let n of Array(10)) {
            let r = await this.algo.curl({
                    'url': `https://api.m.jd.com/api?client=iOS&clientVersion=11.3.0&appid=jdchoujiang_h5&t=1666756124856&functionId=freshgoodsDraw&body={"code":"${p.inviter.code}","eid":"${eid}","fp":"${fp}"}&openid=-1&uuid=${uuid}&build=168341&osVersion=15.1.1&networkType=wifi&partner=&d_brand=iPhone&d_model=iPhone13,3&code=${p.inviter.code}&eid=${eid}&fp=${fp}`,
                    // 'form':``,
                    cookie
                }
            )
            // console.log(this.dumps(r))
            // console.log(r.data)
            if (this.haskey(r, 'errorMessage')) {
                console.log(r.errorMessage)
                break
            }
            let rewardType = this.haskey(r, 'data.rewardType')
            if (rewardType != 4) {
                this.print(this.haskey(r, 'data.rewardName'), p.user)
            }
            else {
                console.log("什么也没有抽到")
            }
            await this.wait(2000)
        }
    }
}

module.exports = Main;
