const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东集魔方赢大奖"
        this.cron = "22 0,22 * * *"
        this.task = 'local'
        this.thread = 6
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        let l = await this.curl({
                'url': `https://api.m.jd.com/client.action?uuid=&client=wh5&clientVersion=10.3.0&osVersion=15.1.1&networkType=wifi&appid=content_ecology&functionId=getInteractionInfo&t=1640607891598&body={"geo":{"lng":"","lat":""},"mcChannel":0,"sign":3}`,
                // 'form':``,
                cookie
            }
        )
        let interactionId = l.result.interactionId
        let taskPoolId = l.result.taskPoolInfo.taskPoolId
        for (let i of l.result.taskPoolInfo.taskList) {
            if (!i.taskStatus) {
                for (let j of Array(i.toastTime + 2)) {
                    let sku = this.random([
                        '10025690385788',
                        '100029081460',
                        '100027604000',
                        '100008764851',
                        '100023781630',
                        '100018818732',
                        '10025690385788',
                        '100029081460',
                        '100027604000',
                        '100008764851',
                        '100023781630',
                        '100018818732',
                    ], 1)
                    let advertId = sku
                    let s = await this.curl({
                            'url': `https://api.m.jd.com/client.action?uuid=&client=wh5&clientVersion=10.3.0&osVersion=15.1.1&networkType=wifi&&appid=content_ecology&functionId=executeNewInteractionTask&t=1640607957804&body={"geo":{"lng":"","lat":""},"mcChannel":0,"sign":3,"interactionId":${interactionId},"taskPoolId":${taskPoolId},"taskType":${i.taskId},"sku":"${sku}","advertId":"${advertId}"}`,
                            // 'form':``,
                            cookie
                        }
                    )
                    console.log(s.result?.lotteryInfoList || s.result)
                    if (this.haskey(s, 'result.lotteryInfoList')) {
                        let gift = this.column(s.result.lotteryInfoList, 'name')
                        if (this.dumps(gift) != '[]') {
                            this.notices(`获得奖励${this.dumps(gift)}`, p.user)
                        }
                    }
                }
            }
            else {
                console.log("任务已经完成了")
            }
        }
    }
}

module.exports = Main;
