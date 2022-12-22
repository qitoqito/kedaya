const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东wskey配置转换"
        this.cron = "6 6 6 6 6"
        this.help = 2
        this.task = 'test'
        this.jump = 1
        this.import = ['fs']
        this.readme=`读取环境变量JD_WSCK,将wskey写入到jdUser里面\nwskey转换ptkey可以使用jd_task_checkCookie或者jd_task_wskey生成`
    }

    async prepare() {
        let change = 0
        if (this['JD_WSCK']) {
            let dict = this['JD_WSCK'].split('&')
            console.log(dict)
            for (let cookie of dict) {
                let pin = this.userPin(cookie)
                let user = this.userDict[pin]
                if (user) {
                    if (user.wskey == cookie) {
                        console.log(`配置文件中已经有:${pin}账户的wskey,跳过写入`)
                    }
                    else {
                        console.log(`配置文件写入:${pin}成功`)
                        user.wskey = cookie
                        user.verify = '1'
                        change = 1
                    }
                }
                else {
                    console.log(`配置文件中没有:${pin}账户`)
                }
            }
        }
        else {
            console.log(`环境变量没有JD_WSCK`)
        }
        if (change) {
            let data = `module.exports = ${JSON.stringify(this.userDict, null, 4)}`
            this.modules.fs.writeFile(this.dirname + "/config/jdUser.js", data, function(err, data) {
                if (err) {
                    throw err;
                }
                console.log("jdUser写入成功")
            })
        }
    }
}

module.exports = Main;
