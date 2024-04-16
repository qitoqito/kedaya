const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东超市汪贝"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.interval = 2000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: "4.4",
            type: 'main'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let data = {}
        for (let o of Array(5)) {
            var html = await this.curl({
                    'url': `https://pro.m.jd.com/mall/active/3nh7HzSjYemGqAHSbktTrf8rrH8M/index.html?stath=20&navh=44&babelChannel=ttt1&tttparams=e51MJeyJnTGF0IjoiMjMuMTIzNCIsInNjYWxlIjoiMiIsInVuX2FyZWEiOiIxNl8xMjM0XzEyMzRfNDQ3NTAiLCJkTGF0IjoiIiwid2lkdGgiOiI3NTAiLCJwcnN0YXRlIjoiMCIsImFkZHJlc3NJZCI6IjU1NDcxMjM0OTQiLCJsYXQiOiIwLjAwMDAwMCIsInBvc0xhdCI6IjIzLjkxMjM0MyIsInBvc0xuZyI6IjExNy42MTIzNDUiLCJncHNfYXJlYSI6IjBfMF8wXzAiLCJsbmciOiIwLjAwMDAwMCIsInVlbXBzIjoiMC0xLTAiLCJnTG5nIjoiMTE3LjYxMjM0NSIsIm1vZGVsIjoiaVBob25lOCwxIn0=`,
                    cookie,
                    referer: 'https://pro.m.jd.com/mall/active/3nh7HzSjYemGqAHSbktTrf8rrH8M/index.html?stath=20&navh=44&babelChannel=ttt1&tttparams=e51MJeyJnTGF0IjoiMjMuMTIzNCIsInNjYWxlIjoiMiIsInVuX2FyZWEiOiIxNl8xMjM0XzEyMzRfNDQ3NTAiLCJkTGF0IjoiIiwid2lkdGgiOiI3NTAiLCJwcnN0YXRlIjoiMCIsImFkZHJlc3NJZCI6IjU1NDcxMjM0OTQiLCJsYXQiOiIwLjAwMDAwMCIsInBvc0xhdCI6IjIzLjkxMjM0MyIsInBvc0xuZyI6IjExNy42MTIzNDUiLCJncHNfYXJlYSI6IjBfMF8wXzAiLCJsbmciOiIwLjAwMDAwMCIsInVlbXBzIjoiMC0xLTAiLCJnTG5nIjoiMTE3LjYxMjM0NSIsIm1vZGVsIjoiaVBob25lOCwxIn0='
                }
            )
            try {
                data = (this.loads(this.match(/__api_data__\s*=\s*(.*?)\s*;\s*\n*window/, html)))
            } catch (e) {
                await this.wait(500)
            }
            if (this.dumps(data) != '{}') {
                break
            }
        }
        let signToken = this.match(/"signToken"\s*:\s*"(\w+)"/, html)
        if (signToken) {
            let sign = await this.algo.curl({
                    'url': `https://api.m.jd.com/atop_channel_sign_in`,
                    'form': `appid=jd-super-market&t=1713230766545&functionId=atop_channel_sign_in&client=m&uuid=de21c6604748f97dd3977153e51a47f4efdb9a47&body={"signToken":"${signToken}","channelFollowStatus":1,"bizCode":"cn_retail_jdsupermarket","scenario":"sign","babelChannel":"ttt1","isJdApp":"1","isWx":"0"}`,
                    cookie,
                    algo: {
                        appId: 'b8fc7'
                    }
                }
            )
            if (this.haskey(sign, 'success')) {
                console.log(`签到成功`)
                for (let i of sign.data.rewards) {
                    console.log(`获得: ${i.rewardDesc}`)
                }
            }
            else {
                console.log(this.haskey(sign, 'message') || sign)
            }
        }
        for (let ii in data) {
            if (ii == 'floorList') {
                for (let jj of data[ii]) {
                    if (jj.providerData) {
                        if (jj.providerData.data.floorData.name == '汪贝任务楼层') {
                            let floor = jj.providerData.data.floorData
                            for (let i of floor.items) {
                                if (i.completionFlag) {
                                    console.log(`任务已经完成: ${i.assignmentName}`)
                                }
                                else {
                                    console.log(`正在运行: ${i.assignmentName}`)
                                    let extraType = i.ext.extraType
                                    if (this.haskey(i, `ext.${i.ext.extraType}`)) {
                                        let extra = i.ext[extraType]
                                        try {
                                            for (let j of extra.slice(0, i.assignmentTimesLimit)) {
                                                if (['shoppingActivity', 'productsInfo', 'browseShop'].includes(extraType)) {
                                                    let d = await this.algo.curl({
                                                            'url': `https://api.m.jd.com/client.action?functionId=atop_channel_complete_task`,
                                                            'form': `appid=jd-super-market&body=${this.dumps(
                                                                {
                                                                    "bizCode": "cn_retail_jdsupermarket",
                                                                    "scenario": "sign",
                                                                    "encryptAssignmentId": i.encryptAssignmentId,
                                                                    "itemId": j.itemId || j.advId,
                                                                    "actionType": 1,
                                                                    "babelChannel": "ttt1",
                                                                    "isJdApp": "1",
                                                                    "isWx": "0"
                                                                }
                                                            )}&sign=11&t=1653132222710`,
                                                            cookie, algo: {
                                                                appId: '51113'
                                                            }
                                                        }
                                                    )
                                                    console.log(this.haskey(d, 'data.msg') || this.haskey(d, 'message'))
                                                    await this.wait((i.ext.waitDuration || 0) * 1000 + 500)
                                                }
                                                let s = await this.curl({
                                                        'url': `https://api.m.jd.com/client.action?functionId=atop_channel_complete_task`,
                                                        'form': `appid=jd-super-market&body=${this.dumps(
                                                            {
                                                                "bizCode": "cn_retail_jdsupermarket",
                                                                "scenario": "sign",
                                                                "encryptAssignmentId": i.encryptAssignmentId,
                                                                "itemId": j.itemId || j.advId,
                                                                "babelChannel": "ttt1",
                                                                "isJdApp": "1",
                                                                "isWx": "0"
                                                            }
                                                        )}&sign=11&t=1653132222710`,
                                                        cookie, algo: {
                                                            appId: '51113'
                                                        }
                                                    }
                                                )
                                                console.log(i.assignmentName, this.haskey(s, 'data.msg') || this.haskey(s, 'message'))
                                                if (this.haskey(s, 'message', '风险等级未通过')) {
                                                    return
                                                }
                                                if (this.haskey(s, 'message', '活动太火爆了')) {
                                                    break
                                                }
                                                if (this.haskey(s, 'data.doTaskRewardsInfo.successRewards')) {
                                                    for (let kkk in s.data.doTaskRewardsInfo.successRewards) {
                                                        for (let kkkk of s.data.doTaskRewardsInfo.successRewards[kkk]) {
                                                            console.log(`获得:`, kkkk.quantity, kkkk.rewardName)
                                                        }
                                                    }
                                                }
                                                await this.wait(1000)
                                            }
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }
                                    else {
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    async body(params) {
        let b = {
            "extParam": {
                "forceBot": "1",
                "businessData": {},
                "signStr": "-1",
                "sceneid": "babel_4RYbb8NtVAegmT35SuM2N3KKYLWt"
            },
            "activity_id": "4RYbb8NtVAegmT35SuM2N3KKYLWt",
            "template_id": "00035605",
            "floor_id": "101674850",
            "enc": "082F6E6EB76A8CBEE15FCF7E92519D4A0C14A052EDB9C9248A0F4121699403D36C35C158EFB65C32311DCE62FF076E717D80B5322FC0FC3B1D3CA22644BC685E"
        }
        return {...b, ...params}
    }
}

module.exports = Main;
