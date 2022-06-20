const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东头文字J兑换"
        // this.cron = "0 */2 * * *"
        this.help = 2
        this.task = 'local'
        this.import = ['fs']
    }

    async prepare() {
    }

    async main(p) {
    }

    async extra() {
    }
}

module.exports = Main;
