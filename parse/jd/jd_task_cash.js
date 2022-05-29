const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东领现金"
        this.cron = "26 8,18 * * *"
        this.help = 2
        this.task = 'local'
        // this.thread = 6
        this.import = ['jdUrl']
        // this.loop = 3
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl(this.modules.jdUrl.app('cash_homePage', {}, 'post', cookie))
        for (let i of this.haskey(s, 'data.result.taskInfos')) {
            if (i.times != i.doTimes) {
                if (i.jump) {
                    let k = await this.curl(this.modules.jdUrl.app('cash_doTask', {
                        "type": i.type,
                        "taskInfo": i.jump.params.url || i.jump.params.skuId || i.jump.params.path
                            || i.jump.params.shoId
                    }, 'post', cookie))
                    console.log(k.data.bizMsg)
                }
                else {
                    let k = await this.curl(this.modules.jdUrl.app('cash_doTask', {
                        "type": i.type,
                        "taskInfo": "1"
                    }, 'post', cookie))
                    console.log(k.data)
                }
            }
            else {
                console.log(`任务已完成: ${i.name}`)
            }
        }
    }
}

module.exports = Main;
