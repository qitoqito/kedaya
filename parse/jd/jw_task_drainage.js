const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东天天来赚钱"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
        this.model = 'shuffle'
        // this.turn = 2
        this.delay = 1000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            'type': 'weixin',
            version: "latest",
            headers: {
                referer: 'https://servicewechat.com/wx91d27dbf599dff74/770/page-frame.html',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.52(0x18003426) NetType/WIFI Language/zh_CN',
                wqreferer: 'http://wq.jd.com/wxapp/pages/marketing/entry_task/channel',
                'X-Rp-Client': 'mini_2.1.0'
            }
        })
        // for (let cookie of this.cookies.help) {
        //     let s = await this.algo.curl({
        //             'url': `https://api.m.jd.com/MiniTask_ChannelPage?g_ty=ls&g_tk=1629788202`,
        //             'form': `functionId=MiniTask_ChannelPage&t=1662909377667&body=%7B%7D&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=7.21.80&build=&osVersion=iOS%2011.4&screen=320*568&networkType=4g&d_brand=iPhone&d_model=iPhone%20SE%3CiPhone8%2C4%3E&d_name=&lang=zh_CN`,
        //             cookie,
        //             algo: {
        //                 'appId': '60d61',
        //             }
        //         }
        //     )
        //     let assist = this.haskey(s, 'data.assistTask')
        //     if (assist && assist.assistNum != assist.completionCnt && assist.itemId) {
        //         this.shareCode.push({
        //             user: this.userName(cookie),
        //             itemId: assist.itemId,
        //             assistNum: assist.assistNum,
        //             completionCnt: assist.completionCnt
        //         })
        //     }
        // }
    }

    async main(p) {
        let cookie = `buildtime=20230103;wxapp_type=1;wxapp_version=8.13.30;wxapp_scene=1112;cid=5;pinStatus=4; ${p.cookie}`
        let s = await this.algo.curl({
                'url': `https://api.m.jd.com/MiniTask_ChannelPage?g_ty=ls&g_tk=1629788202`,
                'form': `loginType=11&clientType=wxapp&client=apple&clientVersion=9.23.200&build=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&lang=zh_CN&functionId=miniTask_hbChannelPage&t=1732259085779&body={"source":"task","businessSource":"bbxa"}&appid=hot_channel`,
                cookie,
                algo: {
                    'appId': '60d61',
                }
            }
        )
        if (this.turnCount == 1) {
            if (!this.cookies.help.includes(p.cookie)) {
                console.log("不是助力账号,此轮跳过运行")
                return
            }
            let assist = this.haskey(s, 'data.assistTask')
            if (assist) {
                let completionCnt = assist.completionCnt || 0
                console.log("可以开红包数:", completionCnt)
                for (let i = 1; i<=completionCnt; i++) {
                    let r = await this.curl({
                            'url': `https://api.m.jd.com/miniTask_doAssistReward?g_ty=ls&g_tk=1236659202`,
                            'form': `functionId=miniTask_doAssistReward&t=1673686826185&body={"order":${i},"itemId":"${assist.itemId}"}&appid=hot_channel&loginType=2&clientType=wxapp&client=apple&clientVersion=8.13.120&build=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&d_name=&lang=zh_CN`,
                            cookie,
                            referer: "https://servicewechat.com/wx91d27dbf599dff74/654/page-frame.html",
                            "ua": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/4G Language/zh_CN"
                        }
                    )
                    console.log('获得红包:', this.haskey(r, 'data.discount') || this.haskey(r, 'message'))
                }
            }
        }
        else {
            if (p.inviter.itemId) {
                let assist = await this.algo.curl({
                        'url': `https://api.m.jd.com/miniTask_assistCheck?g_ty=ls&g_tk=1236659202`,
                        'form': `functionId=miniTask_doAssist&t=1673620049238&body={"itemId":"${p.inviter.itemId}"}&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=7.21.80&build=&osVersion=iOS%2011.4&screen=320*568&networkType=4g&d_brand=iPhone&d_model=iPhone%20SE%3CiPhone8%2C4%3E&d_name=&lang=zh_CN`,
                        cookie,
                    }
                )
                console.log("正在助力:", p.inviter.user, this.haskey(assist, 'data') || this.haskey(assist, 'message'))
            }
            let sign = await this.algo.curl({
                    'url': `https://api.m.jd.com/mini_doSign?g_ty=ls&g_tk=1629788202`,
                    'form': `functionId=mini_doSign&t=1662909416431&body={"itemId":"1"}&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=7.21.80&build=&osVersion=iOS%2011.4&screen=320*568&networkType=4g&d_brand=iPhone&d_model=iPhone%20SE%3CiPhone8%2C4%3E&d_name=&lang=zh_CN`,
                    cookie,
                }
            )
            console.log("签到:", this.haskey(sign, 'data.signDays') || this.haskey(sign, 'message') || sign)
            for (let i of this.haskey(s, 'data.scanTaskList')) {
                if (i.status != 2) {
                    if (i.type != 6 && i.itemId) {
                        console.log(`正在浏览: ${i.title}`)
                        let a = await this.algo.curl({
                                'url': `https://api.m.jd.com/MiniTask_ScanTask?g_ty=ls&g_tk=1629788202`,
                                'form': `functionId=MiniTask_ScanTask&t=1662910469624&body={"actionType":1,"scanAssignmentId":"${i.scanAssignmentId}","itemId":"${i.itemId}","type":"${i.type}"}&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=7.21.80&build=&osVersion=iOS%2011.4&screen=320*568&networkType=4g&d_brand=iPhone&d_model=iPhone%20SE%3CiPhone8%2C4%3E&d_name=&lang=zh_CN`,
                                cookie,
                            }
                        )
                        await this.wait(i.times * 1000)
                        let b = await this.algo.curl({
                                'url': `https://api.m.jd.com/MiniTask_ScanTask?g_ty=ls&g_tk=1629788202`,
                                'form': `functionId=MiniTask_ScanTask&t=1662910469624&body={"actionType":0,"scanAssignmentId":"${i.scanAssignmentId}","itemId":"${i.itemId}","type":"${i.type}"}&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=7.21.80&build=&osVersion=iOS%2011.4&screen=320*568&networkType=4g&d_brand=iPhone&d_model=iPhone%20SE%3CiPhone8%2C4%3E&d_name=&lang=zh_CN`,
                                cookie,
                            }
                        )
                        // console.log(b)
                        let c = await this.algo.curl({
                                'url': `https://api.m.jd.com/MiniTask_ScanReward?g_ty=ls&g_tk=1629788202`,
                                'form': `functionId=MiniTask_ScanReward&t=1662910991724&body={"scanAssignmentId":"${i.scanAssignmentId}","type":"${i.type}"}&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=7.21.80&build=&osVersion=iOS%2011.4&screen=320*568&networkType=4g&d_brand=iPhone&d_model=iPhone%20SE%3CiPhone8%2C4%3E&d_name=&lang=zh_CN`,
                                cookie,
                            }
                        )
                        if (this.haskey(c, 'data.0.discount')) {
                            console.log("金币:", c.data[0].discount)
                        }
                        else {
                            console.log(c)
                        }
                    }
                    else if (i.scanAssignmentId) {
                        console.log(`正在浏览: ${i.subTitle}`)
                        cookie = `buildtime=20230105;wxapp_type=1;wxapp_version=8.13.50;wxapp_scene=1019;cid=5;${p.cookie}`
                        let drainage = await this.algo.curl({
                                'url': `https://api.m.jd.com/MiniTask_ChannelPage?g_ty=ls&g_tk=1871805617`,
                                'form': `functionId=MiniTask_ChannelPage&t=1673015432276&body=%7B%22source%22%3A%22task%22%7D&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=8.13.30&build=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&d_name=&lang=zh_CN`,
                                cookie,
                                algo: {
                                    'appId': '60d61',
                                }
                            }
                        )
                        let drainageTask = await this.algo.curl({
                                'url': `https://api.m.jd.com/miniTask_getDrainageTaskReward?g_ty=ls&g_tk=133291722`,
                                'form': `functionId=miniTask_getDrainageTaskReward&t=1662912449738&body={"rewardAssignmentId":"${i.scanAssignmentId}"}&appid=hot_channel&loginType=11&clientType=wxapp&client=apple&clientVersion=7.21.80&build=&osVersion=iOS%2013.7&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone%206s%3CiPhone8%2C1%3E&d_name=&lang=zh_CN&_ste=2`,
                                cookie,
                            }
                        )
                        console.log("引流:", this.haskey(drainageTask, 'message') || drainageTask)
                    }
                }
                else {
                    console.log(`任务已完成: ${i.title}`)
                }
            }
            let channel = await this.algo.curl({
                    'url': `https://api.m.jd.com/MiniTask_ChannelPage?g_ty=ls&g_tk=1722006734`,
                    'form': `loginType=11&clientType=wxapp&client=apple&clientVersion=9.23.140&build=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&lang=zh_CN&uuid=oCwKwuBoW0okKEIIDlT5FXxscxcM&functionId=MiniTask_ChannelPage&t=1731719820513&body={"source":"task","silverHairInfo":{},"expose":false,"xyhfAuth":2,"xyhfShow":false,"businessSource":"2411shiyebuchuanbo","versionFlag":"new"}&appid=hot_channel`,
                    cookie,
                    algo: {
                        appId: '60d61'
                    }
                }
            )
            let query = await this.algo.curl({
                    'url': `https://api.m.jd.com/miniTask_queryMyRights?g_ty=ls&g_tk=1722006734`,
                    'form': `loginType=11&clientType=wxapp&client=apple&clientVersion=9.23.140&build=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&lang=zh_CN&uuid=oCwKwuBoW0okKEIIDlT5FXxscxcM&functionId=miniTask_queryMyRights&t=1731719821597&body={}&appid=hot_channel&d_name=`,
                    cookie,
                    algo: {
                        appId: '1221c'
                    }
                }
            )
            let rights = await this.algo.curl({
                    'url': `https://api.m.jd.com/miniTask_superSaveGetRights?g_ty=ls&g_tk=1722006734`,
                    'form': `loginType=11&clientType=wxapp&client=apple&clientVersion=9.22.230&build=&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&lang=zh_CN&functionId=miniTask_superSaveGetRights&t=1731641417506&body={"itemId":"1"}&appid=hot_channel`,
                    cookie: p.cookie,
                    algo: {
                        appId: '87bb2'
                    },
                }
            )
            if (this.haskey(rights, 'data.rights')) {
                for (let i of this.haskey(rights, 'data.rights')) {
                    if (i.rewardType == 1) {
                        this.print(`红包: ${i.discount}`, p.user)
                    }
                    if (i.rewardType == 3) {
                        console.log(`优惠券:${i.quota}-${i.discount}}(${i.category})`)
                    }
                    else {
                        console.log(i)
                    }
                }
            }
            else {
                console.log(this.haskey(rights, 'message') || rights)
            }
        }
    }
}

module.exports = Main;
