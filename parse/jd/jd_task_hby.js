const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东红包雨"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.verify = 1
        this.readme = "custom=红包雨url,现在验证activityNo参数,无法直接使用纯数字babelProjectId作为custom"
    }

    async prepare() {
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
                let activityNo = this.match(/"promoId"\s*:\s*"(\w+)"/, s)
                if (babelPageId && babelProjectId) {
                    this.shareCode.push({babelProjectId, babelPageId, activityNo})
                }
            }
        }
    }

    async main(p) {
        let cookie = p.cookie
        this.options["headers"]["user-agent"] = this.getUa()
        for (let i of Array(2)) {
            let s = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=hby_lottery&appid=publicUseApi&body=${this.dumps(p.inviter)}&t=${this.timestamp}&client=wh5&clientVersion=1.0.0&networkType=&ext={"prstate":"0"}`,
                    cookie
                }
            )
            console.log(this.haskey(s, 'data'))
            try {
                console.log(p.user, s.data.result.hbInfo.discount)
                this.notices(`获得红包: ${s.data.result.hbInfo.discount}元`, p.user)
            } catch (e) {
                console.log("没有获得红包")
            }
            if (this.haskey(s, 'data.result.sceneId') && this.haskey(s, 'data.result.share')) {
                let share = await this.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `functionId=hby_share&appid=publicUseApi&body={"sceneId":"${this.haskey(s, 'data.result.sceneId')}","activityNo":"TF8Y1nRzvG--tYyTJr-al"}&t=${this.timestamp}&client=wh5&clientVersion=1.0.0&&networkType=&ext={"prstate":"0"}`,
                        cookie
                    }
                )
            }
            else {
                break
            }
        }
    }
}

module.exports = Main;
