const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东早起签到得京豆"
        // this.cron = "5 0 * * *"
    }

    async main(p) {
        p.url = `https://api.m.jd.com/client.action?functionId=morningGetBean&body={"fp":"-1","shshshfp":"-1","shshshfpa":"-1","referUrl":"-1","userAgent":"-1","jda":"-1","rnVersion":"3.9"}&appid=ld&client=apple&clientVersion=10.0.8&networkType=wifi&osVersion=13.7&jsonp=jsonp_1627231444901_3492`
        let s = await this.curl(p)
        if (s?.data?.beanNum) {
            console.log(`获得京豆: ${s.data.beanNum}`, p.user)
        }
        else {
            console.log("可能已经签到过了")
        }
    }
}

module.exports = Main;
