const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东直播任务"
        // this.cron = "28 3,19 * * *"
        this.task = 'local'
        // this.thread = 3
    }

    async main(p) {
        let cookie = p.cookie;
        let taskList = await this.curl({
                'url': `https://api.m.jd.com/api?functionId=liveChannelTaskListToM&appid=h5-live&body={"timestamp":${this.timestamp}}&ext=%7B%22prstate%22:%221%22%7D&v=1652001241803&uuid=`,
                // 'form':``,
                cookie
            }
        )
        let gifts = []
        this.assert(this.haskey(taskList, 'data'), '没有获得数据')
        for (let i in this.haskey(taskList, 'data')) {
            let data = taskList.data[i]
            switch (i) {
                case 'sign':
                    let day = data.today
                    let list = data.list[parseInt(day) - 1]
                    if (list.state == 0) {
                        console.log(`今天已签到`)
                    }
                    else {
                        console.log(`正在签到`)
                        let sign = await this.curl({
                                'url': `https://api.m.jd.com/api?functionId=getChannelTaskRewardToM&appid=h5-live&body={"type":"signTask","itemId":"1"}&ext=%7B%22prstate%22:%221%22%7D&v=1652001241803&uuid=`,
                                // 'form':``,
                                cookie
                            }
                        )
                        if (this.haskey(sign, 'sum')) {
                            console.log(`获得京豆:`, sign.sum)
                            gifts.push(sign.sum)
                        }
                        else {
                            console.log(`任务领奖失败`)
                        }
                    }
                    break
                case 'task':
                    for (let j of data) {
                        if (j.state == 3) {
                            console.log(`任务完成:`, j.title)
                        }
                        else {
                            if (j.type == 'commonViewTask') {
                                console.log(`正在观看`)
                                for (let n = 0; n<2; n++) {
                                    let view = await this.curl({
                                            url: 'https://api.m.jd.com/client.action',
                                            form: 'functionId=liveChannelReportDataV912&body=%7B%22liveId%22%3A%223008300%22%2C%22type%22%3A%22viewTask%22%2C%22authorId%22%3A%22644894%22%2C%22extra%22%3A%7B%22time%22%3A120%7D%7D&uuid=487f7b22f68312d2c1bbc93b1aea44&client=apple&clientVersion=10.0.10&st=1652003400576&sv=100&sign=05accf4ce50a8ff2463e64675220581d',
                                            cookie
                                        }
                                    )
                                    let reward = await this.curl({
                                            'url': `https://api.m.jd.com/api?functionId=getChannelTaskRewardToM&appid=h5-live&body={"type":"commonViewTask","liveId":"3008300"}&ext=%7B%22prstate%22:%221%22%7D&v=1652001241803&uuid=`,
                                            // 'form':``,
                                            cookie
                                        }
                                    )
                                    if (this.haskey(reward, 'sum')) {
                                        console.log(`获得京豆:`, reward.sum)
                                        gifts.push(reward.sum)
                                    }
                                    else {
                                        console.log(`任务领奖失败`)
                                    }
                                    await this.wait(2000)
                                }
                            }
                            else if (j.type == 'shareTask') {
                                console.log(`正在分享`)
                                for (let n = 0; n<2; n++) {
                                    let share = await this.curl({
                                            url: 'https://api.m.jd.com/client.action',
                                            form: 'functionId=liveChannelReportDataV912&body=%7B%22liveId%22%3A%222995233%22%2C%22type%22%3A%22shareTask%22%2C%22authorId%22%3A%22682780%22%2C%22extra%22%3A%7B%22num%22%3A1%7D%7D&uuid=487f7b22f68312d2c1bbc93b&client=apple&clientVersion=10.0.10&st=1652002949033&sv=111&sign=60e0c9cbb50194ec045786a079dfd06c',
                                            cookie
                                        }
                                    )
                                    let reward = await this.curl({
                                            'url': `https://api.m.jd.com/api?functionId=getChannelTaskRewardToM&appid=h5-live&body={"type":"shareTask","liveId":"2942545"}&ext=%7B%22prstate%22:%221%22%7D&v=1652001241803&uuid=`,
                                            // 'form':``,
                                            cookie
                                        }
                                    )
                                    if (this.haskey(reward, 'sum')) {
                                        console.log(`获得京豆:`, reward.sum)
                                        gifts.push(reward.sum)
                                    }
                                    else {
                                        console.log(`任务领奖失败`)
                                    }
                                    await this.wait(2000)
                                }
                            }
                        }
                    }
                    break
            }
        }
        if (gifts.length>0) {
            let sum = this.sum(gifts)
            console.log(p.user, `获得京豆: ${sum}`)
            this.notices(`获得京豆: ${sum}`, p.user)
        }
    }
}

module.exports = Main;
