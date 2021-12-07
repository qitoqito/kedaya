const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东东东农场"
        this.cron = "33 0,11,17,22 * * *"
        this.thread = 6
        this.task = 'local'
        this.help = 'local'
    }

    async prepare() {
        console.log("正在获取助力码")
        for (let i of this.cookies['help']) {
            let s = await this.curl({
                'url': 'https://api.m.jd.com/client.action?functionId=initForFarm',
                'form': `body={"version":11,"channel":3}&client=apple&clientVersion=10.0.4&osVersion=13.7&appid=wh5&loginType=2&loginWQBiz=interact`,
                cookie: i
            })
            try {
                this.code.push({
                    'shareCode': s.farmUserPro.shareCode
                })
            } catch (e) {
            }
        }
        console.log(this.dumps(this.code))
    }

    async main(p) {
        let cookie = p.cookie;
        let init = await this.curl({
                'url': 'https://api.m.jd.com/client.action?functionId=initForFarm',
                'form': `body={"version":11,"channel":3}&client=apple&clientVersion=10.0.4&osVersion=13.7&appid=wh5&loginType=2&loginWQBiz=interact`,
                cookie
            }
        )
        if (init.code == '3') {
            console.log(`错误了哟 ${init.msg}`)
            this.notices('账号过期了', p.user)
            return
        }
        if (!init.farmUserPro) {
            console.log("尝试种树")
            await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=choiceGoodsForFarm&body={"imageUrl":"","nickName":"","shareCode":"","goodsType":"mihoutao22","type":"0","babelChannel":"120","sid":"b1482460605540226922b0088199941w","un_area":"16_1341_1347_44750","version":14,"channel":1}&appid=wh5&client=apple&clientVersion=10.2.4`,
                    // 'form':``,
                    cookie
                }
            )
        }
        if (init.farmUserPro.treeState == 2) {
            console.log("可以兑换奖品了")
            this.notices('可以兑换奖品了', p.user)
        }
        else if (init.farmUserPro.treeState == 0) {
            console.log("正在播种")
            await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=choiceGoodsForFarm&body={"imageUrl":"","nickName":"","shareCode":"","goodsType":"mihoutao22","type":"0","babelChannel":"120","sid":"b1482460605540226922b0088199941w","un_area":"16_1341_1347_44750","version":14,"channel":1}&appid=wh5&client=apple&clientVersion=10.2.4`,
                    // 'form':``,
                    cookie
                }
            )
        }
        let fi = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=friendListInitForFarm&body={"lastId":null,"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                // 'form':``,
                cookie
            }
        )
        if (!fi.newFriendMsg) {
            let fcode = this.column([...this.code], 'shareCode')
            for (let i of this.random(fcode, 7)) {
                console.log("删除好友:", i)
                let sc = await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=deleteFriendForFarm&body={"shareCode":"${i}","version":8,"channel":1}&appid=wh5&client=apple&clientVersion=10.2.4`,
                    // 'form':``,
                    cookie
                })
                console.log("添加好友:", i)
                let tj = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=initForFarm&body={"mpin":"","utm_campaign":"","utm_medium":"appshare","shareCode":"${i}-inviteFriend","utm_term":"Wxfriends","utm_source":"iosapp","imageUrl":"","nickName":"","version":14,"channel":2,"babelChannel":0}&appid=wh5&client=apple&clientVersion=10.2.4`,
                        // 'form':``,
                        cookie
                    }
                )
            }
            await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=awardInviteFriendForFarm&body={}&appid=wh5&client=apple&clientVersion=10.2.4`,
                    // 'form':``,
                    cookie
                }
            )
        }
        let qdd = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=clockInForFarm&body={"type":1,"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                // 'form':``,
                cookie
            }
        )

        if (qdd.amount) {
            console.log("签到获得水滴", qdd.amount)
        }
        else {
            console.log("已经签到过了")
        }
        // 7天奖励
        qdd = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=clockInInitForFarm&body={"timestamp":${this.timestamp},"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                // 'form':``,
                cookie
            }
        )
        let jl = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=clockInForFarm&body={"type":2,"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                // 'form':``,
                cookie
            }
        )
        if (jl.amount) {
            console.log("连续签到获得水滴:", jl.amount)
        }
        for (let i of qdd.themes || []) {
            if (!i.hadGot) {
                let fo = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=clockInFollowForFarm&body={"id":"${i.id}","type":"theme","step":1,"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                        // 'form':``,
                        cookie
                    }
                )
                await this.wait(5000)
                let foo = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=clockInFollowForFarm&body={"id":"${i.id}","type":"theme","step":2,"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                        // 'form':``,
                        cookie
                    }
                )
                console.log("限时关注获得水滴:", foo.amount)
            }
        }
        // 领取弹窗水滴
        let tcs = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=gotWaterGoalTaskForFarm&body={"type":3,"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                // 'form':``,
                cookie
            }
        )
        if (tcs.amount) {
            console.log("弹窗获得水滴", qdd.amount)
        }
        // 东东乐园
        let ly = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=ddnc_farmpark_Init&body={"version":"1","channel":1}&client=wh5&clientVersion=1.0.0&uuid=`,
                cookie
            }
        )
        for (let i of ly.buildings || []) {
            if (i.name.includes('泡泡龙') || i.name.includes("天天红包")) {
                if (i.topResource.task.status == 1) {
                    console.log(`正在浏览:${i.name}`)
                    let pp = await this.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `functionId=ddnc_farmpark_markBrowser&body={"version":"1","channel":1,"advertId":"${i.topResource.task.advertId}"}&client=wh5&clientVersion=1.0.0&uuid=`,
                            cookie
                        }
                    )
                    await this.wait(i.topResource.task.browseSeconds * 1000)
                    let ppp = await this.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `functionId=ddnc_farmpark_browseAward&body={"version":"1","channel":1,"advertId":"${i.topResource.task.advertId}","index":8,"type":1}&client=wh5&clientVersion=1.0.0&uuid=`,
                            cookie
                        }
                    )
                }
            }
        }
        let taskList = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=taskInitForFarm&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                // 'form':``,
                cookie
            }
        )
        for (let i in taskList) {
            if (typeof (taskList[i]) == 'object') {
                let dotask = taskList[i]
                switch (i) {
                    case 'signInit':
                        if (dotask.todaySigned) {
                            console.log(`今天已签到,已经连续签到${dotask.totalSigned}天,下次签到可得${dotask.signEnergyEachAmount}g`);
                        }
                        else {
                            let qd = await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=signForFarm&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                    cookie
                                }
                            )
                            if (qd.code === "0") {
                                console.log(`【签到成功】获得${qd.amount}g💧`)
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
                                let s = await this.curl({
                                        'url': `https://api.m.jd.com/client.action?functionId=browseAdTaskForFarm&body={"advertId":"${j.advertId}","type":0,"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                        cookie
                                    }
                                )
                                await this.wait(j.time * 1000)
                                await this.curl({
                                        'url': `https://api.m.jd.com/client.action?functionId=browseAdTaskForFarm&body={"advertId":"${j.advertId}","type":1,"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                        cookie
                                    }
                                )
                            }
                        }
                        else {
                            console.log("浏览任务已完成")
                        }
                        break
                    case'waterRainInit':
                        if (!dotask.f) {
                            if (dotask.lastTime + 3 * 60 * 60 * 1000<this.timestamp) {
                                let s = await this.curl({
                                        'url': `https://api.m.jd.com/client.action`,
                                        'form': `functionId=waterRainForFarm&body={"type": 1, "hongBaoTimes": 100, "version": 3}&appid=wh5`,
                                        cookie
                                    }
                                )
                                if (s.code === '0') {
                                    console.log('水滴雨任务执行成功，获得水滴：' + s.addEnergy + 'g');
                                    console.log(`【第${dotask.winTimes + 1}次水滴雨】获得${s.addEnergy}g水滴`);
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
                            let js = await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=waterGoodForFarm&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            let s = await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=firstWaterTaskForFarm&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            if (s.code === '0') {
                                console.log(`【首次浇水奖励】获得${s.amount}g💧`);
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
                                        'url': `https://api.m.jd.com/client.action?functionId=friendListInitForFarm&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                        // 'form':``,
                                        cookie
                                    }
                                )
                                let nnn = 0
                                if (f.friends.length) {
                                    for (let ff of f.friends) {
                                        if (ff.friendState) {
                                            console.log(`正在给: ${ff.shareCode} 浇水`)
                                            let s = await this.curl({
                                                    'url': `https://api.m.jd.com/client.action?functionId=waterFriendForFarm&body={"shareCode":"${ff.shareCode}","version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                                    // 'form':``,
                                                    cookie
                                                }
                                            )
                                            nnn++
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
                            let ss = await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=waterFriendGotAwardForFarm&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                        }
                        else {
                            console.log(`给${dotask.waterFriendMax}个好友浇水任务已完成`)
                        }
                        break
                    case 'gotThreeMealInit':
                        if (!dotask.f) {
                            let s = await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=gotThreeMealForFarm&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            if (s.code === "0") {
                                console.log(`【定时领水】获得${s.amount}g💧`);
                            }
                            else {
                                console.log(`定时领水成功结果:  ${JSON.stringify(s)}`);
                            }
                        }
                        else {
                            console.log('当前不在定时领水时间或者已经领过')
                        }
                        break
                    case 'totalWaterTaskInit':
                        if (!dotask.f) {
                            if (dotask.totalWaterTaskTimes<dotask.totalWaterTaskLimit) {
                                for (let kk = 0; kk<dotask.totalWaterTaskLimit - dotask.totalWaterTaskTimes; kk++) {
                                    await this.curl({
                                            'url': `https://api.m.jd.com/client.action?functionId=waterGoodForFarm&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                            // 'form':``,
                                            cookie
                                        }
                                    )
                                }
                            }
                            let s = await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=totalWaterTaskForFarm&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            if (s.code === '0') {
                                console.log(`【十次浇水奖励】获得${s.totalWaterTaskEnergy}g💧`);
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
                            await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=ddnc_getTreasureBoxAward&body={"type":1,"babelChannel":"120","line":"getBean","version":14,"channel":1}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=findBeanScene`,
                                    'form': 'functionId=findBeanScene&body=%7B%22rnClient%22%3A%222%22%2C%22viewChannel%22%3A%22AppHome%22%2C%22source%22%3A%22AppHome%22%2C%22rnVersion%22%3A%224.7%22%7D&uuid=b39756aeea55b9cebae9f&client=apple&clientVersion=10.0.10&st=1638541231790&sv=100&sign=f7c5657c19354b17600ed5d59a6c0047',
                                    cookie
                                }
                            )
                            await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=beanTaskList`,
                                    'form': 'functionId=beanTaskList&body=%7B%22viewChannel%22%3A%22AppHome%22%7D&uuid=a2874756f39b780840&client=apple&clientVersion=10.0.10&st=1638541338389&sv=100&sign=f1aff99ef35e77739fef2967328475d1',
                                    cookie
                                }
                            )
                            await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=farmMarkStatus&body={"version":14,"channel":1,"babelChannel":"98"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=ddnc_getTreasureBoxAward&body={"type":2,"babelChannel":"98","line":"getBean","version":14,"channel":1}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                        }
                        break
                    default:
                        // console.log(i)
                        // console.log(dotask)
                        break
                }
            }
        }
        for (let i = 0; i<10; i++) {
            let s = await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=getFullCollectionReward&body={"type":2,"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                    // 'form':``,
                    cookie
                }
            )
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
        let remainTimes = 3;//今日剩余助力次数,默认3次（京东农场每人每天3次助力机会）。
        let helpSuccessPeoples = '';//成功助力好友
        for (let code of this.code) {
            if (code.finish) {
                continue
            }
            let s = await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=initForFarm&body={"mpin":"","utm_campaign":"t_335139774","utm_medium":"appshare","shareCode":"${code.shareCode}","utm_term":"Wxfriends","utm_source":"iosapp","imageUrl":"","nickName":"","version":14,"channel":2,"babelChannel":0}&appid=wh5&loginType=2&loginWQBiz=ddnc`,
                    'cookie': p.cookie
                }
            )
            if (s.code === '0') {
                if (s.helpResult.code === '0') {
                    //助力成功
                    salveHelpAddWater += s.helpResult.salveHelpAddWater;
                    console.log(`【助力好友结果】: 已成功给【${s.helpResult.masterUserInfo.nickName}】助力`);
                    console.log(`给好友【${s.helpResult.masterUserInfo.nickName}】助力获得${s.helpResult.salveHelpAddWater}g水滴`)
                    helpSuccessPeoples += (s.helpResult.masterUserInfo.nickName || '匿名用户') + ',';
                }
                else if (s.helpResult.code === '8') {
                    console.log(`【助力好友结果】: 助力【${s.helpResult.masterUserInfo.nickName}】失败，您今天助力次数已耗尽`);
                }
                else if (s.helpResult.code === '9') {
                    console.log(`【助力好友结果】: 之前给【${s.helpResult.masterUserInfo.nickName}】助力过了`);
                }
                else if (s.helpResult.code === '10') {
                    code.finish = 1
                    console.log(`【助力好友结果】: 好友【${s.helpResult.masterUserInfo.nickName}】已满五人助力`);
                }
                console.log(`【今日助力次数还剩】${s.helpResult.remainTimes}次`);
                let remainTimes = s.helpResult.remainTimes;
                if (s.helpResult.remainTimes === 0) {
                    console.log(`您当前助力次数已耗尽，跳出助力`);
                    break
                }
            }
            else {
                console.log(`助力失败::${JSON.stringify(s)}`);
            }
        }
        // 天天红包
        let red = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=initForTurntableFarm&body={"version":4,"channel":1}&appid=wh5`,
                // 'form':``,
                cookie
            }
        )
        for (let i of red.turntableBrowserAds) {
            if (!i.status) {
                console.log(`正在浏览:${i.main}`)
                let bt = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=browserForTurntableFarm&body={"type":1,"adId":"${i.adId}","version":4,"channel":1}&appid=wh5`,
                        // 'form':``,
                        cookie
                    }
                )
                await this.wait(i.browserTimes * 1000)
                let btt = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=browserForTurntableFarm&body={"type":2,"adId":"${i.adId}","version":4,"channel":1}&appid=wh5`,
                        // 'form':``,
                        cookie
                    }
                )
            }
        }
        let codess = [...this.code, ...this.code]
        for (let i = 0; i<3; i++) {
            let codd = (codess[i + p.index + 3] || codess[i] || codess[0]).shareCode
            console.log("天天红包助力", codd)
            let he = await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=initForFarm&body={"shareCode":"${codd}-3","lng":"0.000000","lat":"0.000000","sid":"2871ac0252645ef0e2731aa7d03c1d3w","un_area":"16_1341_1347_44750","version":14,"channel":1,"babelChannel":0}&appid=wh5`,
                    'cookie': p.cookie
                }
            )
        }
        // 天天红包定时奖励
        await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=timingAwardForTurntableFarm&body={"version":4,"channel":1}&appid=wh5`,
                // 'form':``,
                cookie
            }
        )
        let cj = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=initForTurntableFarm&body={"version":4,"channel":1}&appid=wh5`,
                // 'form':``,
                cookie
            }
        )
        for (let i = 0; i<cj.remainLotteryTimes; i++) {
            let s = await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=lotteryForTurntableFarm&body={"type":1,"version":4,"channel":1}&appid=wh5`,
                    // 'form':``,
                    cookie
                }
            )
            await this.wait(2000)
            console.log("抽奖:", this.dumps(s))
        }
        for (let i of Array(4)) {
            let exc = await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=farmAssistInit&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                    cookie
                }
            )
            if (!exc.f) {
                for (let i of exc.assistStageList || []) {
                    if (i.percentage == '100%') {
                        let excc = await this.curl({
                                'url': `https://api.m.jd.com/client.action?functionId=receiveStageEnergy&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                                cookie
                            }
                        )
                        if (excc.amount) {
                            console.log("助力有奖获得水滴:", excc.amount)
                        }
                        this.wait(1000)
                    }
                }
            }
        }
        init = await this.curl({
                'url': 'https://api.m.jd.com/client.action?functionId=initForFarm',
                'form': `body={"version":11,"channel":3}&client=apple&clientVersion=10.0.4&osVersion=13.7&appid=wh5&loginType=2&loginWQBiz=interact`,
                cookie
            }
        )
        for (let i = 0; i<(init.farmUserPro.totalEnergy - 110) / 10; i++) {
            let js = await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=waterGoodForFarm&body={"version":14,"channel":1,"babelChannel":"120"}&appid=wh5&client=apple&clientVersion=10.2.4`,
                    // 'form':``,
                    cookie
                }
            )
            if (!js.totalEnergy) {
                break
            }
            if (js.treeEnergy == init.farmUserPro.treeTotalEnergy) {
                this.notices("可以兑换奖品了", p.user)
            }
            console.log("正在浇水,剩余水滴:", js.totalEnergy, '总共浇水:', js.treeEnergy, '需要水滴', init.farmUserPro.treeTotalEnergy)
        }
    }
}

module.exports = Main;
