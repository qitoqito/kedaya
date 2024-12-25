const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东东东农场"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 10)},${this.rand(12, 22)} * * *`
        // this.thread = 2
        this.task = 'local'
        this.import = ['fs', 'jdAlgo']
        this.delay = 1000
        this.readme = `[jd_task_farm]
#signCard=1                   # 加签卡
#doubleCard=1             # 双倍水滴卡
#fastCard=1                   # 快速浇水卡
#beanCard=1                # 水滴换豆卡
#stock=200                    # 保留水滴数
#tenWater=1                 # 只做10次浇水的任务,后续不浇水
cache=1                          # 缓存助力code
#helpWaitting=20000     # 助力等待时间20s,默认6s
#helpRandom=1            # 随机助力
`
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({})
        console.log("正在获取助力码")
        this.fcode = []
        try {
            this.fcode = this.loads(this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_farmFriend.json`).toString())
        } catch (e) {
        }
        try {
            let txt = this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_farm.json`).toString()
            if (txt.includes("shareCode")) {
                this.code = this.loads(txt)
            }
        } catch (e) {
        }
        console.log(this.dumps(this.code))
    }

    async main(p) {
        let cookie = p.cookie;
        let finish = 0
        let init = await this.algo.curl({
            'url': ' http://api.m.jd.com/client.action?functionId=initForFarm',
            'form': `body={"version":19,"channel":1}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
            cookie,
            algo: {
                appId: "8a2af",
            }
        })
        if (!this.haskey(init, 'code', "0")) {
            init = await this.curl({
                'url': ` http://api.m.jd.com/client.action?functionId=initForFarm&body={"imageUrl":"","nickName":"","version":4,"channel":1}&appid=wh5`,
                cookie
            })
        }
        if (init.code == '3') {
            console.log(`错误了哟 ${init.msg}`)
            this.notices('账号过期了', p.user)
            return
        }
        if (!init.farmUserPro) {
            console.log("正在播种")
            await this.algo.curl({
                'url': ` http://api.m.jd.com/client.action?functionId=choiceGoodsForFarm&body={"imageUrl":"","nickName":"","shareCode":"","goodsType":"mihoutao22","type":"0","babelChannel":"121","version":19,"channel":1}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                cookie
            })
        }
        if (init.farmUserPro.treeState == 2) {
            console.log("可以兑换奖品了")
            finish = 1
            this.notices('可以兑换奖品了', p.user)
        }
        else if (init.farmUserPro.treeState == 0) {
            console.log("正在播种")
            let exc = await this.curl({
                'url': ` http://api.m.jd.com/client.action?functionId=getExchangeLevelList&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                cookie
            })
            if (this.haskey(init, 'farmLevelWinGoods')) {
                let goods
                for (let i of Object.values(init.farmLevelWinGoods)) {
                    if (this.dumps(i) != "[]") {
                        goods = i[0]
                    }
                }
                if (goods) {
                    console.log(`正在种植:`, goods.name)
                    let choic = await this.algo.curl({
                        'url': ` http://api.m.jd.com/client.action?functionId=choiceGoodsForFarm&body={"goodsType":"${goods.type}","type":"0","babelChannel":"121","version":19,"channel":1}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                        cookie
                    })
                }
            }
        }
        let amount = this.haskey(init, 'farmUserPro.totalEnergy')
        let treeTotalEnergy = this.haskey(init, 'farmUserPro.treeTotalEnergy')
        let fi = await this.curl({
            'url': ` http://api.m.jd.com/client.action?functionId=friendListInitForFarm&body={"version":19,"channel":1,"babelChannel":"121","lat":"0","lng":"0"}&appid=wh5&osVersion=15.1.1&screen=390*844&networkType=wifi&timestamp=1670428885339&d_brand=iPhone&d_model=iPhone13%2C3&wqDefault=false&client=iOS&clientVersion=13.8.1&partner=&build=168341&openudid=7b01d4690ef13716984dcfcf96068f36b41f6c51`,
            cookie
        })
        if (!this.dumps(this.code).includes(init.farmUserPro.shareCode)) {
            this.code.push({
                shareCode: init.farmUserPro.shareCode,
                user: p.user
            })
        }
        if (finish) {
            this.dict[this.userPin(cookie)] = {
                shareCode: init.farmUserPro.shareCode,
                user: p.user,
                finish: 1
            }
        }
        else {
            this.dict[this.userPin(cookie)] = {
                shareCode: init.farmUserPro.shareCode,
                user: p.user
            }
        }
        if (!fi.newFriendMsg) {
            this.fcode = this.unique([...this.fcode, ...this.column(fi.friends, 'shareCode'), ...this.column([...this.code], 'shareCode')])
            let fcode = this.fcode
            for (let i of this.random(fcode, 4)) {
                console.log("添加好友:", i)
                let tj = await this.algo.curl({
                    'url': ` http://api.m.jd.com/client.action?functionId=initForFarm&body={"mpin":"","utm_campaign":"","utm_medium":"appshare","shareCode":"${i}-inviteFriend","utm_term":"Wxfriends","utm_source":"iosapp","imageUrl":"","nickName":"","version":19,"channel":2,"babelChannel":0}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                    cookie,
                    algo: {
                        appId: "8a2af",
                    }
                })
                console.log("添加状态码:", this.haskey(tj, 'helpResult.code'))
            }
            await this.algo.curl({
                'url': ` http://api.m.jd.com/client.action?functionId=awardInviteFriendForFarm&body={"version":19,"channel":1,"babelChannel":"10","lat":"0","lng":"0"}&appid=signed_wh5&osVersion=15.1.1&screen=390*844&networkType=wifi&timestamp=1676961148171&d_brand=iPhone&d_model=iPhone13%2C3&wqDefault=false&client=iOS&clientVersion=11.6.0&partner=&build=168528`,
                cookie,
                algo: {
                    appId: "2b5ca",
                }
            })
        }
        let qdd = await this.algo.curl({
            'url': ` http://api.m.jd.com/client.action?functionId=clockInForFarm&body={"type":1,"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
            cookie,
            algo: {
                appId: "32b94",
            }
        })
        if (qdd.amount) {
            console.log("签到获得水滴", qdd.amount)
        }
        else {
            console.log("已经签到过了")
        }
        // 7天奖励
        qdd = await this.algo.curl({
            'url': ` http://api.m.jd.com/client.action?functionId=clockInInitForFarm&body={"timestamp":${this.timestamp},"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
            cookie,
            algo: {
                appId: "08dc3",
            }
        })
        for (let i of qdd.themes || []) {
            if (!i.hadGot) {
                let fo = await this.algo.curl({
                    'url': ` http://api.m.jd.com/client.action?functionId=clockInFollowForFarm&body={"id":"${i.id}","type":"theme","step":1,"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                    cookie,
                    algo: {
                        appId: "4a0b4",
                    }
                })
                await this.wait(5000)
                let foo = await this.algo.curl({
                    'url': ` http://api.m.jd.com/client.action?functionId=clockInFollowForFarm&body={"id":"${i.id}","type":"theme","step":2,"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                    cookie,
                    algo: {
                        appId: "4a0b4",
                    }
                })
                console.log("限时关注获得水滴:", foo.amount)
            }
        }
        // 领取弹窗水滴
        let tcs = await this.algo.curl({
            'url': ` http://api.m.jd.com/client.action?functionId=gotWaterGoalTaskForFarm&body={"type":3,"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
            cookie,
            algo: {
                appId: "c901b",
            }
        })
        if (tcs.amount) {
            console.log("弹窗获得水滴", qdd.amount)
        }
        // 东东乐园
        let ly = await this.curl({
            'url': ` http://api.m.jd.com/client.action`,
            'form': `functionId=ddnc_farmpark_Init&body={"version":19,"channel":1}&client=wh5&clientVersion=1.0.0&uuid=`,
            cookie
        })
        for (let i of ly.buildings || []) {
            if (i.name.includes('泡泡龙') || i.name.includes("天天红包")) {
                if (this.haskey(i, 'topResource.task.status', 1)) {
                    console.log(`正在浏览:${i.name}`)
                    let pp = await this.curl({
                        'url': ` http://api.m.jd.com/client.action`,
                        'form': `functionId=ddnc_farmpark_markBrowser&body={"version":19,"channel":1,"advertId":"${i.topResource.task.advertId}"}&client=wh5&clientVersion=1.0.0&uuid=`,
                        cookie
                    })
                    console.log(pp)
                    await this.wait(i.topResource.task.browseSeconds * 1000)
                    let ppp = await this.curl({
                        'url': ` http://api.m.jd.com/client.action`,
                        'form': `functionId=ddnc_farmpark_browseAward&body={"version":19,"channel":1,"advertId":"${i.topResource.task.advertId}","index":8,"type":1}&client=wh5&clientVersion=1.0.0&uuid=`,
                        cookie
                    })
                }
            }
        }
        for (let n = 1; n<=2; n++) {
            let taskList = await this.algo.curl({
                'url': ` http://api.m.jd.com/client.action?functionId=taskInitForFarm&body={"version":19,"channel":${n},"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                cookie,
                algo: {
                    appId: "fcb5a",
                }
            })
            for (let i in taskList) {
                if (typeof (taskList[i]) == 'object') {
                    let dotask = taskList[i]
                    switch (i) {
                        case 'signInit':
                            if (dotask.todaySigned) {
                                console.log(`今天已签到,已经连续签到${dotask.totalSigned}天,下次签到可得${dotask.signEnergyEachAmount}g`);
                            }
                            else {
                                let qd = await this.algo.curl({
                                    'url': ` http://api.m.jd.com/client.action?functionId=signForFarm&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                    cookie
                                })
                                if (qd.code === "0") {
                                    console.log(`签到成功获得${qd.amount}g💧`)
                                }
                                else {
                                    console.log(`签到结果:  ${JSON.stringify(qd)}`);
                                }
                            }
                            break
                        case 'gotBrowseTaskAdInit':
                            if (!dotask.f) {
                                for (let j of dotask.userBrowseTaskAds) {
                                    console.log("正在浏览任务")
                                    let s = await this.algo.curl({
                                        'url': ` http://api.m.jd.com/client.action?functionId=browseAdTaskForFarm&body={"advertId":"${j.advertId}","type":0,"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                        cookie,
                                        algo: {
                                            appId: "53f09",
                                        }
                                    })
                                    await this.wait(j.time * 1000)
                                    await this.algo.curl({
                                        'url': ` http://api.m.jd.com/client.action?functionId=browseAdTaskForFarm&body={"advertId":"${j.advertId}","type":1,"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                        cookie,
                                        algo: {
                                            appId: "53f09",
                                        }
                                    })
                                }
                            }
                            else {
                                console.log("浏览任务已完成")
                            }
                            break
                        case 'waterRainInit':
                            if (!dotask.f) {
                                if (dotask.lastTime + 3 * 60 * 60 * 1000<this.timestamp) {
                                    let s = await this.algo.curl({
                                        'url': ` http://api.m.jd.com/client.action`,
                                        'form': `functionId=waterRainForFarm&body={"type":1,"hongBaoTimes":100,"version":19}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                        cookie
                                    })
                                    if (s.code === '0') {
                                        console.log('水滴雨任务执行成功，获得水滴：' + s.addEnergy + 'g');
                                        console.log(`第${dotask.winTimes + 1}次水滴雨获得${s.addEnergy}g水滴`);
                                    }
                                }
                                else {
                                    console.log("还未到时间可收取水滴雨")
                                }
                            }
                            else {
                                console.log("水滴雨已经完成")
                            }
                            break
                        case 'firstWaterInit':
                            if (!dotask.f) {
                                let js = await this.algo.curl({
                                    'url': ` http://api.m.jd.com/client.action?functionId=waterGoodForFarm&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                    cookie,
                                    algo: {
                                        appId: "0c010",
                                    }
                                })
                                let s = await this.algo.curl({
                                    'url': ` http://api.m.jd.com/client.action?functionId=firstWaterTaskForFarm&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                    cookie,
                                    algo: {
                                        appId: "0cf1e",
                                    }
                                })
                                if (s.code === '0') {
                                    console.log(`首次浇水奖励获得${s.amount}g💧`);
                                }
                                else {
                                    console.log(`领取首次浇水奖励结果:  ${JSON.stringify(s)}`);
                                }
                            }
                            else {
                                console.log("首次浇水任务已完成")
                            }
                            break
                        case 'waterFriendTaskInit':
                            if (!dotask.f) {
                                if (dotask.waterFriendCountKey<dotask.waterFriendMax) {
                                    let f = await this.curl({
                                        'url': ` http://api.m.jd.com/client.action?functionId=friendListInitForFarm&body={"version":19,"channel":1,"babelChannel":"121","lat":"0","lng":"0"}&appid=wh5&osVersion=15.1.1&screen=390*844&networkType=wifi&timestamp=1670428885339&d_brand=iPhone&d_model=iPhone13%2C3&wqDefault=false&client=iOS&clientVersion=13.8.1&partner=&build=168341&openudid=7b01d4690ef13716984dcfcf96068f36b41f6c51`,
                                        cookie
                                    })
                                    let nnn = 0
                                    if (f.friends.length) {
                                        for (let ff of f.friends) {
                                            if (ff.friendState) {
                                                console.log(`正在给: ${ff.shareCode} 浇水`)
                                                let s = await this.algo.curl({
                                                    'url': ` http://api.m.jd.com/client.action?functionId=waterFriendForFarm&body={"shareCode":"${ff.shareCode}","version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                                    cookie,
                                                    algo: {
                                                        appId: "673a0",
                                                    }
                                                })
                                                nnn++
                                                // await this.wait(3000)
                                            }
                                            if (nnn == 2) {
                                                break
                                            }
                                        }
                                    }
                                    else {
                                        console.log("请添加好友再来吧")
                                    }
                                }
                                let ss = await this.algo.curl({
                                    'url': ` http://api.m.jd.com/client.action?functionId=waterFriendGotAwardForFarm&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                    cookie,
                                    algo: {
                                        appId: "d08ff",
                                    }
                                })
                            }
                            else {
                                console.log(`给${dotask.waterFriendMax}个好友浇水任务已完成`)
                            }
                            break
                        case 'gotThreeMealInit':
                            if (!dotask.f) {
                                let s = await this.algo.curl({
                                    'url': ` http://api.m.jd.com/client.action?functionId=gotThreeMealForFarm&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                    cookie,
                                    algo: {
                                        appId: "57b30",
                                    }
                                })
                                if (s.code === "0") {
                                    console.log(`定时领水获得${s.amount}g💧`);
                                }
                                else {
                                    console.log(`定时领水成功结果:  ${JSON.stringify(s)}`);
                                }
                            }
                            else {
                                console.log('当前不在定时领水时间或者已经领过')
                            }
                            break
                        case 'treasureBoxInit':
                            if (!dotask.f) {
                                let s = await this.algo.curl({
                                    'url': ` http://api.m.jd.com/client.action?functionId=ddnc_getTreasureBoxAward&body={"babelChannel":"121","line":"","channel":1,"type":1,"version":19}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                    cookie,
                                    algo: {
                                        appId: "67dfc",
                                    }
                                })
                                await this.algo.curl({
                                    'url': ` http://api.m.jd.com/client.action?functionId=ddnc_getTreasureBoxAward&body={"babelChannel":"121","line":"","channel":1,"type":2,"version":19}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                    cookie,
                                    algo: {
                                        appId: "67dfc",
                                    }
                                })
                            }
                            break
                        case 'totalWaterTaskInit':
                            if (!dotask.f) {
                                if (dotask.totalWaterTaskTimes<dotask.totalWaterTaskLimit) {
                                    for (let kk = 0; kk<dotask.totalWaterTaskLimit - dotask.totalWaterTaskTimes + 6; kk++) {
                                        await this.algo.curl({
                                            'url': ` http://api.m.jd.com/client.action?functionId=waterGoodForFarm&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                            cookie,
                                            algo: {
                                                appId: "0c010",
                                            }
                                        })
                                    }
                                }
                                let s = await this.algo.curl({
                                    'url': ` http://api.m.jd.com/client.action?functionId=totalWaterTaskForFarm&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                    cookie
                                })
                                if (s.code === '0') {
                                    console.log(`十次浇水奖励获得${s.totalWaterTaskEnergy}g💧`);
                                }
                                else {
                                    console.log(`领取10次浇水奖励结果:  ${JSON.stringify(s)}`);
                                }
                            }
                            else {
                                console.log("累计浇水已经完成")
                            }
                            break
                        case 'treasureBoxInit-getBean':
                            if (!dotask.f) {
                                await this.algo.curl({
                                    'url': ` http://api.m.jd.com/client.action?functionId=ddnc_getTreasureBoxAward&body={"babelChannel":"121","line":"getBean","channel":1,"type":1,"version":19}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                    cookie,
                                    algo: {
                                        appId: "67dfc",
                                    }
                                })
                                await this.algo.curl({
                                    'url': ` http://api.m.jd.com/client.action?functionId=ddnc_getTreasureBoxAward&body={"babelChannel":"121","line":"getBean","channel":1,"type":2,"version":19}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                                    cookie,
                                    algo: {
                                        appId: "67dfc",
                                    }
                                })
                            }
                            break
                        default:
                            break
                    }
                }
            }
        }
        for (let i = 0; i<10; i++) {
            let s = await this.algo.curl({
                'url': ` http://api.m.jd.com/client.action?functionId=getFullCollectionReward&body={"type":2,"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                cookie,
                algo: {
                    appId: "5c767",
                }
            })
            if (s.code === '0') {
                if (!s.hasLimit) {
                    console.log(`小鸭子游戏:${s.title}`);
                }
                else {
                    console.log(`${s.title}`)
                    break;
                }
            }
            else if (s.code === '10') {
                console.log(`小鸭子游戏达到上限`)
                break;
            }
        }
        let salveHelpAddWater = 0;
        let remainTimes = 3; //今日剩余助力次数,默认3次（京东农场每人每天3次助力机会）。
        let helpSuccessPeoples = ''; //成功助力好友
        let helpCode = this.profile.helpRandom ? this.random(this.code, this.code.length) : this.code
        for (let code of helpCode) {
            if (code.finish) {
                continue
            }
            let s = await this.algo.curl({
                // 'url': ` http://api.m.jd.com/client.action?functionId=initForFarm&body={"mpin":"","utm_campaign":"t_335139774","utm_medium":"appshare","shareCode":"${code.shareCode}","utm_term":"Wxfriends","utm_source":"iosapp","imageUrl":"","nickName":"${p.user}","version":19,"channel":2,"babelChannel":0}&appid=signed_mp&osVersion=iOS%2013.7&screen=375*667&networkType=true&timestamp=1662220836165&d_brand=iPhone&d_model=iPhone%206s%3CiPhone8%2C1%3E&wqDefault=true&client=ios&clientVersion=8.0.29`,
                'url': ' http://api.m.jd.com/client.action?functionId=initForFarm',
                'form': `body={"utm_medium":"appshare","shareCode":"${code.shareCode}","utm_term":"Wxfriends","utm_source":"iosapp","imageUrl":"","nickName":"${p.user}","version":19,"channel":1}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                'cookie': p.cookie,
                algo: {
                    // type: "weixin",
                    appId: "8a2af",
                },
                // referer: " http://servicewechat.com/wx91d27dbf599dff74/672/page-frame.html",
                // ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN"
            })
            if (this.haskey(s, 'code', '0')) {
                if (s.helpResult.code === '0') {
                    //助力成功
                    salveHelpAddWater += s.helpResult.salveHelpAddWater;
                    console.log(`助力好友结果: 已成功给${s.helpResult.masterUserInfo.nickName}助力`);
                    console.log(`给好友${s.helpResult.masterUserInfo.nickName}助力获得${s.helpResult.salveHelpAddWater}g水滴`)
                    helpSuccessPeoples += (s.helpResult.masterUserInfo.nickName || '匿名用户') + ',';
                }
                else if (s.helpResult.code === '8') {
                    console.log(`助力好友结果: 助力${s.helpResult.masterUserInfo.nickName}失败，您今天助力次数已耗尽`);
                }
                else if (s.helpResult.code === '9') {
                    console.log(`助力好友结果: 之前给${s.helpResult.masterUserInfo.nickName}助力过了`);
                }
                else if (s.helpResult.code === '10') {
                    code.finish = 1
                    console.log(`助力好友结果: 好友${s.helpResult.masterUserInfo.nickName}已满五人助力`);
                }
                console.log(`今日助力次数还剩: ${s.helpResult.remainTimes}次`);
                let remainTimes = s.helpResult.remainTimes;
                if (s.helpResult.remainTimes === 0) {
                    console.log(`您当前助力次数已耗尽，跳出助力`);
                    break
                }
                let helpWaitting = parseInt(this.profile.helpWaitting || 6000)
            }
            else if (s.code == "403") {
                console.log("运行环境异常，请您从正规渠道参与活动，稍后再试~")
                break
            }
            else {
                console.log(`助力失败: ${JSON.stringify(s)}`);
            }
        }
        // 天天红包
        let red = await this.curl({
            'url': ` http://api.m.jd.com/client.action?functionId=initForTurntableFarm&body={"version":19,"channel":1}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
            cookie,
        })
        for (let i of this.haskey(red, 'turntableBrowserAds')) {
            if (!i.status) {
                console.log(`正在浏览:${i.main}`)
                let bt = await this.curl({
                    'url1': ` http://api.m.jd.com/client.action?functionId=browserForTurntableFarm&body={"type":1,"adId":"${i.adId}","version":19,"channel":1}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                    'url': ` http://api.m.jd.com/client.action?functionId=browserForTurntableFarm&body={"type":1,"adId":"${i.adId}","version":4,"channel":1}&appid=wh5`,
                    cookie,
                })
                console.log(bt)
                await this.wait(i.browserTimes * 1000)
                let btt = await this.curl({
                    'url': ` http://api.m.jd.com/client.action?functionId=browserForTurntableFarm&body={"type":2,"adId":"${i.adId}","version":4,"channel":1}&appid=wh5`,
                    cookie
                })
            }
        }
        let codess = [...this.code, ...this.code]
        for (let i = 0; i<5; i++) {
            let codd = (codess[i + p.index + 3] || codess[i] || this.random(codess, 1)[0]).shareCode
            console.log("天天红包助力:", codd)
            if (i>4) {
                // 把一些错误剩余没有助力到的给主号
                codd = codess[this.rand(0, 3)].shareCode
            }
            let he = await this.algo.curl({
                'url': ` http://api.m.jd.com/client.action?functionId=initForFarm&body={"shareCode":"${codd}-3","lng":"0.000000","lat":"0.000000","version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                'cookie': p.cookie,
                algo: {
                    appId: "8a2af",
                }
            })
            if (!this.haskey(he, 'helpResult')) {
                break
            }
            console.log("助力状态码:", this.haskey(he, 'helpResult.code'))
            if (this.haskey(he, 'helpResult.code', '13')) {
                break
            }
            // await this.wait(3000)
        }
        // 天天红包定时奖励
        await this.curl({
            'url': ` http://api.m.jd.com/client.action?functionId=timingAwardForTurntableFarm&body={"version":19,"channel":1}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
            cookie
        })
        let cj = await this.curl({
            'url': ` http://api.m.jd.com/client.action?functionId=initForTurntableFarm&body={"version":19,"channel":1}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
            cookie
        })
        for (let i = 0; i<cj.remainLotteryTimes; i++) {
            let s = await this.curl({
                'url': ` http://api.m.jd.com/client.action?functionId=lotteryForTurntableFarm&body={"type":1,"version":4,"channel":1}&appid=wh5`,
                cookie
            })
            // await this.wait(2000)
            console.log("抽奖:", this.dumps(s))
        }
        for (let i of Array(4)) {
            let exc = await this.algo.curl({
                'url': ` http://api.m.jd.com/client.action?functionId=farmAssistInit&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                cookie,
                algo: {
                    appId: "92354",
                }
            })
            if (!exc.f) {
                for (let i of exc.assistStageList || []) {
                    if (i.percentage == '100%') {
                        let excc = await this.algo.curl({
                            'url': ` http://api.m.jd.com/client.action?functionId=receiveStageEnergy&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                            cookie,
                            algo: {
                                appId: "15507",
                            }
                        })
                        if (excc.amount) {
                            console.log("助力有奖获得水滴:", excc.amount)
                        }
                        // this.wait(1000)
                    }
                }
            }
        }
        init = await this.algo.curl({
            'url': ' http://api.m.jd.com/client.action?functionId=initForFarm',
            'form': `body={"version":19,"channel":1}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
            cookie,
            algo: {
                appId: "8a2af",
            }
        })
        amount = this.haskey(init, 'farmUserPro.totalEnergy') || amount
        // let treeTotalEnergy = this.haskey(init, 'farmUserPro.treeTotalEnergy')
        let myCard = await this.algo.curl({
            'url': ` http://api.m.jd.com/client.action?functionId=myCardInfoForFarm&body={"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
            cookie,
            algo: {
                appId: "157b6",
            }
        })
        if (this.haskey(myCard, 'cardInfos')) {
            let cardInfos = this.column(myCard.cardInfos, 'useTimesInDay', 'type')
            if (this.profile.doubleCard && amount>99 && myCard.doubleCard) {
                // await this.wait(2000)
                for (let i of Array(3)) {
                    let doubleCard = await this.algo.curl({
                        'url': ` http://api.m.jd.com/client.action?functionId=userMyCardForFarm&body={"cardType":"doubleCard","type":"","version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                        cookie,
                        algo: {
                            appId: "86ba5",
                        }
                    })
                    if (this.haskey(doubleCard, 'addWater')) {
                        console.log("双倍水滴:", doubleCard.addWater)
                        amount += doubleCard.addWater
                        // await this.wait(2000)
                    }
                    else {
                        console.log("加倍失败")
                        break
                    }
                }
            }
            if (this.profile.beanCard && myCard.beanCard) {
                // await this.wait(2000)
                for (let i = 0; i<=Math.min(parseInt(amount / 101), myCard.beanCard); i++) {
                    let d = await this.algo.curl({
                        'url': ` http://api.m.jd.com/client.action?functionId=userMyCardForFarm&body={"cardType":"beanCard","type":"","version":19,"channel":1,"babelChannel":"121","lat":"0","lng":"0"}&appid=signed_wh5&client=iOS&clientVersion=10.4.0`,
                        cookie,
                        algo: {
                            appId: "86ba5",
                        }
                    })
                    if (d.beanCount) {
                        amount = amount - d.useWater
                        console.log(p.user, `水滴换豆: ${d.beanCount}`)
                        // await this.wait(2000)
                    }
                    else {
                        break
                    }
                }
            }
            if (this.profile.signCard && myCard.signCard) {
                // await this.wait(2000)
                for (let i of Array(3)) {
                    let signCard = await this.algo.curl({
                        'url': ` http://api.m.jd.com/client.action?functionId=userMyCardForFarm&body={"cardType":"signCard","type":"","version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                        cookie,
                        algo: {
                            appId: "86ba5",
                        }
                    })
                    if (this.haskey(signCard, 'signDay')) {
                        console.log("正在加签:", signCard.signDay)
                        // await this.wait(2000)
                    }
                    else {
                        console.log("加签失败")
                        break
                    }
                }
            }
        }
        let jl = await this.algo.curl({
            'url': ` http://api.m.jd.com/client.action?functionId=clockInForFarm&body={"type":2,"version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
            cookie,
            algo: {
                appId: "32b94",
            }
        })
        if (jl.amount) {
            console.log("连续签到获得水滴:", jl.amount)
            amount += jl.amountamount
        }
        let stock = parseInt(this.profile.stock || 110)
        if (!this.profile.tenWater) {
            if (this.profile.fastCard && myCard.fastCard && amount - 100>stock) {
                // await this.wait(2000)
                for (let i = 0; i<(amount / 100); i++) {
                    if (amount - 100<stock) {
                        break
                    }
                    let fastCard = await this.algo.curl({
                        'url': ` http://api.m.jd.com/client.action?functionId=userMyCardForFarm&body={"cardType":"fastCard","type":"","version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                        cookie,
                        algo: {
                            appId: "86ba5",
                        }
                    })
                    if (this.haskey(fastCard, 'waterEnergy')) {
                        console.log("快速浇水:", fastCard.waterEnergy)
                        amount = amount - fastCard.waterEnergy
                        // await this.wait(2000)
                    }
                    else {
                        console.log("快速浇水失败")
                        break
                    }
                }
            }
            // await this.wait(2000)
            for (let i = 0; i<(amount - stock) / 10; i++) {
                for (let j = 0; j<3; j++) {
                    var js = await this.algo.curl({
                        'url': ` http://api.m.jd.com/client.action?functionId=waterGoodForFarm&body={"type":"","version":19,"channel":1,"babelChannel":"121"}&appid=signed_wh5&client=iOS&clientVersion=13.8.1`,
                        cookie,
                        algo: {
                            appId: "0c010",
                        }
                    })
                    if (js.totalEnergy) {
                        break
                    }
                    else {
                        // await this.wait(2000)
                    }
                }
                if (!js.totalEnergy) {
                    break
                }
                if (js.treeEnergy == treeTotalEnergy) {
                    this.notices("可以兑换奖品了", p.user)
                }
                console.log("正在浇水,剩余水滴:", js.totalEnergy, '总共浇水:', js.treeEnergy, '需要水滴', treeTotalEnergy)
            }
        }
    }

    async extra() {
        console.log(`此次运行助力码:`)
        console.log(this.dumps(Object.values(this.dict)))
        if (this.profile.cache) {
            console.log("已经设置缓存:/invite/jd_task_farm.json,跳过写入")
        }
        else {
            console.log("农场有检测,号多容易黑ip,建议缓存JSON文件")
            let json = []
            for (let cookie of this.cookies.all) {
                let pin = this.userPin(cookie)
                if (this.dict[pin]) {
                    delete this.dict[pin].finish
                    json.push(this.dict[pin])
                }
            }
            if (json.length) {
                await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_farm.json`, this.dumps(json), (error) => {
                    if (error) return console.log("写入化失败" + error.message);
                    console.log("东东农场ShareCode写入成功");
                })
            }
        }
        await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_farmFriend.json`, this.dumps(this.fcode), (error) => {
            if (error) return console.log("写入化失败" + error.message);
            console.log("东东农场好友列表写入成功");
        })
    }
}

module.exports = Main;
