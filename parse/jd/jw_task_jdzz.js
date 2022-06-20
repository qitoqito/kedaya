const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东赚赚"
        this.cron = "51 10,22 * * *"
        // this.help = 2
        this.task = 'local'
        // this.thread = 6
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=interactTaskIndex&body={"mpVersion":"3.4.0"}&appid=wh5&loginType=2&loginWQBiz=interact&g_ty=ls&g_tk=1294369933`,
                // 'form':``,
                cookie
            }
        )
        for (let i of s?.data?.taskDetailResList || []) {
            if (i.times != i.maxTimes) {
                let a = await this.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=doInteractTask&body=${encodeURIComponent(this.dumps(i))}&appid=wh5&loginType=2&loginWQBiz=interact&g_ty=ls&g_tk=1294369933`,
                        // 'form':``,
                        cookie
                    }
                )
                if (a.data.totalNum) {
                    console.log(`${i.taskName}任务完成`)
                }
                else {
                    console.log(`${i.taskName}任务已经做过了`)
                }
            }
        }
    }
}

module.exports = Main;
