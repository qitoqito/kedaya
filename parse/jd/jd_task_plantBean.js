const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东种豆得豆"
        this.cron = "12 0,13 * * *"
        this.aid = 'local'
        this.task = 'own'
        this.turn = 2
    }

    async prepare() {
    }

    async assist(p) {
        let cookie = p.cookie;
        let index = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=plantBeanIndex`,
                'form': `body={"monitor_source":"plant_app_plant_index","monitor_refer":"","version":"9.2.4.1"}&client=apple&clientVersion=10.0.4&&appid=ld`,
                cookie
            }
        )
        if (this.haskey(index, 'code', '3')) {
            console.log(`没有获取到数据`)
            return
        }
        var plantUuid
        if (this.haskey(index, 'data.jwordShareInfo')) {
            let share = this.query(index.data.jwordShareInfo.shareUrl, '&', 1)
            plantUuid = share.plantUuid
        }
        let roundId
        for (let r of this.haskey(index, 'data.roundList')) {
            if (!roundId && r.dateDesc.includes('本期')) {
                roundId = r.roundId
            }
            if (r.awardState == 5) {
                let reward = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=receivedBean`,
                        'form': `body={"monitor_refer":"receivedBean","monitor_source":"plant_app_plant_index","roundId":"${r.roundId}","version":"9.2.4.0"}&client=apple&clientVersion=10.0.4&&appid=ld`,
                        cookie
                    }
                )
                if (this.haskey(reward, 'data.awardBean')) {
                    console.log(`获取上期奖励: ${reward.data.awardBean}`)
                    this.notices(`获取上期奖励: ${reward.data.awardBean}`, p.user)
                }
            }
            else if (r.roundState == 2) {
                for (let j of r.bubbleInfos) {
                    console.log(`获取${j.name}: ${j.nutrNum}`)
                    let culture = await this.curl({
                            'url': `https://api.m.jd.com/client.action?functionId=cultureBean`,
                            'form': `body={"monitor_refer":"plant_index","monitor_source":"plant_app_plant_index","roundId":"${r.roundId}","nutrientsType":"${j.nutrientsType}","version":"9.2.4.0"}&client=apple&clientVersion=10.0.4&&appid=ld`,
                            cookie
                        }
                    )
                }
            }
        }
        for (let i of this.haskey(index, 'data.taskList')) {
            if (i.isFinished) {
                console.log(i.taskName, "任务已经完成")
            }
            else {
                console.log(`开始做 ${i.taskName}任务`, i.taskType);
                let totalNum = parseInt(i.totalNum)
                let gainedNum = parseInt(i.gainedNum)
                switch (i.taskType) {
                    case 2:
                        if (plantUuid) {
                            this.code.push(plantUuid)
                        }
                        break
                    case 92:
                        let receiveNutrientsTask = await this.curl({
                                'url': `https://api.m.jd.com/client.action?functionId=receiveNutrientsTask`,
                                'form': `body={"monitor_refer":"plant_receiveNutrientsTask","monitor_source":"plant_app_plant_index","awardType":"92","version":"9.2.4.1"}&client=apple&clientVersion=10.0.4&&appid=ld`,
                                cookie
                            }
                        )
                        let ddnc = await this.curl({
                                'url': 'https://api.m.jd.com/client.action?functionId=initForFarm',
                                'form': `body={"version":11,"channel":3}&client=apple&clientVersion=10.0.4&osVersion=13.7&appid=wh5&loginType=2&loginWQBiz=interact`,
                                cookie
                            }
                        )
                        break
                    case 10:
                        let channel = await this.curl({
                                'url': `https://api.m.jd.com/client.action?functionId=plantChannelTaskList&body=%7B%7D&uuid=16508022234351805611686.26.1651079180681&appid=ld`,
                                // 'form':``,
                                cookie
                            }
                        )
                        var list = [...channel.data.goodChannelList, ...channel.data.normalChannelList]
                        for (let n of list) {
                            if (n.taskState == '2') {
                                let plantChannelNutrientsTask = await this.curl({
                                        'url': `https://api.m.jd.com/client.action?functionId=plantChannelNutrientsTask&body={"channelTaskId":"${n.channelTaskId}","channelId":"${n.channelId}"}&uuid=16496899654652091525278.275.1651079578494&appid=ld`,
                                        // 'form':``,
                                        cookie
                                    }
                                )
                                if (this.haskey(plantChannelNutrientsTask, 'data.nutrCount')) {
                                    console.log(this.haskey(plantChannelNutrientsTask, 'data.nutrToast'))
                                    gainedNum++
                                }
                                if (gainedNum == totalNum) {
                                    break
                                }
                            }
                        }
                        break
                    case 3:
                        let shopTaskList =
                            await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=shopTaskList`,
                                    'form': `body={"monitor_refer": "plant_receiveNutrients"}&appid=ld`,
                                    cookie
                                }
                            )
                        var list = [...(this.haskey(shopTaskList, 'data.goodShopList') || []), ...(this.haskey(shopTaskList, 'data.moreShopList') || [])]
                        for (let k of list) {
                            if (k.taskState == '2') {
                                let shopNutrientsTask = await this.curl({
                                        'url': `https://api.m.jd.com/client.action?functionId=shopNutrientsTask`,
                                        'form': `body={"monitor_refer":"plant_shopNutrientsTask","version":"9.2.4.0","shopId":"${k.shopId}","shopTaskId":"${k.shopTaskId}"}&appid=ld`,
                                        cookie
                                    }
                                )
                                if (this.haskey(shopNutrientsTask, 'data.nutrCount')) {
                                    console.log(this.haskey(shopNutrientsTask, 'data.nutrToast'))
                                    gainedNum++
                                }
                                if (gainedNum == totalNum) {
                                    break
                                }
                                await this.wait(2000)
                            }
                        }
                        break
                    case 5:
                        console.log("开始执行:", i.taskName)
                        let productTaskList =
                            await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=productTaskList`,
                                    'form': `body={"monitor_source":"plant_app_plant_index","monitor_refer":"plant_productTaskList","version":"9.2.4.0"}&appid=ld`,
                                    cookie
                                }
                            )
                        // console.log(productTaskList.data)
                        for (let z of this.haskey(productTaskList, 'data.productInfoList')) {
                            // console.log(z[0])
                            let productNutrientsTask = await this.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=productNutrientsTask`,
                                    'form': `body={"monitor_refer":"plant_productNutrientsTask","monitor_source":"plant_app_plant_index","productTaskId":"${z[0].productTaskId}","skuId":"${z[0].skuId}","version":"9.2.4.0"}&appid=ld`,
                                    cookie
                                }
                            )
                            await this.wait(2000)
                            console.log(productNutrientsTask.data.nutrToast || productNutrientsTask.data)
                        }
                        break
                    default:
                        let s = await this.curl({
                                'url': `https://api.m.jd.com/client.action?functionId=receiveNutrientsTask`,
                                'form': `body={"monitor_refer":"plant_receiveNutrientsTask","monitor_source":"plant_app_plant_index","awardType":"${i.taskType}","version":"9.2.4.1"}&appid=ld`,
                                cookie
                            }
                        )
                        await this.wait(2000)
                        let ss = await this.curl({
                                'url': `https://api.m.jd.com/client.action?functionId=receiveNutrientsTask`,
                                'form': `body={"monitor_refer":"plant_receiveNutrientsTask","monitor_source":"plant_app_plant_index","awardType":"${i.taskType}","version":"9.2.4.1"}&appid=ld`,
                                cookie
                            }
                        )
                        console.log(this.haskey(ss, 'data.nutrToast'))
                        break
                }
            }
        }
        let friendList = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=plantFriendList`,
                'form': `body={"version":"9.2.4.1","monitor_refer":"plantFriendList","monitor_source":"plant_app_plant_index","pageNum":"1"}&client=apple&clientVersion=10.0.4&&appid=ld`,
                cookie
            }
        )
        for (let i of this.haskey(friendList, 'data.friendInfoList')) {
            if (i.nutrCount) {
                let collectUserNutr = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=collectUserNutr`,
                        'form': `body={"monitor_refer":"collectUserNutr","monitor_source":"plant_app_plant_index","roundId":"${roundId}","paradiseUuid":"${i.paradiseUuid}","version":"9.2.4.1"}&client=apple&clientVersion=10.0.4&&appid=ld`,
                        cookie
                    }
                )
                let collectResult = this.haskey(collectUserNutr, 'data.collectResult')
                if (collectResult == '3') {
                    console.log('今日帮助收取次数已达上限，明天再来帮忙吧')
                    break
                }
                else if (collectResult == '1') {
                    console.log(collectUserNutr.data.collectMsg.replace("*plantNickName*", i.plantNickName).replace('*friendNutrRewards*', collectUserNutr.data.friendNutrRewards).replace('*collectNutrRewards*', collectUserNutr.data.collectNutrRewards))
                }
                await this.wait(2000)
            }
        }
    }

    async main(p) {
        let cookie = p.cookie
        if (this.code.length == 0) {
            this.jump = 1
        }
        await this.wait(2000)
        for (let uuid of this.code) {
            if (!this.dict[uuid]) {
                let index = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=plantBeanIndex`,
                        'form': `body={"plantUuid":"${uuid}","monitor_source":"plant_m_plant_index","monitor_refer":"","version":"9.2.4.1"}&client=apple&clientVersion=10.0.4&appid=ld`,
                        cookie
                    }
                )
                if (this.haskey(index, 'code', '3')) {
                    return
                }
                let res = this.haskey(index, 'data.helpShareRes') || {}
                if (res.state == '1') {
                    console.log(`助力:`, uuid, res.promptText)
                }
                else if (res.state == '2') {
                    console.log(res.promptText)
                    break
                }
                else if (res.state == '3') {
                    console.log(res.promptText)
                    this.dict[uuid] = 1
                }
                else if (res.state == '4') {
                    console.log(res.promptText)
                }
            }
        }
    }
}

module.exports = Main;
