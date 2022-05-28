const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东电器巨超值"
        // this.cron = "0 20 * * *"
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
        this.turn = 3
        // this.model = 'user'
        this.thread = 3
        // this.verify = 1
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            appId: "f093b",
            type: 'lite',
            fp: "7063407705917609",
        })
        this.types = []
        let thread = this.thread || 1
        for (let i = 0; i<this.cookies.help.length; i += thread) {
            await Promise.all(this.cookies.help.slice(i, i + thread).map(d => this.votes(d)))
        }
        if (this.code.length>0) {
            let code = []
            for (let cookie of this.cookies.help) {
                let user = this.userName(cookie)
                for (let j of this.code) {
                    if (j.user == user) {
                        code.push(j)
                    }
                }
            }
            if (code.length>0) {
                this.code = code
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        if (this.turnCount == 0) {
            console.log(`正在助力`)
            for (let i of this.code) {
                if (!i.finish) {
                    let s = await this.tasking({
                        body: {
                            "shareId": i.shareId,
                            "type": i.type,
                            "apiMapping": "/api/supportTask/doSupport"
                        }, cookie
                    })
                    console.log(`助力`, i.user, this.haskey(s, 'msg'))
                    if (this.haskey(s, 'data.status', 4)) {
                        i.finish = 1
                    }
                }
                else {
                    console.log(`助力完成:`, i.shareId)
                }
            }
        }
        else if (this.turnCount == 1) {
            console.log(`正在执行任务`)
            await this.vote(p)
        }
        else {
            console.log(`正在抽奖`)
            for (let i of this.unique(this.types)) {
                let lottery = await this.tasking({
                    body: {"type": i, "apiMapping": "/api/lottery/lottery"},
                    cookie
                })
                console.log(lottery)
                if (this.haskey(lottery, 'data') && !isNaN(lottery.data)) {
                    this.notices(`抽奖获得京豆:${s.data}`, p.user)
                    console.log(`抽奖获得京豆:`, s.data)
                }
            }
        }
        // if (this.turnCount == 0) {
        //     await this.vote(p)
        // }
        // else if (this.turnCount == 1) {
        //     console.log(`正在助力`)
        //     for (let i of this.code) {
        //         if (!i.finish) {
        //             let s = await this.tasking({
        //                 body: {
        //                     "shareId": i.shareId,
        //                     "type": i.type,
        //                     "apiMapping": "/api/supportTask/doSupport"
        //                 }, cookie
        //             })
        //             console.log(`助力`, i.user, this.haskey(s, 'msg'))
        //             if (this.haskey(s, 'data.status', 4)) {
        //                 i.finish = 1
        //             }
        //         }
        //         else {
        //             console.log(`助力完成:`, i.shareId)
        //         }
        //     }
        // }
        // else {
        //     console.log(`正在抽奖`)
        //     for (let i of this.unique(this.types)) {
        //         let lottery = await this.tasking({
        //             body: {"type": i, "apiMapping": "/api/lottery/lottery"},
        //             cookie
        //         })
        //         console.log(lottery)
        //         if (this.haskey(lottery, 'data') && !isNaN(lottery.data)) {
        //             this.notices(`抽奖获得京豆:${s.data}`, p.user)
        //             console.log(`抽奖获得京豆:`, s.data)
        //         }
        //     }
        // }
    }

    async votes(cookie) {
        // 主号先做任务,并生成助力码
        let p = {
            cookie,
            user: this.userName(cookie)
        }
        await this.vote(p)
        for (let i of this.unique(this.types)) {
            let share = await this.tasking({
                body: {"type": i, "apiMapping": "/api/supportTask/getShareId"}, cookie
            })
            if (this.haskey(share, 'data') && this.haskey(share, 'code', 200)) {
                this.code.push({shareId: share.data, type: i, user: p.user})
            }
        }
    }

    async vote(p) {
        let cookie = p.cookie
        let indexInfo = await this.tasking({
                body: {"apiMapping": "/api/index/indexInfo"},
                cookie
            }
        )
        let gifts = 0
        let help = this.cookies.help.includes(cookie) ? 1 : 0
        for (let i of this.haskey(indexInfo, 'data.track')) {
            this.types.push(i.type)
            if (i.jbeanSuccess) {
                console.log("已经完成", i.type)
            }
            else {
                let n = 1
                for (let j of (this.haskey(i, 'skuList') || this.haskey(i, 'topList'))) {
                    let s = await this.tasking({
                        body: {
                            "type": i.type,
                            "like": 1,
                            "skuId": j.skuId,
                            "index": n,
                            "apiMapping": "/api/index/vote"
                        }, cookie
                    })
                    console.log(s)
                    n++
                    let msg = this.haskey(s, 'msg')
                    if (msg == '未登录') {
                        console.log("未登录")
                        return
                    }
                    else if (msg == '您已完成本赛道投票') {
                        break
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
            // if (help) {
            //     let share = await this.tasking({
            //         body: {"type": i.type, "apiMapping": "/api/supportTask/getShareId"}, cookie
            //     })
            //     if (this.haskey(share, 'data') && this.haskey(share, 'code', 200)) {
            //         this.code.push({shareId: share.data, type: i.type, user: p.user})
            //     }
            // }
        }
        if (gifts) {
            this.print(`共获得:${gifts}`, p.user)
        }
    }

    async tasking(params) {
        let s = await this.algo.curl({
                'url': `https://api.m.jd.com/api`,
                'form': `appid=reinforceints&functionId=strategy_vote_prod&body=${this.dumps(params.body)}&t=${this.timestamp}`,
                cookie: params.cookie,
            }
        )
        return s
    }
}

module.exports = Main;
