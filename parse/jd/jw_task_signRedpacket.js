const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东微信签到红包"
        this.cron = "32 0,21 * * *"
        this.thread = 6
        this.task = 'local'
        this.header = {
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
            'referer': 'https://servicewechat.com/wx91d27dbf599dff74/581/page-frame.html',
        }
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/signTask/doSignTask?functionId=SignComponent_doSignTask&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body={"activityId":"10002"}&g_ty=ls&g_tk=1294369933`,
                cookie
            }
        )
        if (this.haskey(s, 'data.rewardValue')) {
            console.log(p.user, `签到: ${s.data.signDays}天, 获得红包: ${s.data.rewardValue}元`)
            this.notices(`签到: ${s.data.signDays}天, 获得红包: ${s.data.rewardValue}元`, p.user)
        }
        else {
            console.log(p.user, s.message)
        }
    }
}

module.exports = Main;
