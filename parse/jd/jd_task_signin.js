const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东整合签到"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 2)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo', 'logBill']
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
                // "母婴馆": {
                //     "encryptProjectId": "S2PFi6Npq9yRgDHRjegZpGRCrVu",
                //     "encryptAssignmentId": "4DRn3vqrhUxF6cH1qtotLWHM9sLM"
                // },
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
                },
                "机车装备管": {
                    "encryptProjectId": "2KFZNTJxMgZyFRaTHnDJk14qtsPL",
                    "encryptAssignmentId": "2Yb6YbUd11jj1DGP2Y9dhqCfW5AD"
                },
                "京东电器": {
                    "encryptProjectId": "3ynRTVVTYz8QbESaXbu8i3XC3TLo",
                    "encryptAssignmentId": "2pv61FSzJ9QZTiQ3r5HSigG87aAM"
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
    }
}

module.exports = Main;
