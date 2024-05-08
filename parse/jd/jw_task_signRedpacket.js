const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东微信签到红包"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 2)},${this.rand(13, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.header = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
            referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
        }
        this.interval = 5000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            'appId': '9a38a',
            'type': 'wechat',
            version: '3.0'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        for (let activityId of ['10004']) {
            let q = await this.curl({
                    'url': `https://api.m.jd.com/signTask/querySignStatus?client=apple&clientVersion=7.17.300&functionId=SignComponent_querySignStatus&appid=hot_channel&loginType=2&body={"activityId":"10004","activeId":"","groupId":"","version":1}`,
                    cookie,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
                        referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
                    }
                }
            )
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/signTask/doSignTask`,
                    form: `functionId=SignComponent_doSignTask&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body={"activityId":"${activityId}"}`,
                    cookie,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001f2a) NetType/WIFI Language/zh_CN',
                        referer: 'https://servicewechat.com/wx91d27dbf599dff74/673/page-frame.html'
                    }
                }
            )
            // console.log(s)
            if (this.haskey(s, 'data.rewardValue')) {
                this.print(`签到: ${s.data.signDays}天, 获得红包: ${s.data.rewardValue}元`, p.user)
            }
            else {
                console.log(p.user, s.message)
            }
            // let task = await this.algo.curl({
            //         'url': `https://api.m.jd.com/signTask/querySignList?client=apple&clientVersion=7.17.300&functionId=SignComponent_querySignList&appid=hot_channel&loginType=2&body={"activityId":"${activityId}"}`,
            //         // 'form':``,
            //         cookie,
            //         headers: {
            //             'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
            //             referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
            //         }
            //     }
            // )
            // if (this.haskey(task, 'data.scanTaskInfo')) {
            //     let info = task.data.scanTaskInfo
            //     if (!info.completionFlag) {
            //         let ss = await this.algo.curl({
            //                 'url': `https://api.m.jd.com/scanTask/startScanTask`,
            //                 form: `client=apple&clientVersion=7.17.300&functionId=SignComponent_doScanTask&appid=hot_channel&loginType=2&body={"itemId":"${info.itemId}","activityId":"${activityId}","scanAssignmentId":"${info.scanAssignmentId}","actionType":1}`,
            //                 // 'form':``,
            //                 cookie,
            //                 headers: {
            //                     'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
            //                     referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
            //                 },
            //                 algo: {
            //                     'appId': '2b5bc',
            //                     'type': 'wechat',
            //                     version: "3.1"
            //                 }
            //             }
            //         )
            //         console.log(`等待任务中...`)
            //         await this.wait(10000)
            //         let r = await this.algo.curl({
            //                 'url': `https://api.m.jd.com/scanTask/startScanTask`,
            //                 form: `client=apple&clientVersion=7.17.300&functionId=SignComponent_doScanTask&appid=hot_channel&loginType=2&body={"itemId":"${info.itemId}","activityId":"${activityId}","scanAssignmentId":"${info.scanAssignmentId}","actionType":0}`,
            //                 // 'form':``,
            //                 cookie,
            //                 headers: {
            //                     'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
            //                     referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
            //                 },
            //                 algo: {
            //                     'appId': '2b5bc',
            //                     'type': 'wechat',
            //                     version: "3.1"
            //                 }
            //             }
            //         )
            //         console.log(r)
            //         let amount = this.haskey(r, 'data.amount')
            //         if (amount) {
            //             this.print(`获得红包: ${amount}`, p.user)
            //         }
            //         else {
            //             console.log(`什么也没有`)
            //         }
            //     }
            //     else {
            //         console.log(`任务已经完成`)
            //     }
            // }
        }
    }
}

module.exports = Main;
