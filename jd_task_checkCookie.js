const Common = require("./extractor/common");

class Work extends Common {
    constructor() {
        super()
        this.title = "京东cookie检测"
        this.cron = "50 7-23 * * *"
        this.thread = 7
        this.task = 'all'
    }

    async main(p) {
        p.url = 'https://plogin.m.jd.com/cgi-bin/ml/islogin'
        let login = await this.curl(p);
        console.log(p.user, login.islogin == '0' ? "账号过期了呀🐶" : "账号还没过期呢🍀")
        if (this.source.islogin == '0') {
            this.notices("账户过期", p.user)
            this.code.push(p.user)
        }
    }
}

!(async () => {
    let Jd = new Work()
    await Jd.init()
})().catch((e) => {
    console.log(e.message)
})
