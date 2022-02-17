const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京喜集年货"
        // this.cron = "0 */8 * * *"
        this.help = 'main'
        this.task = 'local'
        // this.aid = 'own'
        this.import = ['jdAlgo']
        // this.thread = 3
        // this.turn = 2
        this.model = 'shuffle'
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set(
            {
                type: 'pingou',
                appId: '10033',
                verify: 1
            }
        )
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.algo.curl({
                'url': `https://m.jingxi.com/jxnhj/GetUserInfo?__t=1642234384494&dwEnv=7&strInviteId=${p.inviter.shareId}&nopopup=0&_stk=__t%2CdwEnv%2Cnopopup%2CstrInviteId&_ste=1`,
                // 'form':``,
                cookie: p.cookie
            }
        )
        if (this.haskey(s, 'myInfo.drawKey')) {
            let q = await this.algo.curl({
                    'url': `https://m.jingxi.com/jxnhj/Draw?__t=1642294158865&dwEnv=7&strSceneType=${s.myInfo.drawKey}&scene=2&_stk=__t%2CdwEnv%2Cscene%2CstrSceneType&_ste=1`,
                    // 'form':``,
                    cookie
                }
            )
        }
        let l = await this.algo.curl({
                'url': `https://m.jingxi.com/jxnhj/GetTaskList?__t=1642232326846&dwEnv=7&_stk=__t%2CdwEnv&_ste=1`,
                // 'form':``,
                cookie
            }
        )
        for (let i of this.haskey(l, 'data.taskList')) {
            if (i.awardStatus != 1) {
                try {
                    console.log(p.user, `正在做: ${i.taskName}`)
                    let s = await this.algo.curl({
                            'url': `https://m.jingxi.com/jxnhj/DoTask?__t=1642232326386&dwEnv=7&taskId=${i.taskId}&strShareId=&bizCode=jxnhj_task&configExtra=&_stk=__t%2CbizCode%2CconfigExtra%2CdwEnv%2CstrShareId%2CtaskId&_ste=1`,
                            // 'form':``,
                            cookie
                        }
                    )
                    // console.log(p.user, s.msg)
                    let taskConfigExtra = i.taskConfigExtra ? this.loads(i.taskConfigExtra) : {}
                    if (taskConfigExtra.second) {
                        await this.curl({
                                'url': taskConfigExtra.jumpUrl,
                                // 'form':``,
                                cookie
                            }
                        )
                        await this.wait(parseInt(taskConfigExtra.second) * 1000)
                    }
                    let a = await this.algo.curl({
                            'url': `https://m.jingxi.com/newtasksys/newtasksys_front/Award?__t=1642232327436&dwEnv=7&taskId=${i.taskId}&bizCode=jxnhj_task&source=jxnhj_task&_stk=__t%2CbizCode%2CdwEnv%2Csource%2CtaskId&_ste=1`,
                            // 'form':``,
                            cookie
                        }
                    )
                    console.log(p.user, this.haskey(a, 'data.prizeInfo'))
                } catch (e) {
                }
            }
            else {
                console.log(p.user, `${i.taskName} 任务已经完成`)
            }
        }
        // let u = await this.algo.curl({
        //         'url': `https://m.jingxi.com/jxnhj/GreetUpgrade?__t=1642233302558&dwEnv=7&_stk=__t%2CdwEnv&_ste=1`,
        //         // 'form':``,
        //         cookie
        //     }
        // )
    }
}

module.exports = Main;
