const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东品牌闪购签到有礼"
        this.cron = "23 7,23 * * *"
        this.task = 'local' 
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?client=wh5&clientVersion=1.0.0&osVersion=15.1.1&networkType=wifi&functionId=doInteractiveAssignment&t=1640952130681&body={"itemId":"1","completionFlag":true,"encryptAssignmentId":"2mbhaGkggQQGGM3imR2o3BMqAbFH","encryptProjectId":"5wAnzYsAWyq94z4TQ6N2tjVKmeB","sourceCode":"aceshangou0608","lat":"0.000000","lng":"0.000000"}`,
                cookie
            }
        )
        console.log(this.haskey(s, 'msg'))
        for (let i in this.haskey(s, 'rewardsInfo.successRewards')) {
            let data = s.rewardsInfo.successRewards[i]
            for (let j of data) {
                if (j.rewardName) {
                    this.print(`${j.rewardName}: ${j.quantity}`, p.user)
                }
            }
        }
    }
}

module.exports = Main;
