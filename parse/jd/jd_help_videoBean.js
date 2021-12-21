const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东视频分享得京豆"
        this.cron = "22 1,22 * * *"
        this.help = 'main'
        this.task = 'local'
        this.model = 'user'
        this.verify = 1
        this.readme = "黑号可能无法获取奖励"
    }

    async prepare() {
        let custom = []
        if (this[`${this.filename}_custom`]) {
            custom = typeof (this[`${this.filename}_custom`]) == 'object' ? this[`${this.filename}_custom`] : this[`${this.filename}_custom`].split("|")
        }
        this.code = [
            'https://anmp.jd.com/babelDiy/Zeus/2mV9Bm7EcXdzj9qpBv1KQ2oDnC9e/index.html',
            'https://anmp.jd.com/babelDiy/Zeus/9BkX3FFqtCZPqvBS6oxK7z9BVBM/index.html'
        ]
        this.code = this.unique([...custom, ...this.code].filter(d => d))
        for (let url of this.code) {
            for (let cookie of this.cookies['help']) {
                let s = await this.curl({
                        url, cookie
                    }
                )
                try {
                    let config = this.match(/h5Config\s*=\s*(.*?)\s*\n*var/, s)
                    let json = this.loads(config)
                    let activeId = this.match(/"activeId":"(\d+)"/, s)
                    let actToken = this.match(/"actToken":"(\w+)"/, s)
                    let ss = await this.curl({
                            'url': `https://wq.jd.com/activet2/piggybank/query?activeid=${activeId}&token=${actToken}&sceneval=2&shareid=&callback=queryE&_=1625915519313`,
                            // 'form':``,
                            cookie
                        }
                    )
                    if (ss?.data?.shareid && !this.haskey(ss, 'data.prize.0.active')) {
                        let user = this.userName(cookie)
                        if (ss.data.helper.length<3) {
                            this.shareCode.push({actToken, activeId, shareid: ss.data.shareid, user})
                        }
                        else {
                            let s = await this.curl({
                                    'url': `https://wq.jd.com/activet2/piggybank/draw?activeid=${activeId}&token=${actToken}&sceneval=2&callback=drawO&_=1625916054011`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            if (typeof (s) == 'object' && this.haskey(s, 'data.prize.0.active')) {
                                console.log(user, '领取奖励成功')
                            }
                            else {
                                console.log(user, "领取奖励失败")
                            }
                        }
                    }
                } catch (e) {
                    console.log(e.message)
                }
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://wq.jd.com/activet2/piggybank/help?activeid=${p.inviter.activeId}&token=${p.inviter.actToken}&sceneval=2&shareid=${p.inviter.shareid}&callback=helpc&_=1625915151008`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(s, 'data.helpbless')) {
            console.log("助力成功")
        }
        else {
            console.log("助力失败啦或者已经助力过了")
        }
    }

    async extra() {
        for (let i of this.shareCode) {
            for (let cookie of this.cookies['help']) {
                let user = this.userName(cookie)
                if (user == i.user) {
                    let s = await this.curl({
                            'url': `https://wq.jd.com/activet2/piggybank/draw?activeid=${i.activeId}&token=${i.actToken}&sceneval=2&callback=drawO&_=1625916054011`,
                            // 'form':``,
                            cookie
                        }
                    )
                    if (typeof (s) == 'object' && this.haskey(s, 'data.prize.0.active')) {
                        console.log(user, '领取奖励成功')
                    }
                    else {
                        console.log(user, "领取奖励失败")
                    }
                    await this.wait(1200)
                }
            }
        }
    }
}

module.exports = Main;
