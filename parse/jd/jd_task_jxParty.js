const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "618刮刮红包"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: 'main',
            version: '4.7',
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=jx_party_home&appid=signed_wh5&body={"areaInfo":"16_1234_1234_45678","refresh":null,"skuId":null}&client=wh5&uuid=35a6731dbb722f7951823b78f2534847d7197180&clientVersion=1.0.0`,
                cookie,
                algo: {
                    appId: 'a525b'
                }
            }
        )
        var remainTimes = this.haskey(home, 'data.result.round.remainTimes') || 0
        let list = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=jx_party_task_list&appid=signed_wh5&body={}`,
                cookie
            }
        )
        for (let i of this.haskey(list, 'data.result.taskList')) {
            if (i.completionFlag) {
                console.log(`任务已经完成: ${i.assignmentName}`)
            }
            else {
                console.log(`正在运行: ${i.assignmentName}`)
                let extraType = i.ext.extraType
                if (this.haskey(i, `ext.${i.ext.extraType}`)) {
                    let extra = i.ext[extraType]
                    if (extraType == 'order') {
                    }
                    else {
                        for (let j of extra) {
                            let s = await this.algo.curl({
                                    'url': `https://api.m.jd.com/`,
                                    'form': `functionId=jx_party_do_task&appid=signed_wh5&body={"itemId":"${j.advId || j.itemId}","actionType":1,"taskType":${i.assignmentType},"assignmentId":"${i.encryptAssignmentId}","extraType":"${extraType}"}`,
                                    cookie,
                                    algo: {
                                        'appId': 'a525b'
                                    }
                                }
                            )
                            if (this.haskey(s, 'data.bizCode', 103)) {
                                break
                            }
                            if (i.ext.waitDuration) {
                                console.log(`等待: ${i.ext.waitDuration}s`)
                                await this.wait(i.ext.waitDuration * 1000)
                                s = await this.algo.curl({
                                        'url': `https://api.m.jd.com/`,
                                        'form': `functionId=jx_party_do_task&appid=signed_wh5&body={"itemId":"${j.advId || j.itemId}","actionType":0,"taskType":${i.assignmentType},"assignmentId":"${i.encryptAssignmentId}","extraType":"${extraType}"}`,
                                        cookie,
                                        algo: {
                                            'appId': 'a525b'
                                        }
                                    }
                                )
                                if (this.haskey(s, 'data.result.remainTimes')) {
                                    console.log("任务完成,当前可以抽奖次数:", s.data.result.remainTimes)
                                    remainTimes = s.data.result.remainTimes
                                }
                                else {
                                    console.log(s)
                                }
                            }
                            else {
                                console.log(i.assignmentName, this.haskey(s, 'data.result'))
                            }
                        }
                    }
                }
            }
        }
        console.log("正在抽奖,当前可以抽奖次数:", remainTimes)
        for (let i = 0; i<remainTimes; i++) {
            console.log("正在抽奖...")
            let lottery = await this.algo.curl({
                    'url': `https://api.m.jd.com/`,
                    'form': `functionId=jx_party_lottery&appid=signed_wh5&body={"qdPageId":"MO-J2011-1","mdClickId":"Babel_dev_other_11lotterystart"}&client=wh5&uuid=35a6731dbb722f7951823b78f2534847d7197180&clientVersion=1.0.0&d_model=0-2-999&osVersion=15.1.1`,
                    cookie,
                    algo: {
                        appId: "a525b"
                    }
                }
            )
            let gifts = (this.haskey(lottery, 'data.result.awardList')) || []
            for (let gift of gifts) {
                if (gift.type == 1) {
                    console.log(`卡片: ${gift.blessingsStr}`)
                }
                else if ([8, 14].includes(gift.type)) {
                    this.print(`红包: ${gift.value}`, p.user)
                }
                else if ([7, 3].includes(gift.type)) {
                    console.log(`优惠券: ${gift.name}`)
                }
                else if (gift.type) {
                    this.print(`类型${gift.type}: ${gift.name}`, p.user)
                }
                else {
                    console.log(gift)
                }
            }
            await this.wait(2000)
        }
        for (let i of Array(30)) {
            let d = await this.algo.curl({
                    'url': `https://api.m.jd.com/api`,
                    'form': `functionId=superRedBagDraw&body={"linkId":"aE-1vg6_no2csxgXFuv3Kg"}&t=1716982351811&appid=activity_platform_se&client=ios&clientVersion=12.3.1&loginType=2&loginWQBiz=wegame&uuid=de21c6604748f97dd3977153e51a47f4efdb9a47&build=168960&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=-1&cthr=1`,
                    cookie,
                    algo: {
                        appId: '89cfe'
                    }
                }
            )
            if (!this.haskey(d, 'data.shakeLeftTime')) {
                break
            }
            if (!d.data.prizeDrawVo) {
                break
            }
            if (this.haskey(d, 'data.prizeDrawVo.prizeDesc')) {
                console.log("获得:", d.data.prizeDrawVo.prizeDesc, d.data.prizeDrawVo.amount)
            }
            else {
                console.log(d.data.prizeDrawVo)
            }
            await this.wait(2000)
        }
        let receive = await this.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=jx_party_mapalbum_receive&appid=signed_wh5&body={}`,
                cookie
            }
        )
        if (this.haskey(receive, 'data.result.value')) {
            this.print(`红包: ${receive.data.result.value}`, p.user)
        }
        else {
            console.log(this.haskey(receive, 'data.bizMsg') || receive)
        }
    }
}

module.exports = Main;
