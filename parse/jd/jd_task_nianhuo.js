const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东年货节签到"
        // this.cron = "23 0,14 * * *"
        this.task = 'local'
        this.verify = 1
    }

    async prepare() {
        let encryptProjectId = this.custom || "2B3ye2T8QNPAuHQZ3SCSmbTczufV"
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=queryInteractiveInfo&appid=publicUseApi&body={"encryptProjectId":"${encryptProjectId}","sourceCode":"aceaceglqd20211215"}&t=1643730771641&client=wh5&clientVersion=1.0.0&sid=052da9f07f0220fb95a8f5fc61bf61fw&networkType=&ext={"prstate":"0"}`,
            }
        )
        try {
            let encryptAssignmentId
            for (let i of s.assignmentList) {
                let StartTime = new Date(i.assignmentStartTime).getTime()
                encryptAssignmentId = i.encryptAssignmentId
                if (StartTime>this.timestamp) {
                    break
                }
            }
            if (encryptProjectId) {
                this.shareCode.push({encryptProjectId, encryptAssignmentId})
            }
        } catch (e) {
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=doInteractiveAssignment&appid=publicUseApi&body={"encryptProjectId":"${p.inviter.encryptProjectId}","encryptAssignmentId":"${p.inviter.encryptAssignmentId}","sourceCode":"aceaceglqd20211215","completionFlag":true}&t=1641173777223&client=wh5&clientVersion=1.0.0&sid=&uuid=&networkType=&ext={"prstate":"0"}`,
                cookie
            }
        )
        let list = this.matchAll(/"prizeName"\s*:\s*"([^"]+)"/g, this.dumps(s))
        if (list.length) {
            console.log(p.user, list)
            this.notices(`获得奖励: ${list.join("\n")}`, p.user)
        }
        else {
            console.log("可能已经领取过了")
        }
        let r = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=doInteractiveAssignment&appid=publicUseApi&body={"encryptProjectId":"${p.inviter.encryptProjectId}","encryptAssignmentId":"${p.inviter.encryptAssignmentId}","sourceCode":"aceaceglqd20211215","completionFlag":true,"ext":{"exchangeNum":1}}&t=1641696003976&client=wh5&clientVersion=1.0.0&uuid=&networkType=&ext={"prstate":"0"}`,
                cookie
            }
        )
        // console.log(this.haskey(r, 'rewardsInfo.successRewards') || r)
        let reward = this.matchAll(/"rewardName"\s*:\s*"([^\"]+)"/g, this.dumps(r))
        if (reward.length) {
            this.notices(`获得满签奖励: ${reward.join("\n")}`, p.user)
        }
    }
}

module.exports = Main;
