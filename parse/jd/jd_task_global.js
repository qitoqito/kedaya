const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东国际"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.readme = `此活动需要验证sign,需要自己docker部署sign算法\n然后添加全局变量:QITOQITO_JDSIGN=sign路径`
        this.import = ['jdSign']
    }

    async prepare() {
        this.sign = new this.modules.jdSign()
        if (!this.sign.access) {
            console.log(`此活动需要验证sign,需要自己docker部署sign算法\n然后添加全局变量:QITOQITO_JDSIGN=signUrl路径\n如果已经部署过 JD_SIGN_API, JD_SIGN_KRAPI 应该能正常使用`)
            this.jump = 1
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let enc1 = this.md5("apple" + this.userPin(p.cookie) + "taskRun6531")
        let enc2 = this.md5("apple" + this.userPin(p.cookie) + "receiveReward6531")
        let enc3 = this.md5("apple" + this.userPin(p.cookie) + "signInWithPrize6531")
        let sign = await this.sign.jdCurl({
                'url': `https://api.m.jd.com/client.action?functionId=signInWithPrize`,
                'form': `body={"floorId":"83596522","timestamp":"${enc3}"}&build=169063&client=apple&clientVersion=12.3.4&&functionId=signInWithPrize`,
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
                    'form': `body={"floorId":"83596522","timestamp":"${enc3}"}&build=169063&client=apple&clientVersion=12.3.4&&functionId=signInWithPrize`,
                    cookie
                }
            )
        }
        if (this.haskey(sign, 'result.beanCount')) {
            this.print(`获得签到京豆${sign.result.beanCount}`, p.user)
        }
        else {
            console.log(this.haskey(sign, 'result.signInText') || sign)
        }
        for (let i of Array(5)) {
            let t = await this.sign.jdCurl({
                    'url': `https://api.m.jd.com/client.action?functionId=taskRun`,
                    'form': `body={"floatId":"83596525","timestamp":"${enc1}"}&build=169063&client=apple&clientVersion=12.3.4&functionId=taskRun`,
                    cookie
                }
            )
            if (this.haskey(t, 'result.code') == '0') {
                await this.wait(2000)
                let r = await this.sign.jdCurl({
                        'url': `https://api.m.jd.com/client.action?functionId=receiveReward`,
                        'form': `body={"floatId":"83596525","timestamp":"${enc2}"}&build=169063&client=apple&clientVersion=12.3.4&functionId=receiveReward`,
                        cookie
                    }
                )
                if (this.haskey(r, 'result.code') == '0') {
                    this.print(r.result.msg, p.user)
                }
                else {
                    console.log(r)
                }
                await this.wait(8000)
            }
            else {
                console.log(this.haskey(t, 'result.msg') || t)
                break
            }
        }
    }
}

module.exports = Main;
