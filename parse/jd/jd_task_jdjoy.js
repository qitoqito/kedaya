const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东互动赢京豆"
        // this.cron = "33 0,22 * * *"
        this.task = 'local'
        this.thread = 6
    }

    async prepare() {
        let array = ['8277ae337e5c4ebbbad92bbf9bf1bdee']
        this.code = this.custom ? this.getValue('custom') : array
        for (let activityId of this.code) {
            this.shareCode.push({activityId})
        }
    }

    async main(p) {
        let cookie = p.cookie
        let eid = this.uuid(90).toUpperCase();
        let fp = this.uuid(40)
        let n = 0
        let a = {}
        for (let i = 0; i<100; i++) {
            a = await this.curl({
                    'url': `https://jdjoy.jd.com/module/task/v2/getActivity?configCode=${p.inviter.activityId}&eid=${eid}&fp=${fp}`,
                    cookie,
                }
            )
            let k = 0
            for (let i of this.haskey(a, 'data.dailyTask.taskList')) {
                if (i.taskCount == i.finishCount) {
                    console.log(p.user, `${i.groupType}任务已经完成`)
                }
                else {
                    k = 1
                    n = 0
                    if (i.viewTime) {
                        await this.wait(i.viewTime * 1000)
                    }
                    else {
                        // await this.wait(3000)
                    }
                    let s = await this.curl({
                            'url': `https://jdjoy.jd.com/module/task/v2/doTask`,
                            'body': {
                                "groupType": i.groupType,
                                "configCode": a.data.moduleBaseInfo.configCode,
                                "itemId": i.item.itemId,
                                "eid": eid,
                                "fp": fp
                            },
                            cookie
                        }
                    )
                    console.log(p.user, '任务', s.success)
                }
            }
            if (n == 6) {
                console.log(p.user, '连续6次没有获取到任务列表,跳出循环')
                break
            }
            if (k == 0) {
                n++
                await this.wait(1000)
            }
        }
        if (this.haskey(a, 'data.moduleBaseInfo.rewardStatus', 1)) {
            for (let i of Array(5)) {
                let r = await this.curl({
                        'url': `https://jdjoy.jd.com/module/task/v2/getReward`,
                        'body': {
                            "groupType": 5,
                            "configCode": this.inviter.activityId,
                            "itemId": 1,
                            "eid": eid,
                            "fp": fp
                        },
                        cookie
                    }
                )
                console.log(p.user, '抽奖', r.errorMessage)
            }
        }
    }
}

module.exports = Main;
