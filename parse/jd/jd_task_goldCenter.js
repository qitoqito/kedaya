const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东金榜勋章点亮"
        // this.cron = "39 6,22 * * *"
        this.task = 'local'
        // this.thread = 6
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=goldCenterDoTask&body={"type":1}&appid=content_ecology&clientVersion=10.2.7&client=apple&jsonp=jsonp_kx5ze16y_snh_pt&d_model=iPhone8%2C4&build=167894&ext={"prstate":"0"}`,
                // 'form':``,
                cookie
            }
        )
        console.log(s.result)
        if (this.haskey(s, 'result.lotteryScore')) {
            this.notices(`获得京豆:${s.result.lotteryScore}`, p.user)
        }
        await this.wait(1000)
        let ss = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=goldCenterDoTask&body={"type":2}&appid=content_ecology&clientVersion=10.3.0&client=apple&d_model=iPhone13%2C3&build=167903`,
                // 'form':``,
                cookie
            }
        )
        console.log(ss.result)
        if (this.haskey(ss, 'result.lotteryScore')) {
            this.notices(`整签获得京豆:${ss.result.lotteryScore}`, p.user)
        }
    }
}

module.exports = Main;
