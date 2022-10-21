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
        let main = await this.curl({
                'url': `https://api.m.jd.com/subject_challenge_main`,
                'form': `appid=contenth5_common&functionId=subject_challenge_main&body=%7B%22page%22%3A1%2C%22pageSize%22%3A10%2C%22tabSource%22%3A%22recommend%22%7D&client=h5&clientVersion=11.3.0`,
                cookie
            }
        )
        if (this.haskey(main, 'result.data.listData')) {
            for (let i of main.result.data.listData) {
                if (i.rewardStatus == 0) {
                    let subject = await this.curl(this.modules.jdUrl.app("channelBff_querySubject", {
                            "scene": "",
                            "topContentId": "",
                            "tabType": 2,
                            "topContents": "",
                            "tabId": -1,
                            "subjectId": i.subjectId,
                            "page": 1
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
                        let message = this.haskey(done, 'message')
                        if (message.includes('火爆')) {
                            console.log("火爆了,退出该任务")
                            break
                        }
                        if (this.haskey(done, 'data.rewardsInfo')) {
                            this.print(done.data.rewardsInfo.rewardMsg, p.user)
                            break
                        }
                    }
                }
            }
        }
        else {
            console.log("没有获取到集赞数据")
        }
    }
}

module.exports = Main;
