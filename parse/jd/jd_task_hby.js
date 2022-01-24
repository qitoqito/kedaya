const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东年货红包雨"
        this.cron = "1 19-23 * * *"
        this.task = 'local'
        this.thread = 6
    }

    async main(p) {
        let hby = this.custom || '{"babelProjectId":"01142214","babelPageId":"3344189"}'
        let cookie = p.cookie
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=hby_lottery&appid=publicUseApi&body=${hby}&t=${this.timestamp}&client=wh5&clientVersion=1.0.0&networkType=&ext={"prstate":"0"}`,
                cookie
            }
        )
        try {
            console.log(p.user, s.data.result.hbInfo.discount)
            this.notices(`获得红包: ${s.data.result.hbInfo.discount}元`, p.user)
        } catch (e) {
            console.log("没有获得红包")
        }
    }
}

module.exports = Main;
