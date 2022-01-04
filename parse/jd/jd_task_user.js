const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东用户信息获取"
        this.cron = "12 22 * * *"
        this.help = 2
        this.task = 'all'
        this.thread = 6
        this.import = ['fs']
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://kai.jd.com/client?appId=applet_jpass&body=%257B%257D&functionId=UserExportService.getUserInfo&requestId=0.72076678870461081641259143802&sign=431fa578b3a6c82c50b37ed7e6406973&_s=2&_i=55`,
                cookie
            }
        )
        console.log(s.data)
        try {
            this.dict[s.data.data.pin] = s.data.data
        } catch {
        }
    }

    async extra() {
        console.log(this.dict)
        if (this.dumps(this.dict) != '{}') {
            let data = `module.exports = ${JSON.stringify(this.dict, null, 4)}`
            this.modules.fs.writeFile(this.dirname + "/config/jdUser.js", data, function(err, data) {
                if (err) {
                    throw err;
                }
                console.log("user写入成功")
            })
            this.notices("user写入成功", 'user')
        }
    }
}

module.exports = Main;
