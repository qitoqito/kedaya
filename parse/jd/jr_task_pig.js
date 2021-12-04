const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东金融养猪"
        this.cron = "41 */4 * * *"
    }

    async main(p) {
        let cookie = p.cookie
 
        let s = await this.curl({
            url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetLogin',
            form: 'reqData={"source":2,"channelLV":"juheye","riskDeviceParam":"{}"}',
            cookie: p.cookie
        })
        this.assert(this.haskey(s, 'resultData.resultData.hasPig'), "没有小猪猪")
        if (this.haskey(s, 'resultData.resultData.wishAward')) {
            let reward = s.resultData.resultData.wishAward.name;
            console.log("可兑换: ", reward)
            this.notices(`${reward}可以兑换了`, p.user)
        }
        let s1 = await this.curl({
            url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetSignIndex',
            form: 'reqData={"source":2,"channelLV":"juheye","riskDeviceParam":"{}"}',
            cookie
        })
        let day = this.haskey(s1, 'resultData.resultData.today')
        if (this.haskey(s1, 'resultData.resultData.sign')) {
            await this.curl({
                url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetSignOne',
                form: `reqData={"source":2,"channelLV":"juheye","riskDeviceParam":"{}","no":${day}`,
                cookie
            })
        }
        else {
            console.log(`第${day}天签到`)
        }
        let s2 = await this.curl({
            url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetMissionList',
            form: 'reqData={"source":2,"channelLV":"","riskDeviceParam":"{}"}',
            cookie
        })
        for (let z of Array(2)) {
            for (let i of this.haskey(s2, 'resultData.resultData.missions')) {
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
                }
            }
        }
    }
}

module
    .exports = Main;
