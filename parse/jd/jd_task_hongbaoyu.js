const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东超市红包雨"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.verify = 1
        this.import = ['jdAlgo', 'jdUrl']
        this.hint = {'projectId': '红包雨ID'}
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': '16073',
            'type': 'web',
            "version": "3.0",
        })
        let projectId = this.profile.projectId || '119456175536671809'
        for (let cookie of this.cookies.help) {
            let s = await this.algo.curl({
                    'url': `https://api.m.jd.com/api?appid=hongbaoyu&functionId=redRainInitProjectScene&body={"projectId":"${projectId}"}`,
                    cookie,
                    algo: {
                        'appId': 'c18e1',
                        'type': 'web',
                        "version": "3.0",
                    }
                }
            )
            if (this.haskey(s, 'data.activityList.0.activityId')) {
                for (let i of s.data.activityList) {
                    let time = this.timestamp / 1000
                    if (i.startTime<time && i.endTime>time) {
                        this.shareCode.push({
                            projectId,
                            activityId: i.activityId,
                            num: i.userLimit + i.shareLimit
                        })
                    }
                }
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let sc = await this.algo.curl({
                'url': `https://api.m.jd.com/api?appid=hongbaoyu&functionId=redRainInitProjectScene&body={"projectId":"${p.inviter.projectId}"}`,
                cookie,
                algo: {
                    'appId': '16073',
                    'type': 'web',
                    "version": "3.0",
                }
            }
        )
        if (this.haskey(sc, 'code', 209)) {
            console.log(`账号没有活动机会`)
        }
        else {
            for (let i = 0; i<p.inviter.num; i++) {
                let s = await this.algo.curl({
                        'url': `https://api.m.jd.com/api?appid=hongbaoyu&functionId=redRainStartLottery&body={"projectId":"${p.inviter.projectId}","activityId":"${p.inviter.activityId}"}`,
                        // 'form':``,
                        cookie,
                        algo: {
                            'appId': '16073',
                            'type': 'web',
                            "version": "3.0",
                        }
                    }
                )
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
                    await this.wait(this.rand(3000, 6000))
                }
            }
        }
    }
}

module.exports = Main;
