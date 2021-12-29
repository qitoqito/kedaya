const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京喜牛牛福利"
        this.cron = "10 0,14 * * *"
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
        this.verify = 1
        this.model = 'user'
        this.thread = 6
        this.overtime = 11
        this.turn = 2
        this.readme = `由于子任务需要10s等待,会占用大量运行时间,这边不做等待处理\n第一次运行子任务没有完成属于正常情况,第二次定时任务执行后会直接领取金币`
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: 'pingou', appId: 10012
        })
        for (let i of this.cookies['help']) {
            let s = await this.algo.curl({
                    'url': `https://m.jingxi.com/pgcenter/sign/UserSignNew?sceneval=2&source=&_stk=sceneval%2Csource&_ste=1`,
                    // 'form':``,
                    cookie: i
                }
            )
            if (this.haskey(s, 'data.token')) {
                this.shareCode.push(this.compact(s.data, ['token']))
            }
        }
    }

    async assist(p) {
        let cookie = p.cookie;
        let s = await this.algo.curl({
                'url': `https://m.jingxi.com/pgcenter/sign/helpSign?sceneval=2&token=${(p.inviter.token)}&flag=1&_stk=flag%2Csceneval%2Ctoken&_ste=1`,
                cookie
            }
        )
        console.log(s.data)
    }

    async main(p) {
        let cookie = p.cookie;
        let d = await this.algo.curl({
                'url': `https://m.jingxi.com/jxnnzdq/Draw?__t=1639629089019&dwEnv=7&activeType=hb&pageType=1&_stk=__t%2CactiveType%2CdwEnv%2CpageType&_ste=1`,
                // 'form':``,
                cookie
            }
        )
        // console.log(d)
        let s = await this.algo.curl({
                'url': `https://m.jingxi.com/pgcenter/task/QueryPgTaskCfg?sceneval=2&_stk=sceneval&_ste=1`,
                // 'form':``,
                cookie
            }
        )
        for (let i of this.haskey(s,'data.tasks')||[]) {
            let a = await this.algo.curl({
                    'url': `https://m.jingxi.com/pgcenter/task/drawUserTask?sceneval=2&taskid=${i.taskId}&_stk=sceneval%2Ctaskid&_ste=1`,
                    // 'form':``,
                    cookie
                }
            )
            if (a.errMsg == 'rcs xxx') {
                console.log('账户脸黑')
                return
            }
            i.taskUrl ? await this.curl({'url': i.taskUrl, cookie}) : ''
            let b = await this.algo.curl({
                    'url': `https://m.jingxi.com/pgcenter/task/UserTaskFinish?sceneval=2&taskid=${i.taskId}&_stk=sceneval%2Ctaskid&_ste=1`,
                    // 'form':``,
                    cookie
                }
            )
            console.log(b.errMsg)
        }
        for (let i of Array(3)) {
            let c = await this.curl({
                    'url': `https://m.jingxi.com/pgcenter/active/LuckyTwistDraw?sceneval=2&active=rwjs_fk1113&activedesc=%E5%B9%B8%E8%BF%90%E6%89%AD%E8%9B%8B%E6%9C%BA%E6%8A%BD%E5%A5%96&_stk=active%2Cactivedesc%2Csceneval&_ste=1`,
                    // 'form':``,
                    cookie
                }
            )
            if (!c.data) {
                break
            }
            console.log(c.data)
        }
    }
}

module.exports = Main;
