const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "test"
        this.cron = "12 0,13 * * *"
        this.help = 2
        this.task = 'test'
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
    }
}

module.exports = Main;
