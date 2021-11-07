const Common = require("./extractor/common");

class Work extends Common {
    constructor() {
        super()
        this.title = "京东invokeKey获取"
        this.cron = "50 7,15,23 * * *"
        this.import = ['fs']
        this.jump = 1
        this.task = 'test'
    }

    async prepare() {
        let html = await this.curl('https://prodev.m.jd.com/mall/active/2tZssTgnQsiUqhmg5ooLSHY9XSeN/index.html')
        let js = "https://storage.360buyimg.com/" + this.match(/"htmlSourceUrl":"([^\"]+)"/, html)
        let jsContent = await this.curl(js)
        let index = 'https:' + this.match(/src="([^\"]+)"/, jsContent)
        let indexContent = await this.curl(index)
        let invokeKey = this.match(/\w+\s*=\s*\w+\(\d+\)\s*,\s*\w+\s*=\s*"(\w{16})"/, indexContent)
        console.log(invokeKey)
        if (invokeKey) {
            let config = {}
            try {
                config = require(this.dirname + "/config/config")
            } catch (e) {
            }
            config['jd_invokeKey'] = invokeKey
            let data = `module.exports = ${JSON.stringify(config, null, 4)}`
            this.modules.fs.writeFile(this.dirname + "/config/config.js", data, function(err, data) {
                if (err) {
                    throw err;
                }
                console.log("invokeKey写入成功")
            })
            this.notices(invokeKey, 'invokeKey')
        }
        else {
            console.log("invokeKey获取失败")
            this.notices('此次没有获取到', 'invokeKey')
        }
    }
}

!(async () => {
    let Jd = new Work()
    await Jd.init()
})().catch((e) => {
    console.log(e.message)
})
