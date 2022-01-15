const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东萌虎摇摇乐"
        this.cron = "26 0,21 * * *"
        this.help = 'main'
        this.task = 'local'
        this.aid = "own"
        this.thread = 6
        this.turn = 2
    }

    async prepare() {
        for (let cookie of this.cookies['help']) {
            let s = await this.curl({
                    'url': `https://api.m.jd.com/api`,
                    'form': `appid=china-joy&functionId=collect_bliss_cards_prod&body={"apiMapping":"/api/task/support/getShareId"}&t=1642248138605&loginType=2`,
                    cookie
                }
            )
            try {
                this.shareCode.push({shareId: s.data})
            } catch (e) {
            }
        }
    }

    async assist(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/api`,
                'form': `appid=china-joy&functionId=collect_bliss_cards_prod&body={"shareId":"${p.inviter.shareId}","apiMapping":"/api/task/support/doSupport"}&t=1642248336552&loginType=2`,
                cookie
            }
        )
        console.log(s.msg)
    }

    async main(p) {
        let cookie = p.cookie;
        let l = await this.curl({
                'url': `https://api.m.jd.com/api`,
                'form': `appid=china-joy&functionId=collect_bliss_cards_prod&body={"apiMapping":"/api/task/brand/tabs"}&t=1642245113941&loginType=2`,
                cookie
            }
        )
        let beans = []
        var doing = 0
        for (let _ of Array(20)) {
            doing = 0
            for (let i of l.data) {
                console.log(p.user, '正在做主任务:', i.brandName)
                try {
                    let s = await this.curl({
                            'url': `https://api.m.jd.com/api`,
                            'form': `appid=china-joy&functionId=collect_bliss_cards_prod&body={"taskGroupId":${i.taskGroupId},"apiMapping":"/api/task/brand/getTaskList"}&t=1642245395184&loginType=2`,
                            cookie
                        }
                    )
                    for (let j of s.data) {
                        if (j.totalNum>j.finishNum) {
                            doing = 1
                            console.log(p.user, `正在浏览子任务: ${j.taskItemName}`)
                            let d = await this.curl({
                                    'url': `https://api.m.jd.com/api`,
                                    'form': `appid=china-joy&functionId=collect_bliss_cards_prod&body={"taskGroupId":${i.taskGroupId},"taskId":"${j.taskId}","taskItemId":"${j.taskItemId}","apiMapping":"/api/task/brand/doTask"}&t=1642245529563&loginType=2`,
                                    cookie
                                }
                            )
                            if (j.browseTime) {
                                await this.wait(parseInt(j.browseTime) * 1000)
                            }
                            let r = await this.curl({
                                    'url': `https://api.m.jd.com/api`,
                                    'form': `appid=china-joy&functionId=collect_bliss_cards_prod&body={"taskGroupId":${i.taskGroupId},"taskId":"${j.taskId}","taskItemId":"${j.taskItemId}","timestamp":${d.data.timeStamp},"apiMapping":"/api/task/brand/getReward"}&t=1642245538003&loginType=2`,
                                    cookie
                                }
                            )
                            if (this.haskey(r, 'data.jbean')) {
                                beans.push(r.data.jbean)
                            }
                            console.log(p.user, `${j.taskItemName} 奖励`, r.data)
                        }
                    }
                } catch (e) {
                }
            }
            if (!doing) {
                break
            }
        }
        let n = await this.curl({
                'url': `https://api.m.jd.com/api`,
                'form': `appid=china-joy&functionId=collect_bliss_cards_prod&body={"apiMapping":"/api/index/indexInfo"}&t=1642247172222&loginType=2`,
                cookie
            }
        )
        let lotteryNum = this.haskey(n, 'data.lotteryNum') || 0
        let card = []
        for (let i = 0; i<lotteryNum; i++) {
            try {
                let s = await this.curl({
                        'url': `https://api.m.jd.com/api`,
                        'form': `appid=china-joy&functionId=collect_bliss_cards_prod&body={"apiMapping":"/api/lottery/lottery"}&t=1642247169719&loginType=2`,
                        cookie
                    }
                )
                let prizeName = s.data.prizeName
                console.log(p.user, '抽奖获得: ', s.data.prizeName)
                if (prizeName == '京豆') {
                    beans.push(s.data.prizeCount)
                }
                else if (prizeName && prizeName != "未中奖") {
                    card.push(prizeName)
                }
            } catch
                (e) {
            }
        }
        if (beans.length || card.length) {
            this.notices(`获得京豆: ${this.sum(beans)}\n${card.join("\n")}`, p.user)
        }
    }
}

module.exports = Main;
