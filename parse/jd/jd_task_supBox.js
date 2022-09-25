const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东年货超级盒子"
        this.cron = "6 6 6 6 6 "
        this.task = 'local'
        this.thread = 6
    }

    async prepare() {
        this.linkId = 'Ll3Qb2mhCXSEWxruhv8qIw'
    }

    async main(p) {
        let cookie = p.cookie
        let u = await this.curl({
                'url': `https://api.m.jd.com/?functionId=superboxSupBoxHomePage&body={"taskId":"332","linkId":"${this.linkId}","encryptPin":""}&_t=1635586254297&appid=activities_platform`,
                // 'form':``,
                cookie
            }
        )
        let pin = u.data.encryptPin;
        let gifts = []
        u = await this.curl({
                'url': `https://api.m.jd.com/?functionId=superboxSupBoxHomePage&body={"taskId":"332","linkId":"${this.linkId}","encryptPin":"${pin}"}&_t=1635586254297&appid=activities_platform`,
                // 'form':``,
                cookie: this.cookies[this.task][p.index + 1] || this.cookies[this.task][0]
            }
        )
        let s = await this.curl({
            url: `https://api.m.jd.com/?functionId=apTaskList&body={\"linkId\":\"${this.linkId}\",\"encryptPin\":\"\"}&_t=1635133026504&appid=activities_platform`,
            cookie
        })
        for (let i of s.data) {
            if (i.taskLimitTimes>1 && i.taskLimitTimes != i.taskDoTimes) {
                let ss = await this.curl({
                    'url': `https://api.m.jd.com/?functionId=apTaskDetail&body={"taskId":${i.id},"taskType":"BROWSE_SHOP","channel":4,"linkId":"${this.linkId}","encryptPin":""}&_t=1635133141666&appid=activities_platform`,
                    cookie
                })
                for (let j of ss.data.taskItemList) {
                    let sss = await this.curl({
                        'url': 'https://api.m.jd.com/',
                        'form': `functionId=apDoTask&body={"taskId":${i.id},"taskType":"BROWSE_SHOP","channel":4,"itemId":"${j.itemId}","linkId":"${this.linkId}","encryptPin":""}&_t=1635133142014&appid=activities_platform`
                        , cookie
                    })
                    console.log(sss.data?.awardInfo);
                }
            }
        }
        for (let i of Array(20)) {
            let ssss = await this.curl({
                'url': `https://api.m.jd.com/?functionId=superboxOrdinaryLottery&body={"linkId":"${this.linkId}","encryptPin":""}&_t=1635134002941&appid=activities_platform`,
                cookie
            })
            // console.log(ssss.data || ssss);
            if (this.haskey(ssss, 'data.discount')) {
                if (ssss.data.rewardType == 2) {
                    gifts.push(ssss.data.discount)
                }
            }
            if (ssss.errMsg == '没有抽奖次数') {
                break
            }
        }
        let c = await this.curl({
            'url': `https://api.m.jd.com/?functionId=superboxRealBigLottery&body={"linkId":"${this.linkId}","encryptPin":""}&_t=1635587400273&appid=activities_platform`,
            cookie
        })
        console.log('任务满抽奖', c.data)
        if (this.haskey(c, 'data.discount')) {
            if (c.data.rewardType == 2) {
                gifts.push(c.data.discount)
            }
        }
        if (gifts.length) {
            console.log(gifts)
            gifts = gifts.filter(d => /^\d+(?:.\d+)$/.test(d))
            console.log(p.user, `活动奖励: ${this.sum(gifts)}元`)
            this.notices(`活动奖励: ${this.sum(gifts)}元`, p.user)
        }
    }
}

module.exports = Main;
