const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东家电家居超级抓抓机"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
        this.interval = 2000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            verison: 'latest'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let info = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action?functionId=queryInteractiveInfo`,
                'form': `appid=home-channel&functionId=queryInteractiveInfo&body={"encryptProjectId":"6pvWvhxzcHzeEiWsqP5oKgUbHEy","sourceCode":"ace454250","ext":{"needNum":10,"rewardEncryptAssignmentId":"2oGxy3iBrKw3YFG2Z7DGWFNXxVkT","assistEncryptAssignmentId":"36a4jWTk5hyZS5fq76FhWKHGHm9a","assistInfoFlag":4,"assistNum":5}}`,
                cookie,
                algo: {
                    appId: "684f0"
                }
            }
        )
        let lotteryId = null
        for (let i of this.haskey(info, 'assignmentList')) {
            if (i.completionFlag) {
                console.log(`任务已经完成: ${i.assignmentName}`)
            }
            else if (i.assignmentName == '抓抓机') {
                lotteryId = i.encryptAssignmentId
            }
            else {
                console.log(`正在运行: ${i.assignmentName}`)
                if (i.assignmentName = "完成浏览会场任务") {
                    let extraType = i.ext.extraType
                    // console.log(extraType)
                    if (this.haskey(i, `ext.${i.ext.extraType}`)) {
                        let extra = i.ext[extraType]
                        if (extraType == 'sign1') {
                        }
                        else if (extraType == 'assistTaskDetail') {
                        }
                        else {
                            for (let j of extra.slice(0, i.assignmentTimesLimit)) {
                                if (['shoppingActivity', 'productsInfo', 'browseShop', 'addCart'].includes(extraType)) {
                                    let fi = await this.algo.curl({
                                            'url': `https://api.m.jd.com/client.action`,
                                            'form': `appid=home-channel&functionId=hc.doTaskColorJsf.finishTask&body=${this.dumps(
                                                {
                                                    "encryptAssignmentId": i.encryptAssignmentId,
                                                    "itemId": j.itemId,
                                                    "encryptProjectId": "6pvWvhxzcHzeEiWsqP5oKgUbHEy"
                                                }
                                            )}`,
                                            cookie, algo: {
                                                appId: '4afaa'
                                            }
                                        }
                                    )
                                    if (this.haskey(fi, 'data.subCode', '1403')) {
                                        console.log(fi.data.msg)
                                        return
                                    }
                                    console.log("获得金币:", this.haskey(fi, 'data.rewardsDetail'))
                                    await this.wait(1000)
                                }
                            }
                        }
                    }
                }
                else {
                    console.log(i)
                }
            }
        }
        if (lotteryId) {
            console.log("抽奖中")
            for (let i of Array(20)) {
                let r = await this.algo.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=hc.doTaskColorJsf.exchangePrizes`,
                        'form': `appid=home-channel&functionId=hc.doTaskColorJsf.exchangePrizes&body={"encryptAssignmentId":"${lotteryId}","encryptProjectId":"6pvWvhxzcHzeEiWsqP5oKgUbHEy"}`,
                        cookie,
                        algo: {
                            appId: '4afaa'
                        }
                    }
                )
                await this.wait(1000)
                if (this.haskey(r, 'data.subCode', '103')) {
                    break
                }
                else if (this.haskey(r, 'code', 3)) {
                    console.log('未登陆')
                    return
                }
                console.log("获得金币:", this.haskey(r, 'data.rewardsDetail'))
            }
        }
    }
}

module.exports = Main;
