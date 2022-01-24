const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东年货节签到"
        this.cron = "23 0,14 * * *"
        this.task = 'local'
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=doInteractiveAssignment&appid=publicUseApi&body={"encryptProjectId":"MD6S5z8gGgtP2VLJkLqmWPuDtHe","encryptAssignmentId":"2uHxYWamFumkQfAL2aVVfF7EYT8u","sourceCode":"aceaceglqd20211215","completionFlag":true}&t=1641173777223&client=wh5&clientVersion=1.0.0&sid=&uuid=&networkType=&ext={"prstate":"0"}`,
                cookie
            }
        )
        let list = this.matchAll(/"prizeName"\s*:\s*"([^"]+)"/g, this.dumps(s))
        if (list.length) {
            console.log(p.user, list)
            this.notices(`获得奖励: ${list.join(" ")}`, p.user)
        }
        else {
            console.log("可能已经领取过了")
        }
        let r = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=doInteractiveAssignment&appid=publicUseApi&body={"encryptProjectId":"MD6S5z8gGgtP2VLJkLqmWPuDtHe","encryptAssignmentId":"3Cj9QK8af2jdy6xWm9v5fbhUW2zU","sourceCode":"aceaceglqd20211215","completionFlag":true,"ext":{"exchangeNum":1}}&t=1641696003976&client=wh5&clientVersion=1.0.0&uuid=&networkType=&ext={"prstate":"0"}`,
                cookie
            }
        )
        console.log(this.haskey(r, 'rewardsInfo.successRewards') || r)
        let reward = this.matchAll(/"rewardName"\s*:\s*"([^\"]+)"/g, this.dumps(r))
        if (reward.length) {
            this.notices(`获得满签奖励: ${reward.join("\n")}`, p.user)
        }
    }
}

module.exports = Main;
