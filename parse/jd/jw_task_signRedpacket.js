const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东微信签到红包"
        this.cron = "32 0,21 * * *"
        // this.thread = 6
        this.task = 'local'
        this.import = ['jdAlgo']
        this.header = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
            referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
        }
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': '9a38a',
            'type': 'wechat',
        })
    }

    async main(p) {
        let cookie = p.cookie;
        for (let activityId of this.profile.activityId ? this.profile.activityId.split("|") : ["10006", "10004"]) {
            let q = await this.algo.curl({
                    'url': `https://api.m.jd.com/signTask/querySignStatus?client=apple&clientVersion=7.17.300&build=&uuid=oTGnpnJnfzHlnhyMFW_3v2IxIlAk&osVersion=iOS%2011.4&screen=320*568&networkType=wifi&partner=&forcebot=&d_brand=iPhone&d_model=iPhone%20SE%3CiPhone8%2C4%3E&lang=zh_CN&wifiBssid=&scope=&functionId=SignComponent_querySignStatus&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body={"activityId":"${activityId}","activeId":"","groupId":""}`,
                    cookie,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
                        referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
                    }
                }
            )
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/signTask/doSignTask`,
                    form: `client=apple&clientVersion=7.16.280&functionId=SignComponent_doSignTask&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body={"activityId":"${activityId}"}`,
                    cookie,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
                        referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
                    }
                }
            )
            if (this.haskey(s, 'data.rewardValue')) {
                this.print(`签到: ${s.data.signDays}天, 获得红包: ${s.data.rewardValue}元`, p.user)
            }
            else {
                console.log(p.user, s.message)
            }
            let task = await this.algo.curl({
                    'url': `https://api.m.jd.com/signTask/querySignList?client=apple&clientVersion=7.17.300&build=&uuid=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&partner=&forcebot=&d_brand=iPhone&lang=zh_CN&wifiBssid=&scope=&functionId=SignComponent_querySignList&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body={"activityId":"${activityId}"}`,
                    // 'form':``,
                    cookie,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
                        referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
                    }
                }
            )
            if (this.haskey(task, 'data.scanTaskInfo')) {
                let info = task.data.scanTaskInfo
                if (!info.completionFlag) {
                    let ss = await this.algo.curl({
                            'url': `https://api.m.jd.com/scanTask/startScanTask`,
                            form: `client=apple&clientVersion=7.17.300&functionId=SignComponent_doScanTask&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body={"itemId":"${info.itemId}","activityId":"${activityId}","scanAssignmentId":"${info.scanAssignmentId}","actionType":1}`,
                            // 'form':``,
                            cookie,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
                                referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
                            }
                        }
                    ) 
                    console.log(`等待任务中...`)
                    await this.wait(8000)
                    let r = await this.algo.curl({
                            'url': `https://api.m.jd.com/scanTask/startScanTask`,
                            form: `client=apple&clientVersion=7.17.300&functionId=SignComponent_doScanTask&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body={"itemId":"${info.itemId}","activityId":"${activityId}","scanAssignmentId":"${info.scanAssignmentId}","actionType":0}`,
                            // 'form':``,
                            cookie,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
                                referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
                            }
                        }
                    )
                    let amount = this.haskey(r, 'data.amount')
                    if (amount) {
                        this.print(`获得红包: ${amount}`, p.user)
                    }
                    else {
                        console.log(`什么也没有`)
                    }
                }
                else {
                    console.log(`任务已经完成`)
                }
            }
        }
    }
}

module.exports = Main;
