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
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?client=wh5&clientVersion=10.3.0&osVersion=15.1.1&networkType=wifi&ext=%7B%22prstate%22:%220%22%7D&area=16_1341_1347_44750&functionId=qryCompositeMaterials&t=1640923295510&body=%7B%22geo%22:%7B%22lng%22:%22129.61221885577431%22,%22lat%22:%2293.966160894469766%22%7D,%22mcChannel%22:0,%22activityId%22:%2201128912%22,%22pageId%22:%223288111%22,%22qryParam%22:%22[%7B%5C%22type%5C%22:%5C%22advertGroup%5C%22,%5C%22id%5C%22:%5C%2206066757%5C%22,%5C%22mapTo%5C%22:%5C%22advData%5C%22,%5C%22next%5C%22:[%7B%5C%22type%5C%22:%5C%22productGroup%5C%22,%5C%22mapKey%5C%22:%5C%22desc%5C%22,%5C%22mapTo%5C%22:%5C%22productGroup%5C%22,%5C%22attributes%5C%22:13%7D]%7D]%22,%22applyKey%22:%2221new_products_h%22%7D`,
            }
        )
        let data = this.dumps(s)
        this.dict.advertId = this.matchAll(/"advertId"\s*:\s*"(\d+)"/g, data)
        this.dict.skuId = this.matchAll(/"skuId"\s*:\s*"(\d+)"/g, data)
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
                for (let j of Array(i.toastTime + 5)) {
                    let sku = this.random(this.dict.skuId || [
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
                    let advertId = this.random(this.dict.advertId || [
                        '5101603275', '5101603798',
                        '5101603435', '5101603800',
                        '5101603935', '5101603797',
                        '5101603795', '5101605154',
                        '5101603817', '5101603796',
                        '5101604844', '5101603799',
                        '5101604845', '5101604842'
                    ], 1)
                    let s = await this.curl({
                            'url': `https://api.m.jd.com/client.action?uuid=&client=wh5&clientVersion=10.3.0&osVersion=15.1.1&networkType=wifi&&appid=content_ecology&functionId=executeNewInteractionTask&t=1640607957804&body={"geo":{"lng":"","lat":""},"mcChannel":0,"sign":3,"interactionId":${interactionId},"taskPoolId":${taskPoolId},"taskType":${i.taskId},"sku":"${sku}","advertId":"${advertId}"}`,
                            // 'form':``,
                            cookie
                        }
                    )
                    console.log(s.result?.lotteryInfoList || s.result)
                    if (this.haskey(s, 'result.lotteryInfoList')) {
                        let gift = this.column(s.result.lotteryInfoList, 'quantity', 'name')
                        if (this.dumps(gift) != '{}') {
                            this.notices(`获得奖励${this.dumps(gift)}`, p.user)
                        }
                    }
                }
            }
            else {
                console.log("任务已经完成了")
            }
        }
        let lo = await this.curl({
                'url': `https://api.m.jd.com/client.action?uuid=&client=wh5&clientVersion=10.3.0&osVersion=11.4&networkType=wifi&ext={"prstate":"0"}&appid=content_ecology&functionId=getNewFinalLotteryInfo&t=1640748486454&body={"geo":null,"mcChannel":0,"sign":3,"interactionId":${interactionId}}`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(lo, 'result.lotteryInfoList')) {
            console.log(lo?.result?.lotteryInfoList)
            let gift = this.column(lo.result.lotteryInfoList, 'quantity', 'name')
            if (this.dumps(gift) != '{}') {
                this.notices(`抽奖获得奖励${this.dumps(gift)}`, p.user)
            }
        }
        else {
            console.log(lo.result)
        }
    }
}

module.exports = Main;
