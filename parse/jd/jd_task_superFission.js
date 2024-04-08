const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东微信助力红包"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.hint = {
            activeId: "活动id,多id用|隔开"
        }
        this.verify = 1
        this.delay = 100
    }

    async prepare() {
        if (this.profile.activeId) {
            for (let i of this.profile.activeId.split("|")) {
                for (let cookie of this.cookies['help']) {
                    let o = await this.curl({
                            'url': `https://api.m.jd.com/superFission/openGroup?g_ty=ls&g_tk=1226062469`,
                            'form': `client=apple&clientVersion=7.22.240&build=&uuid=oA1P50ARLgxhazLuafOyRpeR6Xqo&osVersion=iOS%2011.4&screen=320*568&networkType=wifi&partner=&forcebot=&d_brand=iPhone&d_model=iPhone%20SE%3CiPhone8%2C4%3E&lang=zh_CN&wifiBssid=&scope=&functionId=superFission_openGroup&appid=hot_channel&loginType=2&body={"activeId":"${i}","orderNo":"","pdMiniappId":"","pdVenderId":"","pdProjectId":"","pdTaskId":""}`,
                            'referer': `https://servicewechat.com/wx91d27dbf599dff74/664/page-frame.html`,
                            cookie
                        }
                    )
                    let ss = await this.curl({
                            'url': `https://api.m.jd.com/superFission/groupList?client=apple&clientVersion=7.22.240&build=&uuid=oA1P50HRNbzVw42i_LpLDycOl_lA&osVersion=iOS%2015.1.1&screen=390*844&networkType=wifi&partner=&forcebot=&d_brand=iPhone&d_model=iPhone%2012%20Pro%3CiPhone13%2C3%3E&lang=zh_CN&wifiBssid=&scope=&functionId=superFission_groupList&appid=hot_channel&loginType=2&body={"type":1}&g_ty=ls&g_tk=1871805617`,
                            'referer': `https://servicewechat.com/wx91d27dbf599dff74/664/page-frame.html`,
                            cookie
                        }
                    )
                    for (let kk of this.haskey(ss, 'data.groupList')) {
                        if (parseInt(this.timestamp / 1000) - kk.groupTime<3600 && kk.groupStatus == 1) {
                            this.shareCode.push(
                                {
                                    'group_id': kk.groupId,
                                    'active_id': kk.activityId,
                                    prize: kk.masterPrize,
                                    // type: 1,
                                    user: this.userName(cookie)
                                }
                            )
                        }
                    }
                }
            }
        }
        else {
            this.jump = 1
        }
    }

    async main(p) {
        let cookie = p.cookie;
        await this.curl({
                'url': `https://api.m.jd.com/superFission/mainPage?g_ty=ls&g_tk=1145454937`,
                'form': `client=apple&clientVersion=7.22.240&build=&uuid=oA1P50KN5utJq7vkhQ_4XX9UlVtA&osVersion=iOS%2013.7&screen=375*667&networkType=wifi&partner=&forcebot=&d_brand=iPhone&d_model=iPhone%206s%3CiPhone8%2C1%3E&lang=zh_CN&wifiBssid=&scope=&functionId=superFission_mainPage&appid=hot_channel&loginType=2&body={"activeId":"${p.inviter.active_id}","groupId":"${p.inviter.group_id}","orderNo":"","pdMiniappId":"","pdVenderId":"","pdProjectId":"","pdTaskId":"","venueUrl":""}`,
                cookie,
                'referer': `https://servicewechat.com/wx91d27dbf599dff74/664/page-frame.html`,
            }
        )
        await this.curl({
                'url': `https://api.m.jd.com/superFission/rewardCarousel?client=apple&clientVersion=7.22.240&build=&uuid=oA1P50KN5utJq7vkhQ_4XX9UlVtA&osVersion=iOS%2013.7&screen=375*667&networkType=wifi&partner=&forcebot=&d_brand=iPhone&d_model=iPhone%206s%3CiPhone8%2C1%3E&lang=zh_CN&wifiBssid=&scope=&functionId=superFission_rewardCarousel&appid=hot_channel&loginType=2&body={"activeId":"${p.inviter.active_id}"}&g_ty=ls&g_tk=1145454937`,
                cookie,
                'referer': `https://servicewechat.com/wx91d27dbf599dff74/664/page-frame.html`,
            }
        )
        let s = await this.curl({
                'url': `https://api.m.jd.com/superFission/joinGroup?g_ty=ls&g_tk=1145454937`,
                'form': `client=apple&clientVersion=7.22.240&build=&uuid=oA1P50KN5utJq7vkhQ_4XX9UlVtA&osVersion=iOS%2013.7&screen=375*667&networkType=wifi&partner=&forcebot=&d_brand=iPhone&d_model=iPhone%206s%3CiPhone8%2C1%3E&lang=zh_CN&wifiBssid=&scope=&functionId=superFission_joinGroup&appid=hot_channel&loginType=2&body={"activeId":"${p.inviter.active_id}","groupId":"${p.inviter.group_id}","pdMiniappId":"","pdVenderId":"","pdProjectId":"","pdTaskId":""}`,
                cookie,
                'referer': `https://servicewechat.com/wx91d27dbf599dff74/664/page-frame.html`,
            }
        )
        let msg = this.haskey(s, 'message')
        if (msg.includes("满员")) {
            this.finish.push(p.number)
            this.print(`已成团,红包: ${p.inviter.prize}元`, p.inviter.user)
        }
        if (msg.includes("过期")) {
            this.finish.push(p.number)
        }
        if (msg.includes("上限")) {
            this.complete.push(p.index)
        }
        if (this.haskey(s, 'data.activeId')) {
            console.log("助力成功...")
        }
        else {
            console.log(msg || s)
        }
    }
}

module.exports = Main;
