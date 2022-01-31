const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东春晚"
        this.cron = ["10 20 * * *", "38 20 * * *", "09 21 * * *", "43 21 * * *", "21 22 * * *", "16 23 * * *", "23 00 * * *"]
        this.help = 2
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            'appId': '47ab8',
            'type': "app"
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api-x.m.jd.com/?functionId=party_lottery&functionId=party_lottery&body={"type":"0","uuid":"fReJhKXjes6SZ8fD","sv":"e0bc95694496e7aef24f95536468def8dcbcd85c89545ebf8a2a2f2e3bd8e646","sk":"ROsl43KfAjf9VfcYY1VhD2EROwZEURFTWXJVgMSdI-5FeCmrf_1XVF0O5_DJhtgPXyDw1ztYFt5o0LBn0fi6XdjF14w="}&client=wh5&clientVersion=1.0.0&appid=spring_h5&t=1643631185138`,
                cookie
            }
        )
        for (let i of this.haskey(s, 'data.result.award')) {
            if (i.type == 1) {
                console.log(p.user, `获得红包: ${i.amount}`)
                this.notices(`获得红包: ${i.amount}`, p.user)
            }
            else if (i.type == 2) {
                console.log(p.user, i.useRange)
                this.notices(i.useRange, p.user)
            }
            else {
                console.log(p.user, this.dumps(i))
                // this.notices(this.dumps(i), p.user)
            }
        }
        for (let i = 0; i<3; i++) {
            let ss = await this.curl({
                    'url': `https://api-x.m.jd.com/?functionId=party_lottery&functionId=party_lottery&body={"type":"1","uuid":"fReJhKXjes6SZ8fD","sv":"e0bc95694496e7aef24f95536468def8dcbcd85c89545ebf8a2a2f2e3bd8e646","sk":"ROsl43KfAjf9VfcYY1VhD2EROwZEURFTWXJVgMSdI-5FeCmrf_1XVF0O5_DJhtgPXyDw1ztYFt5o0LBn0fi6XdjF14w="}&client=wh5&clientVersion=1.0.0&appid=spring_h5&t=1643631185138`,
                    cookie
                }
            )
            console.log(this.haskey(ss, 'data.result'))
        }
    }
}

module.exports = Main;
