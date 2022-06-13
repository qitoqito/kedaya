const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东小魔方红包雨"
        // this.cron = "12 0,13,20 * * *"
        this.task = 'local'
    }

    async prepare() {
        // let s = await this.curl({
        //         'url': `https://api.m.jd.com/client.action?appid=redrain-2021&functionId=queryRedRainTemplateNew&client=wh5&clientVersion=1.0.0&body={"actId":"RRA43Pnoes3rXahnyEJcJdo3wYieA4w"}&_=1636374256686&callback=jsonp1`,
        //         // 'form':``,
        //     }, '', 'data=data.replace("/**/","")'
        // )
        // this.shareCode.push(this.compact(s.activityInfo, ['encryptProjectId', 'encryptAssignmentId']))
    }

    async main(p) {
        let cookie = p.cookie
        let s = await this.curl({
                'url': `https://api.m.jd.com/api?appid=redrain-2021&functionId=doInteractiveAssignment&client=wh5&clientVersion=1.0.0&body={"completionFlag":true,"sourceCode":"acehby20210924","encryptProjectId":"3sXXaRM6gCUyJc4LwYU7EZpYhrcq","encryptAssignmentId":"8ppJjFktuVPrJKPVYZin9z6fgtv"}&_=1635683042434&callback=jsonp2`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(s, 'rewardsInfo.successRewards')) {
            let gifts = this.match(/"rewardName":"([^\"]+)"/g, this.dumps(s.rewardsInfo))
            this.print(gifts, p.user)
        }
        else {
            console.log("什么也没有")
        }
    }
}

module.exports = Main;
