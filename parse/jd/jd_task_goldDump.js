const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东黄金饺"
        this.cron = `${this.rand(0, 59)} ${this.rand(17, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo', 'logBill', 'jdSign']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: 'latest',
            type: 'main',
            shell: true
        })
        this.sign = new this.modules.jdSign()
    }

    async main(p) {
        let cookie = p.cookie;
        let gift = function(prize) {
            try {
                if (prize.data) {
                    return `${prize.data.prizeDesc}: ${prize.data.amount}`
                }
            } catch (e) {
            }
        }
        let load = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action?functionId=comp_data_load`,
                'form': `appid=day_day_reward&functionId=comp_data_load&loginType=2&loginWQBiz=tttwxapp&body={"token":"KYtyUzspPwotbioIoWYtD","commParams":{"ubbLoc":"ttf.kwhc","lid":"0_0_0_0","client":0,"sdkToken":"jdd01UZDEIGEQHEU3VWDGMYGXVPJ52YGPWPBX6PBNZGDS6IGZJVMF7345QLGXFCX66O6QA5AHCKRN7BXR73CQFNR2APXAHVD2TH4WIC2SIII01234567"},"bizParams":{"openChannel":"jdAppHome"}}&h5st=null&x-api-eid-token=jdd03FQ6Z2DTGYZSJM5FKY54JLAURRHP2UZHK2ID7554EMNWWNNSK3JBCTLTR45IOP3Z5K3YJHOG64SJAOB44KVS3RH7G2UAAAAMUCI2CU5AAAAAAD7V753GXKVKLYUX`,
                cookie,
                algo: {
                    appId: 'ec373'
                }
            }
        )
        let rewardReceiveKey = this.match(/"rewardReceiveKey":"(\w+)"/, this.dumps(load))
        if (rewardReceiveKey) {
            let interact = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=comp_data_interact`,
                    'form': `appid=day_day_reward&functionId=comp_data_interact&loginType=2&loginWQBiz=tttwxapp&body={"token":"KYtyUzspPwotbioIoWYtD","fnCode":"invoke","commParams":{"ubbLoc":"ttf.kwhc","lid":"0_0_0_0","client":0,"sdkToken":"jdd01CO63S53EDNECYV65ZKFRKYG4PYJG7AIX4L77Q2STOJ6JFZ6ZTRAP5ETLHDREYPOS4MJ7VFXEH7UBFVTMNKS22VWCXPE2X2BPMA4BALQ01234567"},"bizParams":{"rewardReceiveKey":"${rewardReceiveKey}","openChannel":"jdAppHome","actFlowCode":"receiveReward"}}`,
                    cookie,
                    algo: {
                        appId: '93453'
                    }
                }
            )
            // console.log(this.haskey(interact,'data.rewardInfoList'))
        }
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/api?functionId=goldDumplingsHome`,
                'form': `functionId=goldDumplingsHome&body={"envType":1,"linkId":"tCWe8wh2f-Lll_RNU1J2_g"}&t=1734509423656&appid=activities_platform&client=ios&clientVersion=13.8.1&loginType=2&loginWQBiz=wegame`,
                cookie,
                algo: {
                    appId: 'bdf7a'
                }
            }
        )
        // console.log(home)
        let pool = await this.algo.curl({
                'url': `https://api.m.jd.com/api?functionId=goldDumplingsPoll`,
                'form': `functionId=goldDumplingsPoll&body={"envType":1,"linkId":"tCWe8wh2f-Lll_RNU1J2_g","type":1,"sideType":"","sceneRestoreSkuId":"","periodTimesNoFlag":0,"cardLinkId":"uSHMAJiDreKaZ0XDqSIeBA","shareType":"","seekEncryCode":"","cardType":""}&t=1734509794781&appid=activities_platform&client=android&clientVersion=13.8.1&loginType=2&loginWQBiz=wegame`,
                cookie,
                algo: {
                    appId: '8cd44'
                }
            }
        )
        if (this.haskey(pool, 'data.prizeNum')) {
            for (let i of pool.data.popInfoList) {
                if (i.encryptStr) {
                    let prize = await this.algo.curl({
                            'url': `https://api.m.jd.com/api?functionId=goldDrawPrize`,
                            'form': `functionId=goldDrawPrize&body={"envType":1,"linkId":"tCWe8wh2f-Lll_RNU1J2_g","area":"0_0_0_0","sourceKey":"${i.encryptStr}"}&t=1734509985617&appid=activities_platform&client=android&clientVersion=13.8.1&loginType=2&loginWQBiz=wegame`,
                            cookie,
                            algo: {
                                appId: 'e3a6e'
                            }
                        }
                    )
                    let g = gift(prize)
                    if (g) {
                        this.print(g, p.user)
                    }
                    else {
                        console.log("啥也没抽到")
                    }
                }
            }
        }
        let taskList = await this.curl({
                'url': `https://api.m.jd.com/api?functionId=apTaskList&body={"linkId":"tCWe8wh2f-Lll_RNU1J2_g","channel":4}&t=1734512266733&appid=activities_platform&client=ios&clientVersion=13.8.1&loginType=2&loginWQBiz=wegame&h5st=null&build=169635&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1`,
                cookie
            }
        )
        // console.log(taskList)
        for (let i of this.haskey(taskList, 'data')) {
            let count = i.taskLimitTimes - i.taskDoTimes
            if (!count) {
                console.log("任务完成:", i.taskShowTitle)
            }
            else {
                console.log("正在运行:", i.taskShowTitle)
                for (let _ of Array(count)) {
                    switch (i.taskType) {
                        case 'ORDER_MARK':
                            break
                        case 'BROWSE_CHANNEL':
                        case 'BROWSE_PRODUCT':
                        case 'FOLLOW_SHOP':
                        case 'FOLLOW_CHANNEL':
                        case 'BROWSE_SEARCH':
                            let detail = await this.curl({
                                    'url': `https://api.m.jd.com/api?functionId=apTaskDetail`,
                                    'form': `functionId=apTaskDetail&body={"taskType":"${i.taskType}","taskId":${i.id},"channel":4,"checkVersion":true,"linkId":"tCWe8wh2f-Lll_RNU1J2_g","pipeExt":${this.dumps(i.pipeExt)}}&t=1734512379478&appid=activities_platform&client=ios&clientVersion=13.8.1&loginType=2&loginWQBiz=wegame`,
                                    cookie
                                }
                            )
                            for (let j of this.haskey(detail, 'data.taskItemList') || []) {
                                let start = await this.curl({
                                        'url': `https://api.m.jd.com/api?functionId=apStartTaskTime`,
                                        'form': `functionId=apStartTaskTime&body={"linkId":"tCWe8wh2f-Lll_RNU1J2_g","taskId":${i.id},"itemId":"${encodeURIComponent(j.itemId)}","taskInsert":false,"channel":4,"pipeExt":${this.dumps({...i.pipeExt, ...j.pipeExt})}}&t=1734512349561&appid=activity_platform_se&client=ios&clientVersion=13.8.1&loginType=2&loginWQBiz=wegame&`,
                                        cookie,
                                        algo: {
                                            appId: 'acb1e'
                                        }
                                    }
                                )
                                if (this.haskey(start, 'data.jumpUrl')) {
                                    let jump = this.jsonParse(start.data.jumpUrl.split('params=')[1])
                                    let z = await this.sign.jdCurl({
                                        url: 'https://api.m.jd.com/client.action',
                                        form: `functionId=apResetTiming&body={"timerId":"${jump.timerId}","uniqueId":"${jump.uniqId}"}&build=169498&client=apple&clientVersion=13.8.1&d_brand=apple&d_model=iPhone13%2C3&ef=1`,
                                        cookie
                                    })
                                    if (i.timeLimitPeriod) {
                                        await this.wait(i.timeLimitPeriod * 1000)
                                        console.log("等待", i.timeLimitPeriod)
                                    }
                                    let y = await this.sign.jdCurl({
                                        url: 'https://api.m.jd.com/client.action',
                                        form: `functionId=apCheckTimingEnd&body={"timerId":"${jump.timerId}","uniqueId":"${jump.uniqId}"}&build=169498&client=apple&clientVersion=13.8.1&d_brand=apple&d_model=iPhone13%2C3&ef=1`,
                                        cookie
                                    })
                                    let doTask = await this.algo.curl({
                                            'url': `https://api.m.jd.com/api?functionId=apDoLimitTimeTask`,
                                            'form': `functionId=apDoLimitTimeTask&body={"linkId":"tCWe8wh2f-Lll_RNU1J2_g"}&t=1734512393144&appid=activities_platform&client=ios&clientVersion=13.8.1&loginType=2&loginWQBiz=wegame`,
                                            cookie,
                                            algo: {
                                                appId: 'ebecc'
                                            }
                                        }
                                    )
                                    console.log(this.haskey(doTask, 'data.awardInfo.0'))
                                }
                                break
                            }
                            break
                    }
                }
            }
        }
        pool = await this.algo.curl({
                'url': `https://api.m.jd.com/api?functionId=goldDumplingsPoll`,
                'form': `functionId=goldDumplingsPoll&body={"envType":1,"linkId":"tCWe8wh2f-Lll_RNU1J2_g","type":1,"sideType":"","sceneRestoreSkuId":"","periodTimesNoFlag":0,"cardLinkId":"uSHMAJiDreKaZ0XDqSIeBA","shareType":"","seekEncryCode":"","cardType":""}&t=1734509794781&appid=activities_platform&client=android&clientVersion=13.8.1&loginType=2&loginWQBiz=wegame`,
                cookie,
                algo: {
                    appId: '8cd44'
                }
            }
        )
        let prizeNum = this.haskey(pool, 'data.prizeNum')
        if (prizeNum) {
            console.log("可以抽奖次数:", prizeNum)
            for (let i = 1; i<=prizeNum; i++) {
                let prize = await this.algo.curl({
                        'url': `https://api.m.jd.com/api?functionId=goldDrawPrize`,
                        'form': `functionId=goldDrawPrize&body={"envType":1,"linkId":"tCWe8wh2f-Lll_RNU1J2_g","area":"0_0_0_0"}&t=1734509985617&appid=activities_platform&client=android&clientVersion=13.8.0&loginType=2&loginWQBiz=wegame`,
                        cookie,
                        algo: {
                            appId: 'e3a6e'
                        }
                    }
                )
                let g = gift(prize)
                if (g) {
                    this.print(g, p.user)
                }
                else {
                    console.log("啥也没抽到")
                }
                await this.wait(2000)
            }
        }
        let cardHome = await this.algo.curl({
                'url': `https://api.m.jd.com/api?functionId=apCardHome`,
                'form': `functionId=apCardHome&body={"envType":1,"linkId":"uSHMAJiDreKaZ0XDqSIeBA"}&t=1734706347873&appid=activities_platform&client=ios&clientVersion=13.8.1&loginType=2`,
                cookie,
                algo: {
                    appId: "8d9d1"
                }
            }
        )
        let cardStatus = this.haskey(cardHome, 'data.cardStatus')
        if (cardStatus == 1) {
            console.log("正在合成京东黄金饺")
            let compose = await this.algo.curl({
                url: `https://api.m.jd.com/api?functionId=composeCard`,
                form: `functionId=composeCard&body={"envType":1,"linkId":"uSHMAJiDreKaZ0XDqSIeBA"}&t=1734706657615&appid=activities_platform&client=ios&clientVersion=13.8.1&loginType=`,
                algo: {
                    appId: 'f326f'
                },
                cookie
            })
            if (this.haskey(compose, 'data.rewardPopInfo.drawList')) {
                for (let i of compose.data.rewardPopInfo.drawList) {
                    this.print(`${i.prizeDesc}: ${i.amount}`, p.user)
                }
            }
            else {
                console.log(this.haskey(compose, 'errMsg') || compose)
            }
        }
        else if (cardStatus == 2) {
            console.log("已集齐京东黄金饺")
        }
        else {
            console.log("还没集齐卡片...")
        }
        if (this.haskey(cardHome, 'data.encryptStr')) {
            let draw = await this.algo.curl({
                    'url': `http://api.m.jd.com/api?functionId=cardDrawPrize`,
                    'form': `functionId=cardDrawPrize&body={"envType":1,"linkId":"uSHMAJiDreKaZ0XDqSIeBA","area":"0_0_0_0","sourceKey":"${cardHome.data.encryptStr}","manualFlag":0}&t=1735645944230&appid=activities_platform&client=ios&clientVersion=13.8.1&platform=3`,
                    cookie
                }
            )
            for (let i of this.haskey(draw, 'data.prizeInfos')) {
                this.print(`${i.prizeDesc}: ${i.amount}`, p.user)
            }
        }
    }
}

module.exports = Main;
