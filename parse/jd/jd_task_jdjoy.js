const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东互动赢京豆"
        // this.cron = "33 0,22 * * *"
        this.task = 'active'
        this.help = 'main'
        this.thread = 6
        this.verify = 1
        this.manual = 1
    }

    async prepare() {
        this.assert(this.custom, '请先添加环境变量')
        let custom = this.getValue('custom')
        let type = 'a'
        for (let activityId of custom) {
            let pin = []
            for (let i of this.cookies['help']) {
                let s = await this.curl({
                        'url': `https://jdjoy.jd.com/module/freshgoods/getActivityPage?code=${activityId}`,
                        // 'form':``,
                        cookie: i
                    }
                )
                if (s.data) {
                    type = 'b'
                    pin.push(this.haskey(s, 'data.jdpin'))
                }
                else {
                    let s2 = await this.curl({
                            'url': `https://jdjoy.jd.com/module/task/draw/get?configCode=${activityId}&unionCardCode=`,
                            // 'form':``,
                            cookie: i
                        }
                    )
                    if (s2.data) {
                        type = 'c'
                    }
                    else {
                        break
                    }
                }
            }
            pin = pin.filter(d => d)
            this.shareCode.push({activityId, pin, type})
        }
    }

    async main(p) {
        let cookie = p.cookie
        let id = p.inviter.activityId
        let eid = this.uuid(90).toUpperCase();
        let fp = this.uuid(40)
        let n = 0
        let a = {}
        if (p.inviter.type == 'b') {
            for (let j = 0; j<80; j++) {
                let l = await this.curl({
                        'url': `https://jdjoy.jd.com/module/freshgoods/getMyTask?code=${id}`,
                        // 'form':``,
                        cookie
                    }
                )
                let k = 0
                for (let i of this.haskey(l, 'data.myTasks') || []) {
                    if (i.hasFinish || i.taskCount == i.finishCount) {
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
                            "code": id,
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
                if (n>2) {
                    console.log(p.user, '连续3次没有获取到任务列表,跳出循环')
                    break
                }
                if (k == 0) {
                    n++
                    await this.wait(1000)
                }
            }
            for (let pin of p.inviter.pin) {
                var b = await this.curl({
                        'url': `https://jdjoy.jd.com/module/freshgoods/getActivityPage?code=${id}&friendPin=${escape(encodeURIComponent(pin))}`,
                        // 'form':``,
                        cookie
                    }
                )
            }
            if (this.haskey(b, 'data.remainPoints')) {
                let g = []
                for (let i = 0; i<Math.floor(b.data.remainPoints / (this.haskey(b, 'data.lotteryThreshold') || 100)); i++) {
                    let c = await this.curl({
                            'url': `https://jdjoy.jd.com/module/freshgoods/draw?code=${id}&eid=${eid}&fp=${fp}`,
                            // 'form':``,
                            cookie
                        }
                    )
                    console.log(c)
                    if (this.haskey(c, 'data.rewardName')) {
                        console.log(p.user, '抽中:', c.data.rewardName)
                        g.push(c.data.rewardName)
                    }
                    else {
                        console.log(p.user, '什么也没有抽到')
                    }
                }
                if (g.length) {
                    this.notices(g.join('\n'), p.user)
                }
            }
        }
        else if (p.inviter.type == 'c') {
            for (let j = 0; j<80; j++) {
                a = await this.curl({
                        'url': `https://jdjoy.jd.com/module/task/draw/get?configCode=${id}&unionCardCode=`,
                        // 'form':``,
                        cookie
                    }
                )
                let k = 0
                for (let i of this.haskey(a, 'data.taskConfig') || []) {
                    if (i.hasFinish || i.taskCount == i.finishCount) {
                        console.log(p.user, `${i.taskName || i.taskType}任务已经完成`)
                    }
                    else {
                        k = 1
                        if (i.viewTime) {
                            await this.wait(i.viewTime * 1000)
                        }
                        let body = {
                            "configCode": id,
                            "taskType": i.taskType,
                            "taskId": i.id
                        }
                        if (this.haskey(i, 'taskItem.itemId')) {
                            body.itemId = i.taskItem.itemId
                        }
                        let s = await this.curl({
                                'url': `https://jdjoy.jd.com/module/task/draw/doTask`,
                                body,
                                cookie
                            }
                        )
                        console.log(p.user, '任务', s.success)
                        if (!s.success) {
                            n++
                            await this.wait(1000)
                        }
                        else {
                            let r = await this.curl({
                                    'url': `https://jdjoy.jd.com/module/task/draw/getReward`,
                                    body,
                                    cookie
                                }
                            )
                            n = 0
                        }
                    }
                }
                if (n>2) {
                    console.log(p.user, '连续3次没有获取到任务列表,跳出循环')
                    break
                }
                if (k == 0) {
                    n++
                    await this.wait(1000)
                }
            }
            let chanceLeft = this.haskey(a, 'data.chanceLeft')
            if (chanceLeft) {
                let gift = []
                for (let i = 0; i<chanceLeft; i++) {
                    let s = await this.curl({
                            'url': `https://jdjoy.jd.com/module/task/draw/join?configCode=${id}&fp=undefined&eid=undefined`,
                            // 'form':``,
                            cookie
                        }
                    )
                    let r = this.haskey(s, 'data.rewardName')
                    if (r && r != '谢谢参与') {
                        gift.push(r)
                    }
                    console.log(p.user, r || '什么也没有')
                }
                if (gift.length) {
                    this.notices(gift.join("\n"), p.user)
                }
            }
        }
        else {
            for (let j = 0; j<80; j++) {
                a = await this.curl({
                        'url': `https://jdjoy.jd.com/module/task/v2/getActivity?configCode=${id}&eid=${eid}&fp=${fp}`,
                        cookie,
                    }
                )
                let k = 0
                for (let i of this.haskey(a, 'data.dailyTask.taskList')) {
                    // if (i.taskCount == i.finishCount) {
                    if (i.hasFinish || i.taskCount == i.finishCount) {
                        console.log(p.user, `${i.groupType}任务已经完成`)
                        let r = await this.curl({
                                'url': `https://jdjoy.jd.com/module/task/v2/getReward`,
                                'body': {
                                    "groupType": i.groupType || 5,
                                    "configCode": p.inviter.activityId,
                                    "itemId": this.haskey(i, 'data.item.itemId') || 1,
                                    "eid": eid,
                                    "fp": fp
                                },
                                cookie
                            }
                        )
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
                if (n>2) {
                    console.log(p.user, '连续3次没有获取到任务列表,跳出循环')
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
                                "configCode": p.inviter.activityId,
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
