const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东invokeKey获取"
        this.cron = "50 7,15,23 * * *"
        this.import = ['jsdom', 'fs']
        this.jump = 1
        this.task = 'test'
    }

    async prepare() {
        let html = await this.curl('https://prodev.m.jd.com/mall/active/2tZssTgnQsiUqhmg5ooLSHY9XSeN/index.html')
        let js = "https://storage.360buyimg.com/" + this.match(/"htmlSourceUrl":"([^\"]+)"/, html)
        let jsContent = await this.curl(js)
        let index = 'https:' + this.match(/src="([^\"]+)"/, jsContent)
        let indexContent = await this.curl(index)
        let invokeKey = this.match([/\w+\s*=\s*\w+\(\d+\)\s*,\s*\w+\s*=\s*"(\w{16})"/, /invokeKey\s*(?:=|:)\s*(?:"|')(\w+)(?:"|')/], indexContent)
        if (invokeKey) {
            console.log('invokeKey', invokeKey)
            await this.curl("https://api.m.jd.com/client.action?functionId=cash_sign&body={%22breakReward%22:0,%22inviteCode%22:null,%22remind%22:0,%22type%22:0}&uuid=2949fdff1577e6359f5&client=apple&clientVersion=10.0.10&st=1629987027624&sv=102&sign=6f5fe3887da6c0c233bd01eed7d572b1&loginType=4")
            let config = {}
            try {
                config = require(this.dirname + "/config/jd")
            } catch (e) {
            }
            config['jd_invokeKey'] = invokeKey
            let data = `module.exports = ${JSON.stringify(config, null, 4)}`
            this.modules.fs.writeFile(this.dirname + "/config/jd.js", data, function(err, data) {
                if (err) {
                    throw err;
                }
                console.log("invokeKey写入成功")
            })
            this.notices(invokeKey, 'invokeKey')
        }
        else {
            console.log("没有获取到invokeKey")
        }
    }
}

module.exports = Main;
