const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东逛PLUS抽京豆"
        // this.cron = "19 0,17 * * *"
        this.task = 'local'
    }

    async main(p) {
        let cookie = p.cookie;
        let encryptProjectId = this.custom || 'U13AR7JM6UNr2okmamEig7TD4Ef'
        let l = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=queryInteractiveInfo`,
                'form': `appid=babelh5&body={"encryptProjectId":"${encryptProjectId}","ext":{"rewardEncryptAssignmentId":null,"needNum":50},"sourceCode":"aceaceqingzhan"}&sign=11&t=1646206781226`,
                cookie
            }
        )
        let lotteryId = '21qucmvBdAxp8A4NifVZmKxN11w1'
        for (let i of this.haskey(l, 'assignmentList')) {
            if (i.completionFlag) {
                console.log(`任务已经完成: ${i.assignmentName}`)
            }
            else {
                if (this.haskey(i, 'ext.shoppingActivity.0.advId')) {
                    let s = await this.curl({
                            'url': `https://api.m.jd.com/client.action?functionId=doInteractiveAssignment`,
                            'form': `appid=babelh5&body={"encryptProjectId":"${encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","itemId":"${i.ext.shoppingActivity[0].advId}","sourceCode":"aceaceqingzhan"}&sign=11&t=1646206811367`,
                            cookie
                        }
                    )
                    console.log(i.assignmentName, s.msg)
                    if (s.msg == '该用户不符合资质校验条件') {
                        return
                    }
                }
                else {
                    if (i.assignmentName == '积分抽奖赢好礼') {
                        lotteryId = i.encryptAssignmentId
                    }
                }
            }
        }
        let gifts = []
        for (let i = 0; i<3; i++) {
            let r = await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=doInteractiveAssignment`,
                    'form': `appid=babelh5&body={"encryptProjectId":"${encryptProjectId}","encryptAssignmentId":"${lotteryId}","completionFlag":true,"ext":{"exchangeNum":1},"sourceCode":"aceaceqingzhan"}&sign=11&t=1646207845798`,
                    cookie
                }
            )
            if (this.haskey(r, 'rewardsInfo.successRewards')) {
                for (let g in r.rewardsInfo.successRewards) {
                    let data = r.rewardsInfo.successRewards[g]
                    console.log(data)
                    for (let k of data) {
                        gifts.push(k.rewardName)
                    }
                }
            }
            else {
                console.log(`什么也没有抽到`)
            }
        }
        if (gifts.length) {
            this.notices(gifts.join("\n"), p.user)
        }
    }
}

module.exports = Main;
