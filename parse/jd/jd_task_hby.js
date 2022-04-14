const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东红包雨"
        this.cron = "1 0,10,14,16,18,20 * * *"
        this.task = 'local'
        this.thread = 3
    }

    async prepare() {
        let body = {}
        if (this.custom) {
            if (isNaN(this.custom)) {
                try {
                    body = this.loads(this.custom)
                } catch {
                    let url
                    if (this.match(/^http/, this.custom)) {
                        url = this.custom
                    }
                    else {
                        url = `https://prodev.m.jd.com/mall/active/${this.custom}/index.html`
                    }
                    let s = await this.curl({
                            'url': url,
                        }
                    )
                    let babelProjectId = this.match(/"activityId"\s*:\s*"(\d+)"/, s)
                    let babelPageId = this.match(/"pageId"\s*:\s*"(\d+)"/, s)
                    if (babelPageId && babelProjectId) {
                        body = {babelProjectId, babelPageId}
                    }
                }
            }
            else {
                body = {"babelProjectId": this.custom.toString(), "babelPageId": "3351872"}
            }
        }
        if (this.dumps(body) == '{}') {
            body = {"babelProjectId": "01210019", "babelPageId": "3484113"}
        }
        this.dict = body
        console.log('当前红包雨:', this.dumps(this.dict))
    }

    async main(p) {
        let cookie = p.cookie
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=hby_lottery&appid=publicUseApi&body=${this.dumps(this.dict)}&t=${this.timestamp}&client=wh5&clientVersion=1.0.0&networkType=&ext={"prstate":"0"}`,
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
