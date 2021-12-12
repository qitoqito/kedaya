const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东爱返利"
        this.cron = "5 0,22 * * *"
        this.task = 'local'
        this.thread = 5
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie
        let ssss = await this.curl({
                'url': `https://ifanli.m.jd.com/rebateapi/task/getTaskFinishCount`,
                cookie
            }
        )
        for (let i = ssss.content.finishCount; i<ssss.content.maxTaskCount; i++) {
            let s = await this.curl({
                    'url': `https://ifanli.m.jd.com/rebateapi/task/getTaskList`,
                    cookie
                }
            )
            let dict = this.column(s.content, '', 'rewardBeans')
            let d = {}
            if (Object.keys(dict).length == 1) {
                for (let ii of s.content) {
                    if (ii.taskId && ii.status != 3) {
                        d = ii
                        break
                    }
                }
            }
            else {
                let max = Math.max(...Object.keys(dict).map(d => parseInt(d)));
                d = dict[max]
            }
            let sss = await this.curl({
                    'url': `https://ifanli.m.jd.com/rebateapi/task/saveTaskRecord`,
                    'json': {
                        "taskId": d.taskId,
                        "taskType": d.taskType,
                        "businessId": d.businessId
                    },
                    cookie
                }
            )
            await this.wait(d.watchTime * 1000)
            let ssss = await this.curl({
                    'url': `https://ifanli.m.jd.com/rebateapi/task/saveTaskRecord`,
                    'json': {
                        "taskId": d.taskId,
                        "taskType": d.taskType,
                        "uid": sss.content.uid,
                        "tt": sss.content.tt,
                        "businessId": d.businessId
                    },
                    cookie
                }
            )
            console.log(ssss.content);
        }
        console.log("任务已完成")
    }
}

module.exports = Main;
