const Template = require('../../template');
class Main extends Template {
    constructor() {
        super()
        this.title = "京东好物街"
        // this.cron = "12 0,13 * * *"
        this.help = 2
        this.task = 'test'
    }
    async prepare() {
    }
    async main(p) {
    }
}
module.exports = Main;
