const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东超市红包雨"
        this.cron = "2 0,20-23 * * *"
        this.help = 'main'
        this.task = 'local'
        this.verify = 1
    }

    async prepare() {
        let projectId = this.profile.custom || '40884421925727823'
        for (let cookie of this.cookies.help) {
            let s = await this.curl({
                    'url': `https://api.m.jd.com/api?appid=hongbaoyu&functionId=redRainInitProjectScene&body={"projectId":"${projectId}"}`,
                    cookie
                }
            )
            if (this.haskey(s, 'data.activityList.0.activityId')) {
                let activityId = s.data.activityList [0].activityId
                this.shareCode.push({
                    projectId, activityId
                })
                break
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        for (let i = 0; i<3; i++) {
            let s = await this.curl({
                    'url': `https://api.m.jd.com/api?appid=hongbaoyu&functionId=redRainStartLottery&body={"projectId":"${p.inviter.projectId}","activityId":"${p.inviter.activityId}"}`,
                    // 'form':``,
                    cookie
                }
            )
            if (this.haskey(s, 'data.name')) {
                this.print(`获得: ${s.data.name}`, p.user)
            }
            if (this.haskey(s, 'code', 210)) {
                console.log(s.msg)
                return
            }
            else {
                await this.wait(5000)
            }
        }
    }
}

module.exports = Main;
