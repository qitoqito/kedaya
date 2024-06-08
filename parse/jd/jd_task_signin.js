const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东整合签到"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 2)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo', 'jdFinger']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: '4.4',
            type: 'main'
        })
        this.dict = {
            'doInteractiveAssignment': {
                '五金城': {
                    "encryptProjectId": "237YgcQ2GCm64t7vfP528Run4P4q",
                    "encryptAssignmentId": "3WRvrfo6qq8BTRQzLJSRgyBGaRr3",
                },
                "图书馆": {
                    "encryptProjectId": "Yw2VALxCy4TAP3HHR774oWxc35T",
                    "encryptAssignmentId": "28PunYRnW3s9CBvJSUUcvdUzkf9r"
                },
                "母婴馆": {
                    "encryptProjectId": "S2PFi6Npq9yRgDHRjegZpGRCrVu",
                    "encryptAssignmentId": "4DRn3vqrhUxF6cH1qtotLWHM9sLM"
                },
                '拍拍二手': {
                    "encryptProjectId": "3xxdfoHPKSyuwryhhEX8en1ZAT6A",
                    "encryptAssignmentId": "csYHwSFWAjtcuxyYXpZYSecsH6P"
                },
                '签到瓜分京豆': {
                    "encryptProjectId": "48mbNna587mvUybMYiVacWbLV2kY",
                    "encryptAssignmentId": "3MbhW1z98MGVgxKCxMwCtgXXCcTz"
                },
                "折叠礼遇记": {
                    "encryptProjectId": "SYKGrr9V5hmxRCVrBQbWK6MFPSM",
                    "encryptAssignmentId": "HpqxPoee6MkPnznnQYMR61bMnDe"
                },
                "轻松低价买好书": {
                    "encryptProjectId": "4DwxF3pQ2czkBVv9LYM1cqVT8DdR",
                    "encryptAssignmentId": "3CgKGfhtZrXH9bDWraPb2CGaDgFY"
                },
                "服饰美妆": {
                    "encryptProjectId": "oRnJWzu84htA5EMrgQohdtjUp8b",
                    "encryptAssignmentId": "gm9yNeFrcD9KLtZAV1gZQfNX3ux",
                    "sourceCode": "ace20230504MZPD"
                }
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let gifts = []
        console.log("正在签到: 医药馆")
        let a = await this.algo.curl({
                'url': `https://api.m.jd.com/api`,
                'form': `appid=laputa&functionId=jdh_laputa_handleSoaRequest&body={"methodName":"handleBeanInfo2595","functionId":"sign","osName":"feedProduct","appId":"807635028594484682708c54f69b1217","version":"1","deviceNo":"9abbe1bd-252f-40f8-a42f-ba4be28244f7","handleType":"sign","encryptProjectId":"3vRVP84ukngNhNYVDQTXuQQzJjit","encryptAssignmentIds":["3LbDQhTDsr5n7wL4XPyubMvEuUR3"],"deviceType":1,"lng":0,"lat":0,"itemId":"1"}`,
                cookie
            }
        )
        if (this.haskey(a, 'data.signResultDTO.extQuantity')) {
            console.log(a.data.signResultDTO.rewardMsg)
            gifts.push(a.data.signResultDTO.rewardMsg)
        }
        for (let i in this.dict) {
            if (i == 'doInteractiveAssignment') {
                for (let j in this.dict[i]) {
                    console.log(`正在签到: ${j}`)
                    let dd = this.dict[i][j]
                    let b = await this.algo.curl({
                            'url': `https://api.m.jd.com/client.action?functionId=doInteractiveAssignment`,
                            form: `appid=babelh5&body={"sourceCode":"${dd.sourceCode || 'acetttsign'}","encryptProjectId":"${dd.encryptProjectId}","encryptAssignmentId":"${dd.encryptAssignmentId}","completionFlag":true,"itemId":"1","extParam":{"forceBot":"1","businessData":{},"signStr":"-1","sceneid":"babel_4RYbb8NtVAegmT35SuM2N3KKYLWt"},"activity_id":"4RYbb8NtVAegmT35SuM2N3KKYLWt","template_id":"00035605","floor_id":"101674850","enc":"082F6E6EB76A8CBEE15FCF7E92519D4A0C14A052EDB9C9248A0F4121699403D36C35C158EFB65C32311DCE62FF076E717D80B5322FC0FC3B1D3CA22644BC685E"}&sign=11&t=1710422476977`,
                            cookie,
                            algo: {
                                appId: 'e2224'
                            }
                        }
                    )
                    if (this.haskey(b, 'rewardsInfo.successRewards')) {
                        for (let kk in b.rewardsInfo.successRewards) {
                            for (let kkk of b.rewardsInfo.successRewards[kk]) {
                                let text = `${kkk.rewardName}: ${kkk.quantity}`
                                console.log(text)
                                gifts.push(text)
                            }
                        }
                    }
                    else {
                        console.log(this.haskey(b, 'msg') || b)
                        if (this.haskey(b, 'msg', '未登录')) {
                            break
                        }
                    }
                    await this.wait(1000)
                }
            }
        }
        let ua = `jdapp;iPhone;12.3.5;;;M/5.0;appBuild/169076;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DtLwCNSyDwY2D2TvDzcmCNduD2HtDJqnDzqmCWUyENTuZQOnCtOnZG%3D%3D%22%2C%22sv%22%3A%22CJUkDs4n%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1717828905%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;`
        let array = this.modules.jdFinger(
            {
                'useragent': ua,
                cookie
            })
        let f = await this.curl({
            'url': `https://gia.jd.com/fcf.html?a=${array.a}`,
            'form': `d=${array.d}`,
            cookie
        })
        let eid = this.match(/"eid"\s*:\s*"([^\"]+)"/, f)
        let sign = await this.curl({
                'url': `https://sendbeans.jd.com/api/turncard/chat/sign?turnTableId=1544&shopId=1000017162&fp=${this.md5(p.cookie)}&eid=${eid}`,
                referer: 'https://sendbeans.jd.com/jump/index/',
                ua,
                cookie: p.cookie
            }
        )
        if (this.haskey(sign, 'data.jdBeanQuantity')) {
            gifts.push(`京豆: ${sign.data.jdBeanQuantity}`)
        }
        else {
            console.log(this.haskey(sign, 'errorMessage') || sign)
        }
        if (gifts.length) {
            this.notices(gifts.join("\n"), p.user)
        }
    }
}

module.exports = Main;
