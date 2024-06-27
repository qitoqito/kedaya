const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东健康"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.import = ['jdSign']
        this.readme = `此活动需要验证sign,需要自己docker部署sign算法\n只做京豆任务`
        this.interval = 6000
    }

    async prepare() {
        this.sign = new this.modules.jdSign()
    }

    async main(p) {
        let cookie = p.cookie;
        var bean = 0
        let gift = function(a) {
            for (let i of this.haskey(a, 'result.result.prizeInfovos')) {
                if (i.prizeType == 2) {
                    bean += parseInt(i.awardId)
                    console.log(`获得京豆:`, i.awardId)
                }
                else if (i.prizeType == 14) {
                    console.log("获得健康值:", i.awardId)
                }
            }
        }
        for (let i of Array(3)) {
            var headers = {
                referer: 'https://jd.com',
                'j-e-c': `%7B%22ciphertype%22:5,%22cipher%22:%7B%22pin%22:%22awHpZXZ1JQrEHW9uHvvB%22%7D,%22ts%22:${parseInt(new Date().getTime() / 1000)},%22hdid%22:%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw=%22,%22version%22:%221.0.3%22,%22appname%22:%22com.360buy.jdmobile%22,%22ridx%22:-1%7D`,
                jdgs: `{"b1":"${this.uuid(8)}-${this.uuid(4)}-${this.uuid(4)}-${this.uuid(4)}-${this.uuid(12)}","b2":"2.1.6_1","b3":"2.0","b4":"","b5":"${this.sha1(p.cookie)}","b7":"${new Date().getTime().toString()}","b6":"${this.sha1(p.user)}"}"}`
            }
            var h = await this.sign.jdCurl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `body={"osName":"buyMedicine","channel":"jdapp","methodName":"getKitTask2727","groupCode":"openkits","m_patch_appKey":"231282000001","imei":"OOLPCJFL","wrapResult":true,"appId":"2d0050d8877d4065b6227fb9fdcc01bb","version":12,"location":{"district":"1234","town":"56789","province":"16","city":"1234"}}&build=169227&client=apple&clientVersion=12.6.2&functionId=jdh_laputa_handleSoaRequest_reinforce`,
                    cookie,
                    headers
                }
            )
            if (this.haskey(h, 'data.result.encodeId')) {
                break
            }
            await this.wait(1000)
        }
        let encodeId = this.haskey(h, 'data.result.encodeId')
        if (!encodeId) {
            console.log("没有获取到数据...")
            return
        }
        let res = h.data.result
        // console.log(res.status)
        if (res.status) {
            let sign = await this.sign.jdCurl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `body={"infoId":"jdhHome_task","appKey":"231282000001","channel":"jdapp","encodeId":"${encodeId}","imei":"OKFCDBBG","location":{"district":"55674","town":"","province":"1","city":"72"},"wrapResult":true}&build=169227&client=apple&clientVersion=12.6.2&functionId=jdh_msoa_doTaskGw`,
                    cookie, headers
                }
            )
            if (this.haskey(sign, 'result.result.signType')) {
                gift.call(this, sign)
            }
            else {
                console.log(sign)
            }
        }
        // console.log(encodeId)
        let list = await this.sign.jdCurl({
                'url': `https://api.m.jd.com/client.action?functionId=jdh_laputa_handleSoaRequest_reinforce`,
                'form': `body={"osName":"buyMedicine","appKey":"231282000001","methodName":"queryTaskList2998","channel":"jdapp","imei":"OOLPCJFL","location":{"district":"1234","town":"45678","province":"16","city":"1234"},"wrapResult":true,"appId":"2d0050d8877d4065b6227fb9fdcc01bb","version":12}&build=169227&client=apple&clientVersion=12.6.2&functionId=jdh_laputa_handleSoaRequest_reinforce`,
                cookie,
                headers
            }
        )
        for (let i of this.haskey(list, 'data.result')) {
            if (i.groupName == '每日任务') {
                for (let j of i.taskVoList) {
                    if (j.status == 4) {
                        console.log("任务完成:", j.mainTitle)
                    }
                    else {
                        console.log("正在浏览:", j.mainTitle)
                        // console.log(j)
                        if (j.status == 1) {
                            let d = await this.sign.jdCurl({
                                    'url': `https://api.m.jd.com/client.action`,
                                    'form': `body={"osName":"buyMedicine","infoId":"jdhHome_task","methodName":"doTask2745","encodeId":"${j.encodeId}","appKey":"231282000001","channel":"jdapp","wrapResult":true,"appId":"2d0050d8877d4065b6227fb9fdcc01bb","version":12,"imei":"OOLPCJFL","location":{"district":"1234","town":"45678","province":"16","city":"1234"}}&build=169227&client=apple&clientVersion=12.6.2&functionId=jdh_msoa_doTaskGw`,
                                    cookie,
                                    headers
                                }
                            )
                            console.log(this.haskey(d, 'result.result') || d)
                            await this.wait(5000)
                        }
                        let r = await this.sign.jdCurl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `body={"osName":"buyMedicine","version":12,"wrapResult":true,"methodName":"sendAward2999","queryToken":"${j.queryToken}","appId":"2d0050d8877d4065b6227fb9fdcc01bb","infoId":"jdhHome_task","activityId":8542,"channel":"jdapp","location":{"district":"1234","town":"45678","province":"16","city":"1234"},"imei":"OOLPCJFL","taskId":${j.id},"appKey":"231282000001"}&build=169227&client=apple&clientVersion=12.6.2&functionId=jdh_msoa_sendAwardGw`,
                                cookie,
                                headers
                            }
                        )
                        gift.call(this, r)
                        await this.wait(1000)
                    }
                }
            }
        }
        if (bean>0) {
            this.print(`京豆: ${bean}`, p.user)
        }
    }
}

module.exports = Main;
