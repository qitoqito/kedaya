const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东超市红包雨"
        // this.cron = "2 0,20 * * *"
        this.help = 'main'
        this.task = 'local'
        this.verify = 1
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': '16073',
            'type': 'web',
            "version": "3.0",
        })
        let projectId = this.profile.custom || '77983495650348761'
        for (let cookie of this.cookies.help) {
            let s = await this.algo.curl({
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
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/api?appid=hongbaoyu&functionId=redRainStartLottery&body={"projectId":"${p.inviter.projectId}","activityId":"${p.inviter.activityId}"}`,
                    // 'form':``,
                    cookie
                }
            )
            console.log(s)
            if (this.haskey(s, 'data.name')) {
                this.print(`获得: ${s.data.name}`, p.user)
            }
            if (this.haskey(s, 'code', 210)) {
                console.log(s.msg)
                return
            }
            else if (this.haskey(s, 'code', 201)) {
                console.log(s.msg)
                return
            }
            else {
                await this.wait(this.rand(5000, 10000))
            }
        }
    }
}

module.exports = Main;
