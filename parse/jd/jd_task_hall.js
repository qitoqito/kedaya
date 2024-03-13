const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东特物超级殿堂"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
        this.verify = 1
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            appId: "8adfb",
            type: 'lite',
        })
        let ee = await this.curl({
            'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandSecondFloorMainPage&t=${this.timestamp}&body={"source":"hall_1111"}`,
        })
        let ide = this.haskey(ee, 'data.result.activityBaseInfo.activityId')
        if (ide) {
            this.shareCode.push({
                activityId: ide,
                source: "hall_1111"
            })
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let source = p.inviter.source
        let activityId = p.inviter.activityId
        let tt = await this.curl({
                'url': `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandSecondFloorMainPage&t=${this.timestamp}&body={"source":"${source}","activityId":${activityId}}`,
                cookie
            }
        )
        if (tt.data.bizCode == '0') {
            let encryptProjectId = tt.data.result.activityBaseInfo.encryptProjectId
            let url = `https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskList&t=${this.timestamp}&body={"source":"${source}","activityId":${activityId}}`
            let l = await this.curl({
                    'url': url,
                    cookie,
                }
            )
            for (let i of this.haskey(l, 'data.result.taskList')) {
                try {
                    if (i.assignmentName.includes('惊喜领豆')) {
                        if (i.assignmentTimesLimit != i.completionCnt) {
                            console.log("正在运行:", tt.data.result.activityBaseInfo.activityName)
                            let ss = await this.curl({
                                    'url': `https://api.m.jd.com/api?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t=${this.timestamp}&body={"source":"${source}","activityId":${activityId},"completionFlag":1,"encryptProjectId":"${encryptProjectId}","encryptAssignmentId":"${i.encryptAssignmentId}","assignmentType":${i.assignmentType},"actionType":0,"itemId":""}`,
                                    cookie
                                }
                            )
                            if (ss.data.result.rewards && ss.data.result.rewards != 'null') {
                                for (let r of ss.data.result.rewards) {
                                    if (r.awardName.includes('京豆')) {
                                        this.print(`获得${r.beanNum}京豆`, p.user)
                                    }
                                }
                            }
                        }
                        else {
                            console.log('已领取过任务', activityId)
                        }
                    }
                } catch (e) {
                    console.log("err", e)
                }
            }
        }
    }
}

module.exports = Main;
