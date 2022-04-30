const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东微信签到红包"
        this.cron = "32 0,21 * * *"
        // this.thread = 6
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': '9a38a',
            'type': 'wechat',
            'fp': '5727941528525264'
        })
    }

    async main(p) {
        let cookie = p.cookie; 
        let s = await this.algo.curl({
                'url': `https://api.m.jd.com/signTask/doSignTask?client=apple&clientVersion=7.16.280&functionId=SignComponent_doSignTask&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body={"activityId":"10002"}`,
                cookie,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
                    referer: 'https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html'
                }
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
