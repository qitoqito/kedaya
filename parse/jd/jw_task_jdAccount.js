const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东粉丝专属福利"
        this.cron = "31 0,14 * * *"
        this.header = {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001f37) NetType/WIFI Language/zh_CN',
            referer: 'https://wqsh.jd.com/'
        }
    }

    async main(p) {
        let cookie = p.cookie
        let dict = this.haskey(this.userDict, `${this.userPin(cookie)}`) || {}
        if (dict.wq_skey || dict.wqskey) {
            let wqskey = dict.wqskey || `wq_skey=${dict.wq_skey}; wq_uin=${dict.wq_uin};`
            let url = `https://wq.jd.com/jdAccountSignIn/Query?_=1676697194568&g_login_type=0&callback=jsonpCBKA&g_tk=1584725201&g_ty=ls&appCode=msd95910c4`
            let s = await this.curl({url, cookie: wqskey})
            console.log("当前积分:", this.haskey(s, 'currPoint'))
            console.log("正在获取任务...")
            for (let i in s.task_info || []) {
                for (let j of s.task_info[i]) {
                    let u = `https://wq.jd.com/jdAccountSignIn/CompleteTask?taskId=${j.taskId}&taskType=2&_=1634394209473&g_login_type=0&callback=jsonpCBKD&g_tk=919227075&g_ty=ls`
                    let h = await this.curl({
                        url: u,
                        cookie: wqskey
                    })
                    console.log('正在运行:', j.taskName, h);
                }
            }
            console.log("正在领取奖励...")
            let ss = await this.curl({url, cookie: wqskey})
            for (let i in ss.complete_task_info || []) {
                for (let j of ss.complete_task_info[i]) {
                    let u = `https://wq.jd.com/jdAccountSignIn/GetTaskPoint?taskId=${j.taskId}&taskType=4&_=1634394209473&g_login_type=0&callback=jsonpCBKD&g_tk=919227075&g_ty=ls`
                    let h = await this.curl({
                        url: u,
                        cookie: wqskey
                    })
                    await this.curl({
                            'url': `https://wq.jd.com/jdAccountSignIn/GetTaskPoint?taskId=${j.taskId}&taskType=2&_=1634394209473&g_login_type=0&callback=jsonpCBKD&g_tk=919227075&g_ty=ls`,
                            cookie: wqskey
                        }
                    )
                    console.log('正在领取:', j.taskName, h);
                }
            }
        }
        else {
            console.log("没有wqskey,跳过运行")
        }
    }
}

module.exports = Main;
