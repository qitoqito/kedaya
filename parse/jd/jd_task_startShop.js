const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东618超级盲盒"
        this.cron = "12 15 */4 * *"
        this.help = 2
        this.task = 'local'
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/?functionId=apTaskList&body={"linkId":"Jim-Gu6R_lyd4LT6nz69ow"}&_t=1654226708008&appid=activities_platform&cthr=1`,
                // 'form':``,
                cookie
            }
        )
        this.assert(this.haskey(s, 'data'), '没有获取到数据')
        for (let i of s.data) {
            if (i.taskLimitTimes != i.taskDoTimes) {
                let d = await this.curl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=apDoTask&body={"taskType":"${i.taskType}","taskId":${i.id},"linkId":"Jim-Gu6R_lyd4LT6nz69ow"}&_t=1654226707654&appid=activities_platform&cthr=1`,
                        cookie
                    }
                )
                console.log("正在执行:", i.taskTitle, this.haskey(d, 'data.finished'))
            }
            else {
                console.log('任务已经完成:', i.taskTitle)
            }
        }
        let draw = await this.curl({
                'url': `https://api.m.jd.com/?functionId=starShopDraw&body={"linkId":"Jim-Gu6R_lyd4LT6nz69ow"}&_t=1655468068076&appid=activities_platform&client=ios&clientVersion=11.0.6&cthr=1&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(draw, 'data')) {
            console.log(`${draw.data.prizeConfigName} : ${draw.data.prizeValue}`)
        }
        else {
            console.log(`什么也没有`)
        }
    }
}

module.exports = Main;
