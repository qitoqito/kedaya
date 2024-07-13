const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东国际"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.readme = `此活动需要验证sign,需要自己docker部署sign算法\n然后添加全局变量:QITOQITO_JDSIGN=sign路径`
        this.import = ['jdSign']
        this.delay = 1000
        this.interval = 5000
    }

    async prepare() {
        this.sign = new this.modules.jdSign()
        if (!this.sign.access) {
            console.log(`此活动需要验证sign,需要自己docker部署sign算法\n然后添加全局变量:QITOQITO_JDSIGN=signUrl路径\n如果已经部署过 JD_SIGN_API, JD_SIGN_KRAPI 应该能正常使用`)
            this.jump = 1
        }
        let awardId = 83596858
        let taskId = null
        let signId = 83596856
        let layout = await this.sign.jdCurl({
                'url': `https://api.m.jd.com/client.action?functionId=queryLayout`,
                'form': `avifSupport=1&body={"beginTime":"","applicationId":"11"}&build=169370&client=apple&clientVersion=13.1.0&d_brand=apple`,
            }
        )
        for (let i of this.haskey(layout, 'result.navigationPage.tabPage.floors')) {
            if (i.floorType == "BROWSE_AWARDS_WIDGET") {
                awardId = i.floorId
            }
            if (i.floorType == "TASK_FLOAT") {
                taskId = i.floorId
            }
            if (i.floorType == "SIGN_IN_GAME_WIDGET") {
                signId = i.floorId
            }
        }
        this.dict = {
            awardId,
            taskId,
            signId
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let salt = this.globalSalt
        let pin = this.userPin(p.cookie)
        let enc1 = this.md5("apple" + pin + "taskRun" + salt)
        let enc2 = this.md5("apple" + pin + "receiveReward" + salt)
        let enc3 = this.md5("apple" + pin + "signInWithPrize" + salt)
        let token = `${new Date().getTime()}1`
        let enc4 = this.md5("apple" + pin + "globalTask" + salt + token)
        let sign = await this.sign.jdCurl({
                'url': `https://api.m.jd.com/client.action?functionId=signInWithPrize`,
                'form': `body={"floorId":"${this.dict.signId}","timestamp":"${enc3}"}&build=169063&client=apple&clientVersion=12.3.4&&functionId=signInWithPrize`,
                cookie
            }
        )
        if ((this.haskey(sign, 'result.signInText') || '').includes('关注')) {
            let follow = await this.sign.jdCurl({
                    'url': `https://api.m.jd.com/client.action?functionId=userFollow`,
                    'form': `body={"businessId":"1","type":"1","themeId":"331","uuid":""}&build=169076&client=apple&clientVersion=12.3.4&functionId=userFollow`,
                    cookie
                }
            )
            sign = await this.sign.jdCurl({
                    'url': `https://api.m.jd.com/client.action?functionId=signInWithPrize`,
                    'form': `body={"floorId":"${this.dict.signId}","timestamp":"${enc3}"}&build=169063&client=apple&clientVersion=12.3.4&&functionId=signInWithPrize`,
                    cookie
                }
            )
        }
        if (this.haskey(sign, 'result.beanCount')) {
            this.print(`获得签到京豆${sign.result.beanCount}`, p.user)
        }
        else {
            console.log('签到:', this.haskey(sign, 'result.signInText') || sign)
        }
        // if (taskId) {
        let list = await this.sign.jdCurl({
                'url': `https://api.m.jd.com/client.action?functionId=globalMainList`,
                'form': `avifSupport=0&body={"floorId":"83596864"}&build=169381&client=apple&clientVersion=13.1.1`,
                cookie
            }
        )
        for (let i of this.haskey(list, 'result.datas')) {
            if (i.status == '1') {
                console.log("任务已完成:", i.name)
            }
            else {
                for (let j of this.haskey(i, 'items')) {
                    if (j.status == '1') {
                        console.log("任务已完成:", j.name)
                    }
                    else {
                        console.log("正在浏览:", j.name)
                        for (let _ of Array(j.totalTimes - j.currentTimes)) {
                            if (j.name.includes("商品")) {
                                var s = await this.sign.jdCurl({
                                        'url': `https://api.m.jd.com/client.action?functionId=globalTask`,
                                        'form': `avifSupport=0&body={"timestamp":"${enc4}","taskId":"${j.taskId}","type":"${j.type}","token":"${token}","floorId":"83596864","skuId":"${this.rand(3333333, 3336666)}"}&build=169381&client=apple&clientVersion=13.1.1`,
                                        cookie
                                    }
                                )
                            }
                            else {
                                var s = await this.sign.jdCurl({
                                        'url': `https://api.m.jd.com/client.action?functionId=globalTask`,
                                        'form': `avifSupport=0&body={"timestamp":"${enc4}","taskId":"${j.taskId}","type":"${j.type}","token":"${token}","floorId":"83596864"}&build=169381&client=apple&clientVersion=13.1.1`,
                                        cookie
                                    }
                                )
                            }
                            console.log("正在完成:", this.haskey(s, 'result.currentTimes'))
                            let msg = this.haskey(s, 'result.msg') || ''
                            if (msg.includes('京豆')) {
                                this.print(msg, p.user)
                            }
                            if (this.haskey(s, 'code', '-1')) {
                                console.log(s.errorMsg)
                                break
                            }
                            await this.wait(3000)
                        }
                    }
                }
            }
        }
        // }
        for (let i of Array(8)) {
            let t = await this.sign.jdCurl({
                    'url': `https://api.m.jd.com/client.action?functionId=taskRun`,
                    'form': `body={"floatId":"${this.dict.awardId}","timestamp":"${enc1}"}&build=169063&client=apple&clientVersion=12.3.4&functionId=taskRun`,
                    cookie
                }
            )
            console.log(this.haskey(t, 'result.msg') || t)
            if (this.haskey(t, 'result.code') == '0') {
                await this.wait(2000)
                let r = await this.sign.jdCurl({
                        'url': `https://api.m.jd.com/client.action?functionId=receiveReward`,
                        'form': `body={"floatId":"${this.dict.awardId}","timestamp":"${enc2}"}&build=169063&client=apple&clientVersion=12.3.4&functionId=receiveReward`,
                        cookie
                    }
                )
                if (this.haskey(r, 'result.code') == '0' && r.result.msg.includes("获得")) {
                    this.print(r.result.msg, p.user)
                }
                else {
                    console.log(this.haskey(r, 'result.msg') || r)
                }
                await this.wait(15000)
            }
            else {
                console.log(this.haskey(t, 'result.msg') || t)
                break
            }
        }
    }
}

module.exports = Main;
