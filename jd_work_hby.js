const Common = require("./extractor/common");

class Work extends Common {
    constructor() {
        super()
        this.title = '京东1111红包雨'
        this.cron = "1 19-23 6-11 11 *"
        this.task = 'local'
        this.thread = 7
    }

    async main(p) {
        let cookie = p.cookie
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=hby_lottery&appid=publicUseApi&body={"babelProjectId":"01070253","babelPageId":"3121352"}&t=1635773601055&client=wh5&clientVersion=1.0.0&sid=u4a53666bd7c0c8ea5d79fb565a88a6w&uuid=66667dca8a794007c142227f504a6666ff131e7&networkType=wifi&ext={"prstate":"0"}`,
                cookie
            }
        )
        console.log(p.user, s.data);
        try {
            this.notices(s.data.result.hbInfo.discount, p.user)
        } catch (e) {
        }
    }
}

!(async () => {
    let Jd = new Work()
    await Jd.init()
})().catch((e) => {
    console.log(e.message)
})
