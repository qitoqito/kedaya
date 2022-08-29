const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东券民空间站"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.turn = 3
    }

    async prepare() {
        let s = await this.curl({
                'url': `https://api.m.jd.com/api?functionId=explorePlanet_homePage&appid=coupon-space&client=wh5&t=1661263930851`,
                'form': `body={"channel":"1"}`,
            }
        )
        this.activityId = this.haskey(s, 'data.result.activityId') || this.profile.activityId || 5
    }

    async main(p) {
        let cookie = p.cookie;
        if (this.turnCount == 0) {
            for (let j = 0; j<6; j++) {
                let s = await this.curl({
                        'url': `https://api.m.jd.com/api?functionId=explorePlanet_taskList&appid=coupon-space&client=wh5&t=1658305468890`,
                        'form': `body={"activityId":${this.activityId}}`,
                        cookie
                    }
                )
                if (j == 0) {
                    if (this.haskey(s, 'data.result.assistTaskInfo.groupId')) {
                        if (s.data.result.assistTaskInfo.assistDetails.length<s.data.result.assistTaskInfo.maxAssistedTimes) {
                            this.shareCode.push({
                                user: this.userName(cookie),
                                groupId: s.data.result.assistTaskInfo.groupId
                            })
                        }
                        else {
                            console.log(`助力满了,不用再助力了`)
                        }
                    }
                    else {
                        let h = await this.curl({
                                'url': `https://api.m.jd.com/api?functionId=explorePlanet_openGroup&appid=coupon-space&client=wh5&t=1658309818120`,
                                'form': `body={"activityId":${this.activityId}}`,
                                cookie
                            }
                        )
                        if (this.haskey(h, 'data.result.groupId')) {
                            this.shareCode.push({
                                user: this.userName(cookie),
                                groupId: h.data.result.groupId
                            })
                        }
                    }
                }
                if (this.haskey(s, 'data.result.componentTaskInfo')) {
                    for (let k of this.haskey(s, 'data.result.specialComponentTaskInfo')) {
                        if (k.taskStatus != 3) {
                            console.log(`正在做: ${k.taskDesc}`)
                            let d = await this.curl({
                                    'url': `https://api.m.jd.com/api?functionId=explorePlanet_taskReport&appid=coupon-space&client=wh5&t=1658305485458`,
                                    'form': `body={"activityId":${this.activityId},"encryptTaskId":"${k.encryptTaskId}","itemId":"${k.itemId}","encryptProjectId":"${s.data.result.specialComponentTaskPid}"}`,
                                    cookie
                                }
                            )
                            console.log(`获得探索机会: ${this.haskey(d, 'data.result.completedItemCount')}`)
                        }
                        else {
                            console.log(`已完成: ${k.taskDesc}`)
                        }
                    }
                    let z = 0
                    for (let i of s.data.result.componentTaskInfo) {
                        if (i.taskStatus != 3) {
                            z = 1
                            console.log(`正在做: ${i.taskDesc}`)
                            let d = await this.curl({
                                    'url': `https://api.m.jd.com/api?functionId=explorePlanet_taskReport&appid=coupon-space&client=wh5&t=1658305485458`,
                                    'form': `body={"activityId":${this.activityId},"encryptTaskId":"${i.encryptTaskId}","itemId":"${i.itemId}","encryptProjectId":"${s.data.result.componentTaskPid}"}`,
                                    cookie
                                }
                            )
                            console.log(`获得探索机会: ${this.haskey(d, 'data.result.completedItemCount')}`)
                        }
                        else {
                            console.log(`已完成: ${i.taskDesc}`)
                        }
                    }
                    if (!z) {
                        break
                    }
                }
                else {
                    console.log(`没有获取到数据`)
                    break
                }
            }
        }
        else if (this.turnCount == 1) {
            for (let c of this.shareCode) {
                console.log(`正在助力: ${c.user}`)
                if (c.finish) {
                    console.log(`助力已满,不需要再助力`)
                }
                else {
                    let h = await this.curl({
                            'url': `https://api.m.jd.com/api?functionId=explorePlanet_assist&appid=coupon-space&client=wh5&t=1658310251360`,
                            'form': `body={"activityId":${this.activityId},"groupId":"${c.groupId}","uuid":"${this.uuid(40)}"}`,
                            cookie
                        }
                    )
                    let code = this.haskey(h, 'data.biz_code')
                    if (code == 1006) {
                        console.log(`助力机会已用完,跳过助力`)
                        break
                    }
                    else if (code == 1004) {
                        console.log("不能给自己助力")
                    }
                    else if (code == 1005) {
                        console.log("今日已为TA助力")
                    }
                    else if (code == 1007) {
                        console.log("助力满了,不需要助力了")
                        c.finish = 1
                    }
                    else if (code == 0) {
                        console.log(`助力成功`)
                    }
                }
            }
        }
        else {
            let array = [0, 1, 2, 3, 4]
            while (1) {
                let s = await this.curl({
                        'url': `https://api.m.jd.com/api?functionId=explorePlanet_explore&appid=coupon-space&client=wh5&t=1658311414445`,
                        'form': `body={"activityId":${this.activityId}}`,
                        cookie
                    }
                )
                if (this.haskey(s, 'data.result.cardInfo.cardName')) {
                    console.log(`获得: ${this.haskey(s, 'data.result.cardInfo.cardName')}`)
                    if (s.data.result.cardInfo.cardNumber<5) {
                        delete array[s.data.result.cardInfo.cardNumber]
                        if (array.filter(d => d).length == 0) {
                            console.log(`收集满了,不用再收集了`)
                            break
                        }
                    }
                }
                else {
                    console.log(`可能获得没用的券`)
                }
                let num = this.haskey(s, 'data.result.remainExploreNum') || 0
                if (num<1) {
                    break
                }
            }
            let c = await this.curl({
                    'url': `https://api.m.jd.com/api?functionId=explorePlanet_compositeCard&appid=coupon-space&client=wh5&t=1658311922645`,
                    'form': `body={"activityId":${this.activityId}}`,
                    cookie
                }
            )
            console.log(c.data)
            let reward = await this.curl({
                    'url': `https://api.m.jd.com/api?functionId=explorePlanet_divideReward&appid=coupon-space&client=wh5&t=1659366893866`,
                    'form': `body={"activityId":${this.activityId}}`,
                    cookie
                }
            )
            if (this.haskey(reward, 'data.result.discount')) {
                this.print(`获得红包: ${reward.data.result.discount}`, p.user)
            }
        }
    }
}

module.exports = Main;
