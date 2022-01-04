const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东互动赢京豆"
        // this.cron = "33 0,22 * * *"
        this.task = 'local'
        this.help = 'main'
        this.thread = 6
    }

    async prepare() {
        let array = ['e71eadcf410d4fe5b79ea7b227488a2b']
        this.code = this.custom ? this.getValue('custom') : array
        for (let activityId of this.code) {
            let pin = []
            for (let i of this.cookies['help']) {
                let s = await this.curl({
                        'url': `https://jdjoy.jd.com/module/freshgoods/getActivityPage?code=${activityId}`,
                        // 'form':``,
                        cookie: i
                    }
                )
                if (s.data) {
                    pin.push(this.haskey(s, 'data.jdpin'))
                }
                else {
                    break
                }
            }
            pin = pin.filter(d => d)
            this.shareCode.push({activityId, pin})
        }
    }

    async main(p) {
        let cookie = p.cookie
        let eid = this.uuid(90).toUpperCase();
        let fp = this.uuid(40)
        let n = 0
        let a = {}
        if (p.inviter.pin) {
            for (let j = 0; j<80; j++) {
                let l = await this.curl({
                        'url': `https://jdjoy.jd.com/module/freshgoods/getMyTask?code=${p.inviter.activityId}`,
                        // 'form':``,
                        cookie
                    }
                )
                let k = 0
                for (let i of this.haskey(l, 'data.myTasks') || []) {
                    if (i.hasFinish) {
                        console.log(p.user, `${i.taskType}任务已经完成`)
                    }
                    else {
                        k = 1
                        if (i.viewTime) {
                            await this.wait(i.viewTime * 1000)
                        }
                        else {
                            // await this.wait(3000)
                        }
                        let body = {
                            "code": p.inviter.activityId,
                            "taskType": i.taskType,
                            "taskId": i.taskId,
                            "eid": eid,
                            "fp": fp
                        }
                        if (this.haskey(i, 'taskItem.itemId')) {
                            body.itemId = i.taskItem.itemId
                        }
                        let s = await this.curl({
                                'url': `https://jdjoy.jd.com/module/freshgoods/doTask`,
                                form: this.query(body, '&'),
                                cookie
                            }
                        )
                        if (!s.success) {
                            n++
                            await this.wait(1000)
                        }
                        else {
                            n = 0
                        }
                        console.log(p.user, '任务', s.success)
                    }
                }
                if (n>5) {
                    console.log(p.user, '连续6次没有获取到任务列表,跳出循环')
                    break
                }
                if (k == 0) {
                    n++
                    await this.wait(1000)
                }
            }
            for (let pin of this.inviter.pin) {
                var b = await this.curl({
                        'url': `https://jdjoy.jd.com/module/freshgoods/getActivityPage?code=${p.inviter.activityId}&friendPin=${encodeURIComponent(pin)}`,
                        // 'form':``,
                        cookie
                    }
                )
            }
            if (b?.data?.remainPoints) {
                let g = []
                for (let i = 0; i<Math.floor(b.data.remainPoints / 100); i++) {
                    let c = await this.curl({
                            'url': `https://jdjoy.jd.com/module/freshgoods/draw?code=${p.inviter.activityId}&eid=${eid}&fp=${fp}`,
                            // 'form':``,
                            cookie
                        }
                    )
                    if (this.haskey(c, 'data.rewardName')) {
                        console.log(p.user, '抽中:', c.data.rewardName)
                        g.push(c.data.rewardName)
                    }
                    else {
                        console.log(p.user, '什么也没有抽到')
                    }
                }
                if (g.length) {
                    this.notices(`抽奖: ${g.join('🐽')}`, p.user)
                }
            }
        }
        else {
            for (let j = 0; j<80; j++) {
                a = await this.curl({
                        'url': `https://jdjoy.jd.com/module/task/v2/getActivity?configCode=${p.inviter.activityId}&eid=${eid}&fp=${fp}`,
                        cookie,
                    }
                )
                let k = 0
                for (let i of this.haskey(a, 'data.dailyTask.taskList')) {
                    // if (i.taskCount == i.finishCount) {
                    if (i.hasFinish) {
                        console.log(p.user, `${i.groupType}任务已经完成`)
                    }
                    else {
                        k = 1
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
                        if (!s.success) {
                            n++
                            await this.wait(1000)
                        }
                        else {
                            n = 0
                        }
                    }
                }
                if (n>5) {
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
}

module.exports = Main;
