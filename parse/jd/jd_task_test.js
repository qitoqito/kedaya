const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "test"
        this.cron = "12 0,13 * * *"
        this.help = 2
        this.task = 'test'
        this.readme= "这里是测试信息"
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        this.notices('test',p.user)
    }
}

module.exports = Main;
