const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东超市对暗号赢免单"
        this.cron = `${this.rand(0, 59)} ${this.rand(16, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.interval = 2000
        this.readme = "答案远程下发,脚本晚些时候跑"
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: "main",
            version: "latest"
        })
        let s = await this.curl({
                'url': this.qitoApi,
                form: `script=${this.filename}`
            }
        )
        if (this.haskey(s, 'data')) {
            this.dict = s.data
        }
        else {
            console.log("没有获取到答案...")
            this.jump = 1
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let list = await this.algo.curl({
                'url': 'https://api.m.jd.com/atop_channel_question_list',
                'form': 'appid=jd-super-market&t=1726822873676&functionId=atop_channel_question_list&client=m&body={"bizCode":"cn_retail_jdsupermarket","scenario":"free_order","babelActivityId":"01718639","babelChannel":"ttt2","isJdApp":"0","isWx":"0"}',
                cookie,
                algo: {
                    appId: '35fa0'
                }
            }
        )
        if (this.haskey(list, 'code', '11001')) {
            console.log("未登录")
        }
        for (let i of this.haskey(list, 'data.floorData.items.0.dateGroupQuestionList')) {
            for (let j of i.dateQuestionList) {
                if (j.completionFlag) {
                    console.log("已答题:", j.question)
                }
                else {
                    console.log("正在答题:", j.question)
                    if (this.dict[j.encryptAssignmentId]) {
                        console.log("命中答案,正在答题:", this.dict[j.encryptAssignmentId].answer)
                        let answer = await this.algo.curl({
                                'url': `https://api.m.jd.com/atop_channel_submit_answer`,
                                'form': `appid=jd-super-market&t=1726822873676&functionId=atop_channel_submit_answer&client=m&body={"bizCode":"cn_retail_jdsupermarket","scenario":"free_order","babelActivityId":"01718639","encryptAssignmentId":"${j.encryptAssignmentId}","answer":"${this.dict[j.encryptAssignmentId].answer}","babelChannel":"ttt2","isJdApp":"0","isWx":"0"}`,
                                cookie
                            }
                        )
                        if (this.haskey(answer, 'data.interactiveRewardVO')) {
                            if (answer.data.interactiveRewardVO.rewardType == 35) {
                                this.print(`获得: ${answer.data.interactiveRewardVO.hongbaoAmount}超市卡`, p.user)
                            }
                            else {
                                console.log(answer.data.interactiveRewardVO)
                            }
                        }
                        else {
                            console.log(answer)
                        }
                        await this.wait(2000)
                    }
                    else {
                        console.log("答案还没更新,晚点再来....")
                        this.jump = 1
                    }
                }
            }
        }
    }
}

module.exports = Main;
