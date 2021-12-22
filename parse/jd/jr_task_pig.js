const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东金融养猪"
        this.cron = "41 1,5,6-23 * * *"
        this.task = 'local'
        // this.thread = 2
    }

    async main(p) {
        let cookie = p.cookie
        let s = await this.curl({
            url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetLogin',
            form: 'reqData={"source":2,"channelLV":"juheye","riskDeviceParam":"{}"}',
            cookie: p.cookie
        })
        this.assert(this.haskey(s, 'resultData.resultData.hasPig'), `${p.user} 没有小猪猪`)
        if (this.haskey(s, 'resultData.resultData.wishAward')) {
            let reward = s.resultData.resultData.wishAward.name;
            console.log(p.user, "可兑换: ", reward)
            this.notices(`${reward}可以兑换了`, p.user)
        }
        if (new Date().getHours()<8) {
            let s1 = await this.curl({
                url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetSignIndex',
                form: 'reqData={"source":2,"channelLV":"juheye","riskDeviceParam":"{}"}',
                cookie
            })
            let day = this.haskey(s1, 'resultData.resultData.today')
            if (!this.haskey(s1, 'resultData.resultData.sign')) {
                let s = await this.curl({
                    url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetSignOne',
                    form: `reqData={"source":2,"no":${day},"channelLV":"","riskDeviceParam":"{}"}`,
                    cookie
                })
            }
            else {
                console.log(p.user, `第${day}天签到`)
            }
            let s2 = await this.curl({
                url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetMissionList',
                form: 'reqData={"source":2,"channelLV":"","riskDeviceParam":"{}"}',
                cookie
            })
            for (let i of this.haskey(s2, 'resultData.resultData.missions')) {
                // console.log(i)
                if (i.status == 3) {
                    console.log("去做任务:", i.missionName)
                    let query = i.url ? this.urlParse(i.url).query : {}
                    await this.curl({
                        'url': 'https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetDoMission?_=1625996333719',
                        'form': `reqData={"source":2,"mid":"${i.mid}","channelLV":"","riskDeviceParam":"{}"}`
                    })
                    if (query.readTime) {
                        let s3 = await this.curl({
                            url: `https://ms.jr.jd.com/gw/generic/mission/h5/m/queryMissionReceiveAfterStatus?reqData={"missionId":"${query.missionId}"}`,
                            cookie
                        })
                        console.log(s3.resultMsg)
                        await this.wait(query.readTime * 1000)
                        let s4 = await this.curl({
                            url: `https://ms.jr.jd.com/gw/generic/mission/h5/m/finishReadMission?reqData={"missionId":"${query.missionId}","readTime":${query.readTime}}`,
                            cookie
                        })
                        console.log(s4.resultMsg)
                        await this.wait(2000)
                    }
                    else if (query.juid) {
                        let s3 = await this.curl(
                            {
                                url: `https://ms.jr.jd.com/gw/generic/mission/h5/m/getJumpInfo?reqData={"juid":"${query.juid}"}`,
                                cookie
                            }
                        )
                        console.log(s3.resultMsg)
                        await this.wait(5000)
                    }
                    let re = await this.curl({
                            'url': `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetDoMission`,
                            'form': `reqData={"source":2,"mid":"${i.mid}","channelLV":"","riskDeviceParam":"{}"}`,
                            cookie
                        }
                    )
                }
                else if (i.status == 4) {
                    let re = await this.curl({
                            'url': `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetDoMission`,
                            'form': `reqData={"source":2,"mid":"${i.mid}","channelLV":"","riskDeviceParam":"{}"}`,
                            cookie
                        }
                    )
                    console.log(i.missionName, this.haskey(re, 'resultData.resultData.buttonText') || '领取失败')
                }
            }
        }
        // 开箱
        let kx = await this.curl({
                'url': `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetOpenBox`,
                'form': `reqData={"source":2,"type":1,"t":${new Date().getTime()},"channelLV":"","riskDeviceParam":"{}"}`,
                cookie
            }
        )
        // 抽奖
        let cj = await this.curl({
                'url': `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetLotteryPlay?_=1638626598176`,
                'form': `reqData={"type":0,"validation":"","channelLV":"","source":2,"riskDeviceParam":"{}"}`,
                cookie
            }
        )
        console.log(p.user, '抽奖', this.haskey(cj, 'resultData.resultData.award') || '啥都没有')
        let f = await this.curl({
                'url': `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetUserBag?_=1638625553273`,
                'form': `reqData={"category":"1001","channelLV":"","source":2,"riskDeviceParam":"{}"}`,
                cookie
            }
        )
        for (let i of this.haskey(f, 'resultData.resultData.goods')) {
            if (i.count>19) {
                // 每项最多喂食十次
                for (let k = 0; k<Math.min((i.count / 20), 10); k++) {
                    let fo = await this.curl({
                            'url': `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetAddFood?_=1638626147115`,
                            'form': `reqData={"skuId":"${i.sku}","channelLV":"","source":2,"riskDeviceParam":"{}"}`,
                            cookie
                        }
                    )
                    if (!fo?.resultData?.resultData) {
                        break
                    }
                    console.log(`正在喂食: ${i.goodsName} ,等待12秒进行下一轮喂食`)
                    await this.wait(12500)
                }
            }
            else {
                console.log("没有足够的粮食来喂小猪猪", i.goodsName)
            }
        }
    }
}

module.exports = Main;
