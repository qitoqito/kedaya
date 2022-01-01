const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东领新年礼物"
        this.cron = "6 0,13 * * *"
        this.task = 'local'
        this.thread = 6
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?client=wh5&clientVersion=1.0.0&osVersion=15.1.1&networkType=wifi&&appid=content_ecology&functionId=doInteractiveAssignment&t=1640952130681&body={"geo":{"lng":"","lat":""},"mcChannel":0,"encryptProjectId":"2WEk1DXkbrknieahiCPVMsrrVKq3","encryptAssignmentId":"35dfnpBFXKYUgYPoESEDTa2Fkpha","sourceCode":"aceacesy20211202","itemId":"","actionType":"","completionFlag":true}`,
                cookie
            }
        )
        let list = this.matchAll(/"rewardName"\s*:\s*"([^"]+)"/g, this.dumps(s))
        console.log(p.user, list)
        if (list.length) {
            this.notices(`获得奖励: ${list.join(" ")}`, p.user)
        }
    }
}

module.exports = Main;
