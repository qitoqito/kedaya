const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东超市跨年对暗号"
        this.cron = "6 6 6 6 6"
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
        let work = await this.algo.curl({
                'url': `https://api.m.jd.com/atop_channel_code_word`,
                'form': `appid=jd-super-market&t=1735650765258&functionId=atop_channel_code_word&client=m&uuid=674ce0d97511f5ed054c3dc0af093b3b245ab68d&body={"bizCode":"cn_retail_jdsupermarket","scenario":"interactive","babelActivityId":"01722417","babelChannel":"ttt5","isJdApp":"1","isWx":"0"}&h5st=&x-api-eid-token=jdd03C3HUEKC6G2V5WV6SOXJV5E4J2ILKIIHLPARTU7DKUSMS72ICFUVMMF7ZVZXDON6VLTUCVU2GNZ2RZRMVIDXGF2FBMUAAAAMUDTKN5XQAAAAADAQS7F7R6IFNLMX`,
                cookie,
                algo: {
                    appId: '35fa0'
                }
            }
        )
        for (let i of this.haskey(work, 'data.floorData.items.0.roundGroupQuestionList')) {
            for (let j of i.roundQuestionList) {
                if (j.completionFlag) {
                    console.log("已答题:", j.question)
                }
                else {
                    console.log("正在答题:", j.question)
                    if (this.dict[j.encryptAssignmentId]) {
                        console.log("命中答案,正在答题:", this.dict[j.encryptAssignmentId].answer)
                        let answer = await this.algo.curl({
                                'url': `https://api.m.jd.com/atop_channel_code_submit`,
                                'form': `appid=jd-super-market&t=1735652014484&functionId=atop_channel_code_submit&client=m&uuid=60851eb2289770baca0cb3525ef19b4d2d51d666&body={"bizCode":"cn_retail_jdsupermarket","scenario":"interactive","babelActivityId":"01722417","encryptAssignmentId":"${j.encryptAssignmentId}","answer":"${this.dict[j.encryptAssignmentId].answer}","babelChannel":"ttt12","isJdApp":"1","isWx":"0"}`,
                                cookie
                            }
                        )
                        if (this.haskey(answer, 'data.interactiveRewardVO')) {
                            if (answer.data.interactiveRewardVO.rewardType == 56) {
                                this.print(`获得: ${answer.data.interactiveRewardVO.rewardValue}超市卡`, p.user)
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
        for (let i of Array(21)) {
            let bet = await this.curl({
                    'url': `https://api.m.jd.com/atop_channel_newyear_lottery_bet`,
                    'form': `appid=jd-super-market&t=1735656483694&functionId=atop_channel_newyear_lottery_bet&client=m&uuid=60851eb2289770baca0cb3525ef19b4d2d51d666&body={"provinceId":16,"cityId":1341,"countyId":1347,"townId":44750,"bizCode":"cn_retail_jdsupermarket","scenario":"interactive","babelActivityId":"01722417","channelFollowStatus":1,"babelChannel":"ttt5","isJdApp":"1","isWx":"0"}&h5st=&x-api-eid-token=jdd03FQ6Z2DTGYZSJM5FKY54JLAURRHP2UZHK2ID7554EMNWWNNSK3JBCTLTR45IOP3Z5K3YJHOG64SJAOB44KVS3RH7G2UAAAAMUDS2HM3YAAAAACXDQ5P4VEVSNHEX`,
                    cookie,
                    algo: {
                        appId: '32393'
                    }
                }
            )
            if (!this.haskey(bet, 'data.floorData.items.0.credits')) {
                break
            }
            for (let i of this.haskey(bet, 'data.floorData.items.0.rewards')) {
                this.print(`获得: ${i.rewardName} ${i.rewardValue}`, p.user)
            }
        }
    }
}

module.exports = Main;
