const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东汪汪赛跑"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules["jdAlgo"]({
            appId: "b6ac3",
            version: "3.1",
            type: "lite"
        })
        let array = []
        for (let cookie of this.cookies.help) {
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=runningTeamInfo&body={"linkId":"L-sOanK_5RJCz7I314FpnQ"}&t=1660920601386&appid=activities_platform&client=ios&clientVersion=3.9.2&cthr=1&build=1164&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=`,
                    cookie
                }
            )
            if (this.haskey(s, 'data.captainId')) {
                if (!array.includes(s.data.captainId)) {
                    array.push(s.data.captainId)
                    let user = this.userName(cookie)
                    if (s.data.members.length) {
                        let ss = this.column(s.data.members, 'nickName', 'memberId')
                        user = ss[s.data.captainId]
                    }
                    this.code.push({
                        captainId: s.data.captainId,
                        count: s.data.members.length>1 ? s.data.members.length : 1,
                        user,
                        finish: s.data.members.length == 6 ? 1 : 0
                    })
                }
            }
        }
        if (this.code.length) {
            console.log("队伍信息:", this.code)
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/?functionId=runningPageHome&body={"linkId":"L-sOanK_5RJCz7I314FpnQ","isFromJoyPark":true,"joyLinkId":"LsQNxL7iWDlXUs6cFl-AAg"}&t=1660980238110&appid=activities_platform&client=ios&clientVersion=3.9.2&cthr=1&build=1164&screen=320*568&networkType=wifi&d_brand=iPhone&d_model=iPhone8,4&lang=zh_CN&osVersion=11.4&partner=`,
                // 'form':``,
                referer: `https://h5platform.jd.com/swm-stable/people-run/index?activityId=L-sOanK_5RJCz7I314FpnQ&joyLinkId=LsQNxL7iWDlXUs6cFl-AAg`,
                cookie
            }
        )
        let risk = 0
        let tt = 0
        let captain = this.column(this.code, 'user')
        if (captain.includes(p.user)) {
            console.log("🐰  已是队长,跳过组队")
        }
        else {
            for (let k of this.code) {
                if (!k.finish) {
                    tt = 1
                    let join = await this.algo.curl({
                            'url': `https://api.m.jd.com/?functionId=runningJoinTeam&body={"linkId":"L-sOanK_5RJCz7I314FpnQ","captainId":"${k.captainId}"}&t=1660920651446&appid=activities_platform&client=ios&clientVersion=3.9.2`,
                            // 'form':``,
                            cookie,
                            algo: {
                                appId: "448de",
                                version: "3.1",
                                type: "lite"
                            }
                        }
                    )
                    let code = this.haskey(join, 'code')
                    if (code == 10007) {
                        console.log("🐰  参与者周期内参与次数达到上限")
                        break
                    }
                    if (code == 10008) {
                        k.finish = 1
                        console.log(`🐰  邀请者周期内邀请次数达到上限,参加下一个团`)
                    }
                    else if (code == 10009) {
                        console.log("🐰  互相邀请过")
                        break
                    }
                    else if (code == 10016) {
                        console.log("🐰  风控策略校验失败")
                        risk = 1
                        break
                    }
                    else if (code == '0') {
                        console.log("🐰  组队成功")
                        k.count++
                        if (k.count == 6) {
                            k.finish = 1
                        }
                        break
                    }
                }
            }
        }
        if (!tt && this.code.length>0) {
            console.log("🦆  测试风控...")
            let join = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=runningJoinTeam&body={"linkId":"L-sOanK_5RJCz7I314FpnQ","captainId":"${this.random(this.code, 1)[0].captainId}"}&t=1660920651446&appid=activities_platform&client=ios&clientVersion=3.9.2`,
                    // 'form':``,
                    cookie,
                    algo: {
                        appId: "448de",
                        version: "3.1",
                        type: "lite"
                    }
                }
            )
            let code = this.haskey(join, 'code')
            if (code == 10016) {
                console.log("🐰  风控策略校验失败")
                risk = 1
            }
        }
        let task = await this.algo.curl({
                'url': `https://api.m.jd.com/?functionId=apTaskList&body={"linkId":"L-sOanK_5RJCz7I314FpnQ"}&t=1660910738295&appid=activities_platform&client=ios&clientVersion=3.9.2&cthr=1&build=1164&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=`,
                // 'form':``,
                cookie
            }
        )
        for (let k of this.haskey(task, 'data')) {
            if (!k.taskFinished) {
                if (k.taskShowTitle == "逛会场得生命值") {
                    let d = await this.curl({
                        'url': `https://api.m.jd.com/?functionId=apTaskDetail&body={"linkId":"L-sOanK_5RJCz7I314FpnQ","taskType":"BROWSE_CHANNEL","taskId":${k.id},"channel":4}&t=1656604862818&appid=activities_platform&client=H5&clientVersion=1.0.0`,
                        // 'form':``,
                        cookie
                    })
                    for (let z of (this.haskey(d, 'data.taskItemList') || []).slice(0, 2)) {
                        let doTask = await this.curl({
                                'url': `https://api.m.jd.com/?functionId=apDoTask&body={"linkId":"L-sOanK_5RJCz7I314FpnQ","taskType":"BROWSE_CHANNEL","taskId":${k.id},"channel":4,"itemId":"${encodeURIComponent(z.itemId)}","checkVersion":true}&t=1656604862818&appid=activities_platform&client=H5&clientVersion=1.0.0`,
                                // 'form':``,
                                cookie
                            }
                        )
                    }
                }
            }
        }
        if (!this.haskey(home, 'data')) {
            console.log("🐓  没有获取到数据")
            return
        }
        let info = this.haskey(home, 'data.runningHomeInfo') || {}
        console.log(`🐝  现有金额: ${info.prizeValue}`)
        await this.wait(1000)
        let assets = 0.04
        if (risk) {
            assets = 0.01
            console.log(`🙊  可能黑号了`)
        }
        else {
            if (this.profile.assets) {
                assets = this.random(this.profile.assets.split("|"), 1)[0]
            }
            console.log(`🐈  初始目标: ${assets}`)
            let hours = new Date().getHours()
            for (let nn in this.profile) {
                if (this.match(/assets_\d+_\d+/, nn)) {
                    let [n, m] = this.match(/assets_(\d+)_(\d+)/, nn)
                    if (parseInt(n)<=hours && parseInt(m)>hours) {
                        assets = parseFloat(this.profile[nn])
                        console.log(`🐻  选择时间段: ${n}-${m} , 目标: ${assets}`)
                    }
                }
            }
        }
        for (let z of Array(8)) {
            if (info.nextRunningTime && !info.energy) {
                let next = parseInt(info.nextRunningTime / 1000)
                let wait = this.profile.waitting || 180
                console.log(`🐢  距离下次跑路还有${next}秒, 如果小于${wait}秒,将执行等待`)
                if (next<parseInt(wait)) {
                    console.log(`🐴  等待: ${next} 秒`)
                    await this.wait(next * 1000)
                    home = await this.algo.curl({
                            'url': `https://api.m.jd.com/?functionId=runningPageHome&body={"linkId":"L-sOanK_5RJCz7I314FpnQ"}&t=1660980238110&appid=activities_platform&client=ios&clientVersion=3.9.2&cthr=1&build=1164&screen=320*568&networkType=wifi&d_brand=iPhone&d_model=iPhone8,4&lang=zh_CN&osVersion=11.4&partner=`,
                            cookie
                        }
                    )
                    info = this.haskey(home, 'data.runningHomeInfo') || {}
                }
                else {
                    console.log("🦆  没有能量棒,无法赛跑")
                    break
                }
            }
            if (info.nextRunningTime && info.energy) {
                console.log(`🐥  有${info.energy}能量棒,即将赛跑`)
                let bar = await this.algo.curl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=runningUseEnergyBar&body={"linkId":"L-sOanK_5RJCz7I314FpnQ"}&t=1660919679853&appid=activities_platform&client=ios&clientVersion=3.9.2`,
                        cookie
                    }
                )
                info = this.haskey(bar, 'data.runningHomeInfo') || {}
                console.log(`🐝  现有金额: ${info.prizeValue}`)
                await this.wait(1000)
            }
            if (!info.nextRunningTime) {
                console.log('🦉  终点目标:', assets)
                for (let i = 0; i<10; i++) {
                    let box = await this.algo.curl({
                            'url': `https://api.m.jd.com/`,
                            'form': `functionId=runningOpenBox&body={"linkId":"L-sOanK_5RJCz7I314FpnQ"}&t=1660919679853&appid=activities_platform&client=ios&clientVersion=3.9.2`,
                            cookie,
                            algo: {
                                appId: "b6ac3",
                                version: "3.1",
                                type: "lite"
                            }
                        }
                    )
                    if (!this.haskey(box, 'data.runningHomeInfo')) {
                        console.log(`🙊  出错了,没获取到跑路数据....`)
                        break
                    }
                    let data = box.data
                    info = data.runningHomeInfo
                    if (parseFloat(data.assets)>=assets) {
                        let assets = parseFloat(data.assets)
                        let as = await this.algo.curl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=runningPreserveAssets&body={"linkId":"L-sOanK_5RJCz7I314FpnQ"}&t=1660919679853&appid=activities_platform&client=ios&clientVersion=3.9.2`,
                                cookie
                            }
                        )
                        console.log('🦊  领取成功:', assets, '.....')
                        info = this.haskey(as, 'data.runningHomeInfo') || {}
                        info.nextRunningTime = 3599998
                        break
                    }
                    else {
                        if (data.doubleSuccess) {
                            console.log('🦁  翻倍成功:', parseFloat(data.assets), "等待十几秒.....")
                            await this.wait(this.rand(12000, 16000))
                        }
                        else if (!data.doubleSuccess && !data.runningHomeInfo.runningFinish) {
                            console.log('🐶  开始跑步:', parseFloat(data.assets), "等待十几秒.....")
                            await this.wait(this.rand(12000, 16000))
                        }
                        else {
                            console.log('🙊  翻倍失败.....')
                            info.nextRunningTime = 3599998
                            break
                        }
                    }
                }
            }
            else {
                console.log("🐌  没有能量")
            }
        }
        if (this.haskey(info, 'prizeValue')) {
            this.print(`🐝  现有红包: ${info.prizeValue}`, p.user)
        }
        let team = await this.algo.curl({
                'url': `https://api.m.jd.com/?functionId=runningTeamInfo&body={"linkId":"L-sOanK_5RJCz7I314FpnQ"}&t=1660920651446&appid=activities_platform&client=ios&clientVersion=3.9.2`,
                // 'form':``,
                cookie,
                algo: {
                    appId: "448de",
                    version: "3.1",
                    type: "lite"
                }
            }
        )
        if (this.haskey(team, 'data.teamSumPrize')) {
            this.print(`🦉  战队总奖金: ${team.data.teamSumPrize}`, p.user)
        }
        // let prize = await this.algo.curl({
        //         'url': `https://api.m.jd.com/`,
        //         'form': `functionId=runningOpenBox&body={"linkId":"L-sOanK_5RJCz7I314FpnQ"}&t=1660919679853&appid=activities_platform&client=ios&clientVersion=3.9.2`,
        //         cookie,
        //         algo: {
        //             appId: "b6ac3",
        //             version: "3.1",
        //             type: "lite"
        //         }
        //     }
        // )
    }
}

module.exports = Main;
