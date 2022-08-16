const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东Redis连接测试"
        this.cron = "6 6 6 6 6"
        this.import = ['redisCache']
        this.jump = 1
    }

    async prepare() {
        this.cache = this.modules.redisCache
        await this.cache.connect()
        await this.cache.set("test", {a: this.rand(5, 100)})
        await this.cache.expire("test", 10)
        let test = await this.cache.get("test")
        if (test) {
            this.print(`redis连接正常,随机数: ${test.a}`)
        }
        else {
            this.print("redis连接错误")
        }
        await this.cache.close()
    }
}

module.exports = Main;
