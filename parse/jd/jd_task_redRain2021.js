const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东小魔方红包雨"
        this.cron = "12 0,14,20 * * *"
        this.task = 'local'
        this.import = ['jdUrl']
        this.verify = 1
    }

    async prepare() {
        console.log(this.getDate(this.timestamp, '1'))
        let s = await this.curl({
                url: 'https://api.m.jd.com/client.action?functionId=xview2Config&clientVersion=11.3.2&build=98450&client=android&ef=1&ep=%7B%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22ts%22%3A1668133263098%2C%22ridx%22%3A-1%2C%22cipher%22%3A%7B%22area%22%3A%22CJvpCJYmCV81CNS4C182Ctq4Dm%3D%3D%22%2C%22d_model%22%3A%22Vu9RBUPCCNK%3D%22%2C%22wifiBssid%22%3A%22dW5hbw93bq%3D%3D%22%2C%22osVersion%22%3A%22CJK%3D%22%2C%22d_brand%22%3A%22IPVLV0VT%22%2C%22screen%22%3A%22CtS2DIenCNqm%22%2C%22uuid%22%3A%22DJruCNK5DtGmZNqmDQO2Zq%3D%3D%22%2C%22aid%22%3A%22DJruCNK5DtGmZNqmDQO2Zq%3D%3D%22%2C%22openudid%22%3A%22DJruCNK5DtGmZNqmDQO2Zq%3D%3D%22%7D%2C%22ciphertype%22%3A5%2C%22version%22%3A%221.2.0%22%2C%22appname%22%3A%22com.jingdong.app.mall%22%7D&st=1668148535443&sign=7dd658a66305f1485c5f38d77e02f194&sv=121',
                form: `lmt=0&body={"api-version":"1.1.0"}`,
            }
        )
        for (let i of this.haskey(s, 'data.targets')) {
            for (let j of this.haskey(i, 'layers')) {
                if (j.name.includes("红包雨")) {
                    let url1 = this.haskey(j, 'renderData.url')
                    let url2 = this.haskey(j, 'preDownLoadList.0.url')
                    let url
                    for (let k of [url1, url2]) {
                        if (k.includes('active')) {
                            url = k
                            break
                        }
                    }
                    if (!url && url1.includes('json')) {
                        try {
                            let ss = await this.curl({
                                    'url': url1,
                                }
                            )
                            for (let z of this.haskey(ss, 'tpl.elementList')) {
                                if (this.haskey(z, 'dataPath.url').includes('active')) {
                                    url = z.dataPath.url
                                    break
                                }
                            }
                        } catch (e) {
                        }
                    }
                    if (url) {
                        let html = await this.curl({
                                url,
                            }
                        )
                        let encryptProjectId = this.match(/encryptProjectId\\":\\"(\w+)\\"/, html)
                        let encryptAssignmentId = this.match(/encryptAssignmentId\\":\\"(\w+)\\"/, html)
                        if (encryptProjectId && encryptAssignmentId) {
                            let dict = {
                                encryptAssignmentId, encryptProjectId
                            }
                            let js = this.matchAll(/src="(.*?\.js)"/g, html).filter(d => d.includes('main.'))
                            if (js) {
                                for (let a of js) {
                                    let jsContent = await this.curl({
                                            'url': `https:${a}`,
                                        }
                                    )
                                    let sc = this.match(/"(ace[a-zA-Z]+\d+)"/, jsContent)
                                    if (sc) {
                                        dict.sourceCode = sc
                                        break
                                    }
                                }
                            }
                            if (this.haskey(j, 'rule.beginTime')) {
                                dict.beginTime = j.rule.beginTime
                                dict.endTime = j.rule.endTime
                                let timestamp = new Date().getTime()
                                if (timestamp>dict.endTime) {
                                    console.log("红包雨已经结束")
                                }
                                else if (timestamp>dict.beginTime) {
                                    this.shareCode.push(dict)
                                }
                                else {
                                    this.print(`${this.formatTime(dict.beginTime)}至${this.formatTime(dict.endTime)}有红包雨`)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    async main(p) {
        let cookie = p.cookie
        console.log("开始获取奖励...")
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?client=wh5&clientVersion=1.0.0&appid=redrain-2021&functionId=doInteractiveAssignment&body={"completionFlag":true,"sourceCode":"${p.inviter.sourceCode || 'acehby20210924'}","encryptProjectId":"${p.inviter.encryptProjectId}","encryptAssignmentId":"${p.inviter.encryptAssignmentId}"}`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(s, 'rewardsInfo.successRewards')) {
            let gifts = this.match(/"rewardName":"([^\"]+)"/g, this.dumps(s.rewardsInfo))
            if (gifts) {
                this.print(gifts, p.user)
            }
        }
        else {
            console.log(s)
        }
    }

    formatTime(t) {
        return new Date(t + 8 * 60 * 60 * 1000).toJSON().replace(/T/, " ").substr(0, 19)
    }
}

module.exports = Main;
