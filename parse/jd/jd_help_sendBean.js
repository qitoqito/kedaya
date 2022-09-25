const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东送豆得豆"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'own'
        this.verify = 1
        this.thread = 6
        this.turn = 2
    }

    async prepare() {
        for (let i of this.cookies['help']) {
            this.options.headers.lkt = this.timestamp;
            this.options.headers.lks = this.md5(`${this['jd_invokeKey']}${this.timestamp}`)
            let url = `https://sendbeans.jd.com/common/api/bean/activity/get/entry/list/by/channel?channelId=14&channelType=H5&sendType=0&singleActivity=false&invokeKey=${this['jd_invokeKey']}`
            this.setCookie(i)
            let s = await this.curl(url)
            try {
                let items = s.data.items
                for (let k of items) {
                    let activityCode = k.activityCode
                    this.options.headers.lks = this.md5(`${this['jd_invokeKey']}${this.timestamp}${activityCode}`)
                    let user = decodeURIComponent(i.match(/pt_pin=([^;]+)/)[1])
                    let detailUrl = `https://sendbeans.jd.com/common/api/bean/activity/detail?activityCode=${activityCode}&activityId=85&timestap=1631605275499&userSource=jdApp&jdChannelId=316&invokeKey=${this['jd_invokeKey']}`
                    await this.curl(detailUrl)
                    if (k.status == 'ON_GOING') {
                        await this.curl({
                            'url': `https://sendbeans.jd.com/common/api/bean/activity/invite?activityCode=${activityCode}&activityId=${k.activeId}&source=SEND_BEAN_H5&userSource=jdApp&jdChannelId=316&invokeKey=${this['jd_invokeKey']}`,
                            'form': {}
                        })
                        await this.curl(detailUrl)
                        await this.curl({
                            'url': `https://sendbeans.jd.com//api/statistic/add?activityCode=${activityCode}&relatedId=1569&relatedIdType=BEAN_ACTIVITY_ID&action=BEAN_ACTIVITY_ENTER_NEW&userSource=mp&appId=wxccb5c536b0ecd1bf`,
                            'form': {}
                        })
                        await this.curl({
                            'url': `https://sendbeans.jd.com/api/lottery/risk?activityCode=${activityCode}&relatedIdType=BEAN_ACTIVITY_ID&relatedId=85`,
                            'form': {}
                        })
                        await this.curl({
                            'url': `https://sendbeans.jd.com/common/api/bean/activity/invite?activityCode=${activityCode}&activityId=${k.activeId}&source=SEND_BEAN_H5&userSource=jdApp&jdChannelId=316&invokeKey=${this['jd_invokeKey']}`,
                            'form': {}
                        })
                        await this.curl(detailUrl)
                        if (this.source.data.rewardRecordId) {
                            this.shareCode.push({
                                'userPin': this.source.data.userPin,
                                'appId': this.source.data.appId,
                                'rewardRecordId': this.source.data.rewardRecordId,
                                'activityId': k.activeId,
                                'activityCode': activityCode,
                                count: this.source.data.activityInfo.inviteBeanQuantity
                            });
                        }
                    }
                    else if (k.status == 'COMPLETE') {
                        await this.curl(detailUrl)
                        let rewardId = this.source.data.rewardRecordId
                        let rewardUrl = `https://sendbeans.jd.com/common/api/bean/activity/sendBean?activityCode=${activityCode}&rewardRecordId=${rewardId}&jdChannelId=&userSource=mp&appId=wxccb5c536b0ecd1bf&invokeKey=${this['jd_invokeKey']}`
                        await this.curl(rewardUrl)
                    }
                }
            } catch (e) {
            }
        }
    }

    async assist(p) {
        this.options.headers.lks = this.md5(`${this['jd_invokeKey']}${this.timestamp}${p.inviter.activityCode}`)
        try {
            await this.curl({
                'url': `https://sendbeans.jd.com/common/api/bean/activity/detail?activityCode=${p.inviter.activityCode}&activityId=${p.inviter.activityId}&timestap=${this.timestamp}&userSource=mp&jdChannelId=&inviteUserPin=${encodeURIComponent(p.inviter.userPin)}&appId=wxccb5c536b0ecd1bf&invokeKey=${this['jd_invokeKey']}`,
                'cookie': p.cookie
            })
            let s = await this.curl({
                'url': `https://sendbeans.jd.com/common/api/bean/activity/participate?activityCode=${p.inviter.activityCode}&activityId=${p.inviter.activityId}&inviteUserPin=${encodeURIComponent(p.inviter.userPin)}&invokeKey=${this['jd_invokeKey']}&timestap=${this.source.currentTime}`,
                'form': {},
                'cookie': p.cookie
            })
            console.log(s?.data?.desc)
        } catch (e) {
        }
    }

    async main(p) {
        let cookie = p.cookie
        this.options.headers.lks = this.md5(`${this['jd_invokeKey']}${this.timestamp}`)
        let m = await this.curl({
                'url': `https://sendbeans.jd.com/common/api/bean/activity/myReward?itemsPerPage=10&currentPage=1&sendType=0&invokeKey=${this['jd_invokeKey']}`,
                // 'form':``,
                cookie
            }
        )
        for (let i of this.haskey(m, 'datas')) {
            if (i.status == 3) {
                let r = await this.curl({
                        'url': `https://sendbeans.jd.com/common/api/bean/activity/sendBean?rewardRecordId=${i.id}&invokeKey=${this['jd_invokeKey']}`,
                        // 'form':``,
                        cookie
                    }
                )
                console.log(p.user, '领取助力京豆', r.success)
            }
        }
        console.log(p.user, 'ok')
    }

    async extra() {
        if (this.shareCode.length>0) {
            for (let i of this.shareCode) {
                try {
                    let zlCookie = this.findValue(this.cookies['help'], encodeURIComponent(i.userPin));
                    this.options.headers.lks = this.md5(`${this['jd_invokeKey']}${this.timestamp}${i.activityCode}`)
                    let rewardUrl = `https://sendbeans.jd.com/common/api/bean/activity/sendBean?activityCode=${i.activityCode}&rewardRecordId=${i.rewardRecordId}&jdChannelId=&userSource=mp&appId=wxccb5c536b0ecd1bf&invokeKey=${this['jd_invokeKey']}`
                    let s = await this.curl({url: rewardUrl, cookie: zlCookie})
                    console.log(s)
                    if (s.successs) {
                        this.notices(`获得送豆奖励: ${i.count}`, p.user)
                    }
                } catch (e) {
                    console.log(e.message)
                }
            }
        }
    }
}

module.exports = Main;
