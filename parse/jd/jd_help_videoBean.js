const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东视频分享得京豆"
        this.cron = "22 10,22 * * *"
        this.help = 'main'
        this.task = 'local'
        this.thread = 6
        this.model = 'user'
        this.verify = 1
    }

    async prepare() {
        this.code = [
            "https://anmp.jd.com/babelDiy/Zeus/2mk2pSswjLJ6ZYKZYLZeMs4Rcqq5/index.html"
            // 'https://anmp.jd.com/babelDiy/Zeus/iCc5C4cYeELBq2snuRzgHXK3QX7/index.html',
            // 'https://anmp.jd.com/babelDiy/Zeus/2ZmnynfbAr1o6qRddJpiy6YvLK6E/index.html',
            // 'https://anmp.jd.com/babelDiy/Zeus/3ZCsX7usDGQf6T6xZiYSF66kzDpr/index.html',
            // 'https://anmp.jd.com/babelDiy/Zeus/3doJ9utWY4YtYg1LNDT96Lg8KEbc/index.html',
            // 'https://anmp.jd.com/babelDiy/Zeus/K9FJhwijt6vahHPzWtgfJJPaUXz/index.html'
        ]
        for (let url of this.code) {
            for (let cookie of this.cookies['help']) {
                let s = await this.curl({
                        url, cookie
                    }
                )
                try {
                    let activeId = this.match(/"activeId":"(\d+)"/, s)
                    let actToken = this.match(/"actToken":"(\w+)"/, s)
                    let ss = await this.curl({
                            'url': `https://wq.jd.com/activet2/piggybank/query?activeid=${activeId}&token=${actToken}&sceneval=2&shareid=&callback=queryE&_=1625915519313`,
                            // 'form':``,
                            cookie
                        }
                    )
                    if (ss?.data?.shareid) {
                        let user = this.userName(cookie)
                        this.shareCode.push({actToken, activeId, shareid: ss.data.shareid, user})
                    }
                } catch (e) {
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
                    // try {
                    //     let h = await this.curl({
                    //             'url': `https://wq.jd.com/active/getfunction?activeid=${i.activeId}&token=${i.actToken}&sceneval=2&callback=GetFunctionQ&_=1625916052829`,
                    //             // 'form':``,
                    //             cookie
                    //         }, '', `
                    //         evalData =evalData.replace('JD', 'return val; JD')
                    //     `
                    //     )
                    //     let promotejs = h.function(h.TOKEN)
                    //     cookie = `promotejs=${promotejs};${cookie}`
                    // } catch (e) {
                    // }
                    let s = await this.curl({
                            'url': `https://wq.jd.com/activet2/piggybank/draw?activeid=${i.activeId}&token=${i.actToken}&sceneval=2&callback=drawO&_=1625916054011`,
                            // 'form':``,
                            cookie
                        }
                    )
                    if (typeof (s) == 'object' && s?.data?.drawflag) {
                        console.log('领取奖励成功')
                    }
                    else {
                        console.log("领取奖励失败")
                    }
                    await this.wait(1200)
                }
            }
        }
    }
}

module.exports = Main;
