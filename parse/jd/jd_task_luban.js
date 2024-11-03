const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东逛新品赢红包"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.hint = {
            'linkId': '活动id'
        }
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.linkId = this.profile.linkId || '2m5K4HvCV4jNeTDixt56KGjroeLT'
        let url = `https://prodev.m.jd.com/mall/active/${this.linkId}/index.html`
        let html = await this.curl({
                url,
            }
        )
        let js = this.unique(this.matchAll(/(storage11.360buyimg.com\/ifloors\/\w+\/static\/js\/main.\w+.js)/g, html) || [])
        this.workflowId = "5b7b7ba0683542e3838798b04e2d8e92"
        if (js) {
            for (let j of js) {
                let k = await this.curl({
                        url: `https://${j}`
                    }
                )
                let wkId = this.match(/workflowId\s*:\s*"(\w+)"/, k)
                if (wkId) {
                    this.workflowId = wkId;
                    break
                }
            }
        }
        this.algo = new this.modules.jdAlgo({
            version: "latest",
            type: 'main'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let floor = await this.algo.curl({
                'url': `https://api.m.jd.com/?functionId=qryH5BabelFloors`,
                'form': `functionId=qryH5BabelFloors&appid=newtry&body={"activityId":"${this.linkId}","pageId":"4810055","queryFloorsParam":{"floorParams":{},"type":2}}`,
                cookie,
                algo: {
                    appId: '35fa0'
                }
            }
        )
        let gifts = []
        let list = this.haskey(floor, 'floorList.0.providerData.data.assignments.assignmentList')
        if (!list) {
            console.log("没有获取到活动列表")
            return
        }
        let uuid = this.workflowId
        for (let i of list) {
            if (i.completionCnt != i.assignmentTimesLimit) {
                console.log("正在运行:", i.assignmentName)
                if (i.ext) {
                    let vos = i.ext.sign2 || i.ext.followShop || i.ext.brandMemberList || i.ext.shoppingActivity || i.ext.productsInfo
                    if (!vos) {
                        vos = [{
                            itemId: '1'
                        }]
                    }
                    for (let j of vos.splice(0, i.assignmentTimesLimit - i.completionCnt)) {
                        // console.log(j)
                        let doWork = await this.algo.curl({
                                'url': `https://api.m.jd.com/?functionId=luban_executeWorkflow`,
                                'form': `functionId=luban_executeWorkflow&appid=newtry&client=ios&clientVersion=13.2.8&body={"workflowId":"${uuid}","action":1,"encAid":"${i.encryptAssignmentId}","itemId":"${j.itemId}","jumpUrl":"${encodeURIComponent(j.url)}"}`,
                                cookie,
                                algo: {
                                    appId: '35fa0'
                                }
                            }
                        )
                        if (this.haskey(doWork, 'subCode', '1403')) {
                            console.log('风险等级未通过')
                            return
                        }
                        else if (this.haskey(doWork, 'subCode', -23)) {
                            console.log('账号过期')
                            return
                        }
                        if (i.ext.waitDuration) {
                            console.log(`等待${i.ext.waitDuration}秒`)
                            await this.wait(i.ext.waitDuration * 1000)
                        }
                        let r = await this.algo.curl({
                                'url': `https://api.m.jd.com/?functionId=luban_executeWorkflow`,
                                'form': `functionId=luban_executeWorkflow&appid=newtry&client=ios&clientVersion=13.2.8&body={"workflowId":"${uuid}","action":0,"encAid":"${i.encryptAssignmentId}","itemId":"${j.itemId}","completionFlag":true}`,
                                cookie,
                                algo: {
                                    appId: '35fa0'
                                }
                            }
                        )
                        if (this.haskey(r, 'rewardsInfo.successRewards')) {
                            for (let g in r.rewardsInfo.successRewards) {
                                let data = r.rewardsInfo.successRewards[g]
                                for (let k of data) {
                                    console.log(`获得: ${k.rewardName}:${k.discount}`)
                                    gifts.push(`${k.rewardName}:${k.discount}`)
                                }
                            }
                        }
                        else {
                            console.log(`什么也没有抽到`)
                        }
                    }
                }
            }
            else {
                console.log("任务已经完成:", i.assignmentName)
            }
        }
        for (let i of Array(3)) {
            let lottery = await this.algo.curl({
                    'url': `https://api.m.jd.com/?functionId=luban_executeWorkflow`,
                    'form': `functionId=luban_executeWorkflow&appid=newtry&client=ios&clientVersion=13.2.8&body={"workflowId":"${uuid}","action":2,"completionFlag":true}`,
                    cookie,
                    algo: {
                        appId: '35fa0'
                    }
                }
            )
            console.log("抽奖机:", lottery)
            await this.wait(1000)
            if (this.haskey(lottery, 'subCode', '-777')) {
                break
            }
        }
        if (gifts.length) {
            console.log(`获得奖励列表:`)
            this.print(gifts.join("\n"), p.user)
        }
    }
}

module.exports = Main;
