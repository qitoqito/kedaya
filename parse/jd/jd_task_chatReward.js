const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东社群红包"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 9)},${this.rand(14, 21)} * * *`
        this.import = ['jdAlgo']
        this.task = 'local'
        this.interval = 1200
        this.hint = {
            activityId: "活动id1|id2"
        }
        this.readme = `如果脚本通知有红包,但是红包列表里面没有,可能是之前已经领取过`
        this.verify = 1
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            appId: "323f1",
            type: "main",
            version: "latest"
        })
        let custom = this.profile.custom || this.profile.activityId
        if (custom) {
            for (let i of custom.split("|")) {
                this.shareCode.push({
                    activityId: i
                })
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=chatReward_doReward&appid=wechat_activity&client=h5&body={"activityId":"${p.inviter.activityId}"}`,
                cookie
            }
        )
        let reward = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action?functionId=chatReward_mainPage&appid=wechat_activity&client=h5&body={"activityId":"${p.inviter.activityId}"}`,
                cookie
            }
        ) 
        if (this.haskey(reward, 'data.rewardInfo.rewardValue')) {
            if (reward.data.rewardInfo.rewardType == 1) {
                this.print(`红包: ${reward.data.rewardInfo.rewardValue}元`, p.user)
            }
            else {
                console.log(`优惠券: ${reward.data.rewardInfo.rewardValue}元`)
            }
        }
        else {
            console.log("什么也没有")
        }
    }
}

module.exports = Main;
