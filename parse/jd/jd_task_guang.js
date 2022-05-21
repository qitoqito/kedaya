const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东逛系列整合"
        this.cron = "24 0,15 * * *"
        this.task = 'local'
        this.verify = 1
        this.thread = 3
    }

    async prepare() {
        let custom = this.custom 
        if (custom) {
            for (let i of custom.split('|')) {
                this.shareCode.push({
                    encryptProjectId: i
                })
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let encryptProjectId = p.inviter.encryptProjectId
        let appid = "publicUseApi"
        let sourceCode = "acemsg0406"
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=queryInteractiveInfo&appid=${appid}&body={"encryptProjectId":"${encryptProjectId}","sourceCode":"${sourceCode}"}&client=wh5&clientVersion=1.0.0&networkType=&ext={"prstate":"0"}`,
                cookie
            }
        )
        let gifts = []
        for (let i of this.haskey(s, 'assignmentList')) {
            if (i.completionFlag) {
                console.log(`任务已经完成: ${i.assignmentName}`)
            }
            else {
                let extraType = i.ext.extraType
                if (this.haskey(i, `ext.${i.ext.extraType}`)) {
                    let extra = i.ext[extraType]
                    if (extraType == 'sign1') {
                        let sign = await this.curl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `functionId=doInteractiveAssignment&appid=${appid}&body={"encryptProjectId":"${encryptProjectId}","sourceCode":"${sourceCode}","encryptAssignmentId":"${i.encryptAssignmentId}","completionFlag":true,"itemId":"1"}`,
                                cookie
                            }
                        )
                        this.rewards(sign, gifts)
                    }
                    else {
                        for (let j of extra) {
                            let doTask = await this.curl({
                                    'url': `https://api.m.jd.com/client.action`,
                                    'form': `functionId=doInteractiveAssignment&appid=${appid}&body={"encryptProjectId":"${encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","itemId":"${j.advId || j.itemId}","sourceCode":"aceaceqingzhan"}&sign=11&t=${this.timestamp}`,
                                    cookie
                                }
                            )
                            this.rewards(doTask, gifts)
                        }
                    }
                }
                else {
                    let doTask = await this.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `functionId=doInteractiveAssignment&appid=${appid}&body={"encryptProjectId":"${encryptProjectId}","sourceCode":"${sourceCode}","encryptAssignmentId":"${i.encryptAssignmentId}","completionFlag":true}&t=1653104941026&client=wh5&clientVersion=1.0.0`,
                            cookie
                        }
                    )
                    this.rewards(doTask, gifts)
                }
            }
        }
        if (gifts.length) {
            console.log(`获得奖励列表:`)
            for (let i of gifts) {
                this.print(`${i.rewardName} : ${i.quantity}`, p.user)
            }
        }
        else {
            console.log(`什么奖励也没有`)
        }
    }

    rewards(r, gifts) {
        if (this.haskey(r, 'rewardsInfo.successRewards')) {
            for (let g in r.rewardsInfo.successRewards) {
                let data = r.rewardsInfo.successRewards[g]
                try {
                    for (let k of data) {
                        gifts.push(k)
                        console.log(k.rewardName, k.quantity)
                    }
                } catch (e) {
                    for (let k of this.haskey(data, 'quantityDetails')) {
                        gifts.push(k)
                        console.log(k.rewardName, k.quantity)
                    }
                }
            }
        }
    }
}

module.exports = Main;
