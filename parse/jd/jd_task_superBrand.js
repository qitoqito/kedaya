const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东特物Z"
        this.cron = "33 9,14,20 * * *"
        this.help = 'main'
        this.task = 'local'
        this.aid = 'active'
        this.thread = 6
        this.turn = 2
        this.overtime = 10
        this.verify = 1
    }

    async prepare() {
        let source = 'secondfloor'
        let s = await this.curl({
                'url': `https://api.m.jd.com/?uuid=7b01d4690ef13716984dcfcf96068f36b41f6c51&client=wh5&appid=ProductZ4Brand&functionId=showSecondFloorCardInfo&t=${this.timestamp}&body={"source":"${source}"}`,
                // 'form':``,
            }
        )
        try {
            this.dict = s.data.result.activityBaseInfo
            this.dict.source = source
            for (let i of this.cookies['help']) {
                try {
                    let s = await this.curl({
                            'url': `https://api.m.jd.com/?uuid=7b01d4690ef13716984dcfcf96068f36b41f6c51&client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskList&t=1635844758852&body={"source":"${source}","activityId":${this.dict.activityId},"assistInfoFlag":1}`,
                            // 'form':``,
                            cookie: i
                        }
                    )
                    for (let k of s.data.result.taskList) {
                        if (k.assignmentName.includes('邀请')) {
                            this.shareCode.push({
                                encryptAssignmentId: k.encryptAssignmentId,
                                itemId: k.ext.assistTaskDetail.itemId
                            })
                        }
                    }
                } catch (e) {
                }
            }
        } catch (ee) {
        }
    }

    async assist(p) {
        let cookie = p.cookie
        let s = await this.curl({
                'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=1635845724890&body={"source":"${this.dict.source}","activityId":${this.dict.activityId},"encryptProjectId":"${this.dict.encryptProjectId}","encryptAssignmentId":"${p.inviter.encryptAssignmentId}","assignmentType":2,"itemId":"${p.inviter.itemId}","actionType":0}`,
                // 'form':``,
                cookie
            }
        )
        console.log(s.data.result ? "ok" : "error")
    }

    async main(p) {
        let cookie = p.cookie;
        let l = await this.curl({
                'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskList&t=1635835060813&body={"source":"${this.dict.source}","activityId":${this.dict.activityId},"assistInfoFlag":1}`,
                // 'form':``,
                cookie
            }
        )
        for (let i of this.haskey(l, 'data.result.taskList') || []) {
            if (!i.completionFlag) {
                try {
                    if (i.assignmentName.includes('下拉')) {
                        for (let kk of i.rewards) {
                            let ss = await this.curl({
                                    'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${this.dict.source}","activityId":${this.dict.activityId},"encryptProjectId":"${this.dict.encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"itemId":"${kk.itemId}","actionType":0,"dropDownChannel":1}`,
                                    cookie
                                }
                            )
                        }
                    }
                    else {
                        if (i.ext && this.dumps(i.ext) != '{}' && !i.assignmentName.includes('邀请') && !i.assignmentName.includes('开卡')) {
                            let vos = i.ext.sign2 || i.ext.followShop || i.ext.brandMemberList || i.ext.shoppingActivity
                            let ss = await this.curl({
                                    'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${this.dict.source}","activityId":${this.dict.activityId},"completionFlag":1,"encryptProjectId":"${this.dict.encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"actionType":0,"itemId":${vos[0].itemId}}`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            console.log(ss.data.result);
                        }
                    }
                } catch (e) {
                    // console.log(e.message)
                }
            }
        }
        console.log('ok')
        let gifts = []
        if (new Date().getHours()>18) {
            let home = await this.curl({
                    'url': `https://api.m.jd.com/api?functionId=superBrandSecondFloorMainPage&appid=ProductZ4Brand&client=wh5&t=${this.timestamp}&body={"source":"${this.dict.source}"}`,
                    // 'form':``,
                    cookie
                }
            )
            let num = this.haskey(home, 'data.result.activityUserInfo.userStarNum') || 0
            for (let n = 0; n<num; n++) {
                let kk = await this.curl({
                        'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskLottery&t=${this.timestamp}&body={"source":"${this.dict.source}","activityId":${this.dict.activityId},"encryptProjectId":"${this.dict.encryptProjectId}","tag":"divide"}`,
                        // 'form':``,
                        cookie
                    }
                )
                if (this.haskey(kk, 'data.result.rewards')) {
                    for (let i of kk.data.result.rewards) {
                        console.log(p.user, this.dumps(i))
                        if (i.awardType == 3) {
                            gifts.push(i.beanNum)
                        }
                    }
                }
            }
        }
        if (gifts.length) {
            console.log(p.user, `获得京豆: ${this.sum(gifts)}个`)
            this.notices(`获得京豆: ${this.sum(gifts)}个`, p.user)
        }
    }
}

module.exports = Main;
