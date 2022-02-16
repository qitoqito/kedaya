const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京喜摇一摇"
        // this.cron = "0,30 0,1,19-23 * * *"
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: 'pingou', appId: '10033',
            verify: 1
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let u = await this.algo.curl({
                'url': `https://jxa.jd.com/wq.jd.com/jxnhj/GetUserInfo?g_ty=mp&g_tk=1299575574&__t=1642604505198&dwEnv=6&strInviteId=&nopopup=0&_stk=__t%2CdwEnv%2Cnopopup%2CstrInviteId&_ste=2`,
                // 'form':``,
                cookie: cookie
            }
        )
        let gifts = []
        if (this.haskey(u, 'myInfo.shakeKey')) {
            for (let i of Array(30)) {
                let s = await this.algo.curl({
                        'url': `https://jxa.jd.com/wq.jd.com/jxnhj/Draw?__t=1643628641525&dwEnv=7&strSceneType=${u.myInfo.shakeKey}&scene=11&bizch=shake&_stk=__t%2Cbizch%2CdwEnv%2Cscene%2CstrSceneType&_ste=1`,
                        // 'form':``,
                        cookie
                    }
                )
                console.log(this.haskey(s, 'data'))
                if (this.haskey(s, 'data.0.prizeDesc', '通用红包')) {
                    gifts.push(s.data[0].discount)
                }
            }
        }
        if (gifts.length) {
            this.notices(`获得红包: ${this.sum(gifts)}`, p.user)
        }
    }
}

module.exports = Main;
