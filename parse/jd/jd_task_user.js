const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东用户信息获取"
        this.cron = "6 6 6 6 6"
        this.help = 2
        this.task = 'all'
        // this.thread = 6
        this.import = ['fs']
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
            'url': `https://kai.jd.com/client?appId=applet_jpass&body=%257B%257D&functionId=UserExportService.getUserInfo&requestId=0.72076678870461081641259143802&sign=431fa578b3a6c82c50b37ed7e6406973&_s=2&_i=55`,
            cookie
        })
        if (this.haskey(s, 'data.data')) {
            console.log("数据获取成功...")
        }
        else {
            console.log("数据获取失败...")
        }
        let pin = this.userPin(cookie)
        let custom = this.getValue('custom')
        let keys = [...custom, ...['id', 'msgWhite', 'msgBlack', 'send', 'wskey', 'verify', 'nickName', 'phone']]
        let dict = {}
        let userDict = this.userDict.hasOwnProperty(pin) ? this.userDict[pin] : {}
        for (let i of keys) {
            if (userDict[i]) {
                dict[i] = userDict[i]
            }
            else {
                dict[i] = ''
            }
        }
        try {
            this.dict[pin] = {
                ...userDict,
                ...dict,
                ...{
                    pin,
                    userName: s.data.data.userName || s.data.data.pin,
                    index: p.index.toString(),
                    phone: s.data.data.mobile,
                    score: s.data.data.score,
                },
            }
        } catch {
            let pin = this.userPin(cookie)
            this.dict[pin] = {
                ...userDict,
                ...{
                    pin,
                    userName: pin,
                    index: p.index.toString(),
                },
            }
        }
        console.log(this.dict[pin])
        this.dict['message'] = {
            "userName": "message",
            "nickName": "框架通知",
            "index": "999998",
        }
    }

    async extra() {
        if (this.dumps(this.dict) != '{}') {
            for (let i in this.userDict) {
                if (!this.dict[i]) {
                    this.dict[i] = {...this.userDict[i], ...{index: '', display: ''}}
                }
            }
            let data = `module.exports = ${JSON.stringify(this.dict, null, 4)}`
            this.modules.fs.writeFile(this.dirname + "/config/jdUser.js", data, function(err, data) {
                if (err) {
                    throw err;
                }
                console.log("user写入成功")
            })
            this.notices("user写入成功")
        }
    }
}

module.exports = Main;
