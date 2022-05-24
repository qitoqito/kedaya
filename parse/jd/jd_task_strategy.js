const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东电器巨超值"
        this.cron = "1 20 * * *"
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
        this.turn = 2
        this.model = 'user'
        this.thread = 3
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            appId: "f093b",
            type: 'app',
            fp: "7063407705917609",
        })
        let indexInfo = await this.tasking({
                body: {"apiMapping": "/api/index/indexInfo"},
            }
        )
        let track = this.column((this.haskey(indexInfo, 'data.track') || []), 'type')
        for (let cookie of this.cookies.help) {
            let user = this.userName(cookie)
            for (let i of track) {
                let share = await this.tasking({
                    body: {"type": i, "apiMapping": "/api/supportTask/getShareId"}, cookie
                })
                if (this.haskey(share, 'data')) {
                    this.shareCode.push({shareId: share.data, type: i, user})
                }
            }
        }
    }

    async assist(p) {
        let cookie = p.cookie
        let s = await this.tasking({
            body: {
                "shareId": p.inviter.shareId,
                "type": p.inviter.type,
                "apiMapping": "/api/supportTask/doSupport"
            }, cookie
        })
        console.log(p.inviter.user, this.haskey(s, 'data.status'))
        if (this.haskey(s, 'data.status', 4)) {
            this.finish.push(p.number)
        }
        if (this.haskey(s, 'msg', '未登录')) {
            console.log("未登录")
            this.complete.push(p.index)
            return
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let indexInfo = await this.tasking({
                body: {"apiMapping": "/api/index/indexInfo"},
                cookie
            }
        )
        let gifts = 0
        for (let i of this.haskey(indexInfo, 'data.track')) {
            if (i.jbeanSuccess) {
                console.log("已经完成", i.type)
            }
            else {
                for (let j of this.haskey(i, 'skuList')) {
                    let s = await this.tasking({
                        body: {
                            "type": i.type,
                            "like": 1,
                            "skuId": j.skuId,
                            "index": 1,
                            "apiMapping": "/api/index/vote"
                        }, cookie
                    })
                    if (this.haskey(s, 'msg', '未登录')) {
                        console.log("未登录")
                        return
                    }
                    if (this.haskey(s, 'data') && !isNaN(s.data)) {
                        gifts += s.data
                        console.log(`获得京豆:`, s.data)
                    }
                }
            }
            let lottery = await this.tasking({
                body: {"type": i.type, "apiMapping": "/api/lottery/lottery"},
                cookie
            })
            if (this.haskey(lottery, 'data') && !isNaN(lottery.data)) {
                gifts += lottery.data
                console.log(`抽奖获得京豆:`, s.data)
            }
        }
        if (gifts) {
            this.print(`共获得:${gifts}`, p.user)
        }
    }

    async tasking(params) {
        let s = await this.algo.curl({
                'url': `https://api.m.jd.com/api`,
                'form': `appid=reinforceints&functionId=strategy_vote_prod&body=${this.dumps(params.body)}&t=${this.timestamp}`,
                cookie: params.cookie
            }
        )
        return s
    }
}

module.exports = Main;
