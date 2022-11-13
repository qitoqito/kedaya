const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东东东萌宠"
        this.cron = "23 */6 * * *"
        this.task = 'local'
        // this.thread = 2
        this.turn = 2
        this.readme = `[jd_task_pet] 
#helpWaitting=20000     # 助力等待时间20s,默认6s`
    }

    async main(p) {
        let cookie = p.cookie;
        if (this.turnCount == 0) {
            let home = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=initPetTown&body={"version":1}&appid=wh5&client=apple&clientVersion=10.3.0&build=167903&rfs=0000`,
                    cookie
                }
            )
            let petStatus = home.result.petStatus
            if (petStatus == 5) {
                this.notices(`${home.result.goodsInfo.goodsName}可以领取了`, p.user)
            }
            if (!home.result.goodsInfo) {
                this.notices('没有选择商品', p.user)
                await this.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=newUserGifts&body={}&appid=wh5&client=apple&clientVersion=10.3.0&build=167903&rfs=0000`,
                        cookie
                    }
                )
                // 宠物里面没有选择商品,自动选择4星商品
                // let l = await this.curl({
                //         'url': `https://api.m.jd.com/client.action`,
                //         'form': `functionId=goodsInfoList&body={"type":2}&appid=wh5&client=apple&clientVersion=10.3.0&build=167903&rfs=0000`,
                //         cookie
                //     }
                // )
                let a = await this.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=goodsInfoUpdate&body={"goodsId":"10029324995770"}&appid=wh5&client=apple&clientVersion=10.3.0&build=167903&rfs=0000`,
                        cookie
                    }
                )
                console.log(a.result)
            }
            if (this.haskey(home, 'result.petSportReward')) {
                console.log(this.haskey(home, 'result.petSportReward'))
                console.log(p.user, `汪汪出门带回了${home.result.petSportReward.foodReward}g狗粮`)
            }
            let shareCode = home.result.shareCode
            let fs = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=masterHelpInit&body={"version":1}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                    cookie
                }
            )
            if (this.haskey(fs, 'result.masterHelpPeoples') && fs.result.masterHelpPeoples.length>4) {
                if (!fs.result.addedBonusFlag) {
                    let r = await this.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `functionId=getHelpAddedBonus&body={"version":1}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                            cookie
                        }
                    )
                    console.log(p.user, `额外获得狗粮: ${this.haskey(r, 'result.reward')}`)
                }
            }
            else {
                this.shareCode.push({shareCode, count: fs.result.masterHelpPeoples.length})
            }
            let food = home.result.foodAmount
            // 遛狗
            for (let i = 0; i<10; i++) {
                let lg = await this.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=petSport&body={}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                        cookie
                    }
                )
                if (lg.message == '达到宠物运动次数上限' || lg.message == '未达到开启宠物运动条件') {
                    break
                }
                console.log(p.user, `获得运动狗粮: ${this.haskey(lg, 'result.foodReward') || 0}`)
                await this.wait(1000)
                await this.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=getSportReward&body={}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                        cookie
                    }
                )
                await this.wait(1000)
            }
            // 喂食
            if (food>100) {
                for (let i = 0; i<Math.min((food - 100) / 10, 10); i++) {
                    let f = await this.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `functionId=feedPets&body={"version":1}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                            cookie
                        }
                    )
                    if (f.result) {
                        console.log(p.user, `喂食成功`)
                    }
                    await this.wait(1000)
                }
            }
            // 做任务
            let l = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=taskInit&body={"version":2,"channel":"app"}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                    cookie
                }
            )
            for (let i in l.result) {
                let data = l.result[i]
                if (!data.finished) {
                    switch (i) {
                        case 'firstFeedInit':
                            console.log(p.user, `正在做: 首次喂狗`)
                            let zf = await this.curl({
                                    'url': `https://api.m.jd.com/client.action`,
                                    'form': `functionId=getFirstFeedReward&body={}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                                    cookie
                                }
                            )
                            console.log(p.user, `获得狗粮: ${this.haskey(zf, 'result.reward')}`)
                            break
                        case 'signInit':
                            console.log(p.user, `正在做: 每日签到`)
                            let zs = await this.curl({
                                    'url': `https://api.m.jd.com/client.action`,
                                    'form': `functionId=getSignReward&body={}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                                    cookie
                                }
                            )
                            console.log(p.user, `获得狗粮: ${this.haskey(zs, 'result.signReward')}, 签到天数: ${this.haskey(zs, 'result.signDay')}`)
                            break
                        case 'threeMealInit':
                            console.log(p.user, `正在做: 每日三餐开福袋`)
                            let zt = await this.curl({
                                    'url': `https://api.m.jd.com/client.action`,
                                    'form': `functionId=getThreeMealReward&body={}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                                    cookie
                                }
                            )
                            console.log(p.user, `获得狗粮: ${this.haskey(zt, 'result.threeMealReward')}`)
                            break
                        case 'feedReachInit':
                            console.log(p.user, `正在做: 每日喂狗10次`)
                            if (food>=(data.feedReachAmount - data.hadFeedAmount)) {
                                for (let i = 0; i<(data.feedReachAmount - data.hadFeedAmount) / 10; i++) {
                                    let f = await this.curl({
                                            'url': `https://api.m.jd.com/client.action`,
                                            'form': `functionId=feedPets&body={"version":1}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                                            cookie
                                        }
                                    )
                                    if (f.result) {
                                        console.log(p.user, `喂食成功`)
                                    }
                                    await this.wait(1000)
                                }
                            }
                            let zft = await this.curl({
                                    'url': `https://api.m.jd.com/client.action`,
                                    'form': `functionId=getFeedReachReward&body={}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                                    cookie
                                }
                            )
                            console.log(p.user, `获得狗粮: ${this.haskey(zft, 'result.reward')}`)
                            break
                        case 'browseSingleShopInit':
                        case 'browseSingleShopInit1':
                        case 'browseSingleShopInit2':
                        case 'browseSingleShopInit3':
                        case 'browseSingleShopInit4':
                        case 'browseSingleShopInit5':
                        case 'browseSingleShopInit6':
                        case 'browseSingleShopInit7':
                        case 'browseSingleShopInit8':
                        case 'browseSingleShopInit9':
                        case 'browseSingleShopInit10':
                            console.log(p.user, `正在做: ${data.title}`)
                            let zb1 = await this.curl({
                                    'url': `https://api.m.jd.com/client.action`,
                                    'form': `functionId=getSingleShopReward&body={"index": ${data.index}, "version":1, "type":1}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                                    cookie
                                }
                            )
                            let zb2 = await this.curl({
                                    'url': `https://api.m.jd.com/client.action`,
                                    'form': `functionId=getSingleShopReward&body={"index": ${data.index}, "version":1, "type":2}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                                    cookie
                                }
                            )
                            console.log(p.user, `获得狗粮: ${this.haskey(zb2, 'result.reward')}`)
                            break
                    }
                }
                else {
                    console.log(p.user, `${data.title || ''}任务已完成`)
                }
            }
            // 收取小爱心
            home = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=initPetTown&body={"version":1}&appid=wh5&client=apple&clientVersion=10.3.0&build=167903&rfs=0000`,
                    cookie
                }
            )
            for (let i of this.haskey(home, 'result.petPlaceInfoList')) {
                if (i.energy) {
                    await this.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `functionId=energyCollect&body={"place":${i.place}}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`,
                            cookie
                        }
                    )
                    console.log(p.user, `收取好感度: ${i.energy}`)
                }
            }
        }
        else {
            this.jump = this.shareCode.length ? 0 : 1
            for (let i of this.shareCode) {
                if (i.count>4) {
                    continue
                }
                if (!p.helpStatus) {
                    console.log(p.user, `正在助力: ${i.shareCode}`)
                    let response = await this.curl({
                            'url': `https://api.m.jd.com/client.action?functionId=slaveHelp`,
                            form: `body={"shareCode":"${i.shareCode}","version":2,"channel":"app"}&appid=wh5&loginWQBiz=pet-town&clientVersion=9.0.4`,
                            cookie,
                        }
                    )
                    try {
                        if (response.code === '0' && response.resultCode === '0') {
                            if (response.result.helpStatus === 0) {
                                console.log(p.user, '助力成功')
                                i.count++
                            }
                            else {
                                p.helpStatus = 1
                                console.log(p.user, '没有助力次数')
                            }
                        }
                        else {
                            console.log(p.user, response.message)
                        }
                    } catch (e) {
                    }
                }
                let helpWaitting = parseInt(this.profile.helpWaitting || 6000)
                await this.wait(helpWaitting)
            }
        }
    }
}

module.exports = Main;
