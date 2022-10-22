const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东集赞分京豆"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.import = ['jdUrl']
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        for (let n = 0; n<4; n++) {
            if (n == 0) {
                var tab = "recommend"
            }
            else {
                var tab = "joined"
            }
            let main = await this.curl({
                    'url': `https://api.m.jd.com/subject_challenge_main`,
                    'form': `appid=contenth5_common&functionId=subject_challenge_main&body={"page":1,"pageSize":10,"tabSource":"${tab}"}&client=h5&clientVersion=11.3.0`,
                    cookie
                }
            )
            if (this.haskey(main, 'result.data.listData')) {
                for (let i of main.result.data.listData) {
                    if ((i.rewardStatus == 0 || i.remainGradNum) && i.challengeGoalValue != i.challengeCompleteNum) {
                        let subject = await this.curl(this.modules.jdUrl.app("channelBff_querySubject", {
                                "scene": "",
                                "topContentId": "",
                                "tabType": 2,
                                "topContents": "",
                                "tabId": -1,
                                "subjectId": i.subjectId,
                                "page": this.rand(2, 9)
                            }, 'post', cookie)
                        )
                        console.log(`正在运行: ${this.haskey(subject, 'result.subjectVo.title')}`)
                        for (let j of this.haskey(subject, 'result.subjectVo.contentList')) {
                            let done = await this.curl(this.modules.jdUrl.app("subject_interactive_done", {
                                    "subjectId": i.subjectId,
                                    "contentId": j.contentId,
                                    "monitorSurce": "videoDetail"
                                }, 'post', cookie)
                            )
                            console.log(done)
                            // await this.wait(2000)
                            let message = this.haskey(done, 'message')
                            if (message.includes('火爆')) {
                                console.log("火爆了,退出该任务")
                                break
                            }
                            if (this.haskey(done, 'data.rewardsInfo')) {
                                this.print(done.data.rewardsInfo.rewardMsg, p.user)
                            }
                        }
                    }
                }
            }
            else {
                console.log(`没有获取到${tab}集赞数据`)
            }
        }
    }
}

module.exports = Main;
