const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东电器整合"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.verify = 1
        this.thread = 3
        this.readme = `请先将custom的值设置为相关活动的activityId`
    }

    async prepare() {
        this.assert(this.custom, "filename_custom=id")
        for (let i of this.getValue('custom')) {
            this.shareCode.push({
                activityId: i
            })
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let info = await this.curl({
                'url': `https://combination.m.jd.com/tzh/combination/indexInfo?activityId=${p.inviter.activityId}&t=${this.timestamp}`,
                // 'form':``,
                cookie
            }
        )
        let ids = []
        let gifts = []
        if (this.haskey(info, 'data.list')) {
            for (let i of info.data.list) {
                console.log("正在执行:", i.taskName)
                if (i.taskStatus != '4') {
                    for (let j of i.taskList) {
                        let s = await this.curl({
                                'url': `https://combination.m.jd.com/tzh/combination/doTask`,
                                'form': `activityId=${p.inviter.activityId}&id=${j.id}&taskId=${i.taskId}&t=${this.timestamp}`,
                                cookie
                            }
                        )
                        console.log(s.msg)
                        if (this.haskey(s, 'data.jdNum')) {
                            gifts.push(s.data.jdNum)
                            console.log(`获得京豆: ${s.data.jdNum}`)
                        }
                    }
                    if (i.taskId == '3') {
                        ids = this.column(i.taskList, 'id')
                        await this.wait(6000)
                        for (let id of ids) {
                            let d = await this.curl({
                                    'url': `https://combination.m.jd.com/tzh/combination/getPrize`,
                                    'form': `activityId=${p.inviter.activityId}&id=${id}&taskId=${i.taskId}&t=${this.timestamp}`,
                                    cookie
                                }
                            )
                            console.log(d.msg)
                            if (this.haskey(d, 'data.jdNum')) {
                                gifts.push(d.data.jdNum)
                                console.log(`获得京豆: ${d.data.jdNum}`)
                            }
                        }
                    }
                }
            }
            let r = await this.curl({
                    'url': `https://combination.m.jd.com/tzh/combination/extraTaskPrize`,
                    'form': `activityId=${p.inviter.activityId}&t=${this.timestamp}`,
                    cookie
                }
            )
            console.log(r.msg)
            if (this.haskey(r, 'data.jdNum')) {
                gifts.push(r.data.jdNum)
                console.log(`获得京豆: ${r.data.jdNum}`)
            }
            if (gifts.length) {
                console.log(`共获得京豆: ${this.sum(gifts)}`)
                this.notices(`共获得京豆: ${this.sum(gifts)}`, p.user)
            }
        }
        else {
            console.log(`没有获取到数据信息`)
        }
    }
}

module.exports = Main;
