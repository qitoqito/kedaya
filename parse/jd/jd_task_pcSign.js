const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东网页签到"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo', 'logBill']
        this.interval = 6000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: 'latest',
            type: 'wechat'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let h5st = await this.algo.h5st({
                'url': `https://api.m.jd.com/`,
                'form': `appid=asset-h5&clientVersion=1.0.0&client=pc&body={"type":1}&functionId=jsfbox_bean_sign`,
                cookie,
                algo: {
                    appId: '73c2f'
                },
                referer: 'https://bean.jd.com/myJingBean/list'
            }
        )
        h5st.form = `${h5st.form}&uuid=${this.uuid(22, 'n')}&area=16_${this.rand(1000, 1300)}_${this.rand(1000, 1300)}_${this.rand(1, 19)}&loginType=2&t=${new Date().getTime()}`
        let sign = await this.curl(h5st)
        if (this.haskey(sign, 'data.receiveBeanNum')) {
            this.print(`京豆: ${sign.data.receiveBeanNum}`, p.user)
        }
        else {
            console.log(sign)
        }
    }
}

module.exports = Main;
