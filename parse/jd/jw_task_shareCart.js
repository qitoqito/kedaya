const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东小程序分享年货清单"
        this.cron = "6 6 6 6 6"
        this.help = 'main'
        this.task = 'local'
        this.header = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x18001225) NetType/WIFI Language/zh_CN',
            'Referer': 'https://servicewechat.com/wx91d27dbf599dff74/593/page-frame.html'
        }
        this.thread = 6
    }

    async prepare() {
        this.code = [
            '100028907356', '100029369300',
            '11190401086', '100012371498',
            '10026412266666', '100016299497',
            '10037105599955', '10021502148306',
            '10036290188821', '10034590900017',
            '100014433601', '100020530546',
            '100016241357'
        ]
        var shareToken = ''
        for (let cookie of this.cookies['help']) {
            let u = await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=shareCart_selectSkuInfo&appid=hot_channel&body={"locationId":"1_72_2222_0"}&loginType=2&clientVersion=1.0.0&loginWQBiz=sharecart`,
                    // 'form':``,
                    cookie
                }
            )
            shareToken = this.haskey(u, 'data.shareToken')
            if (shareToken) {
                break
            }
        }
        shareToken = shareToken || 'bd67efc3be1c59bcab4f8b90e3a0f708'
        this.shareCode.push({shareToken})
    }

    async main(p) {
        let cookie = p.cookie;
        let goods = this.random(this.code, 5)
        let u = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=shareCart_selectSkuInfo&appid=hot_channel&body={"locationId":"1_72_2222_0"}&loginType=2&clientVersion=1.0.0&loginWQBiz=sharecart`,
                // 'form':``,
                cookie
            }
        )
        let shareToken = this.haskey(u, 'data.shareToken')
        let creat = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=shareCart_createUserSkuList&appid=hot_channel&body={"locationId":"1_72_2222_0","skuIds":"${goods.join(',')}"}&loginType=2&clientVersion=1.0.0&loginWQBiz=sharecart`,
                // 'form': ` `,
                cookie
            }
        )
        let d = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=shareCart_shareLotteryDraw&appid=hot_channel&body={"locationId":"1_72_2222_0","shareToken":"${shareToken}"}&loginType=2&clientVersion=1.0.0&loginWQBiz=sharecart`,
                // 'form':``,
                cookie
            }
        )
        let discount = []
        if (this.haskey(d, 'data.reward.discount')) {
            discount.push(d.data.reward.discount)
            console.log(p.user, '创建年货清单获得:', d.data.reward.discount)
        }
        else {
            console.log(p.user, '什么也没有')
        }
        let k = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=shareCart_doKoi&appid=hot_channel&body={"locationId":"1_72_2222_0"}&loginType=2&clientVersion=1.0.0&loginWQBiz=sharecart`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(k, 'data.reward.discount')) {
            discount.push(k.data.reward.discount)
            console.log(p.user, '抽奖获得:', k.data.reward.discount)
        }
        else {
            console.log(p.user, '什么也没有')
        }
        let f = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=shareCart_shareFixedSkuList&appid=hot_channel&body={"locationId":"1_72_2222_0","shareToken":"${p.inviter.shareToken}"}&loginType=2&clientVersion=1.0.0&loginWQBiz=sharecart`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(f, 'data.reward.discount')) {
            discount.push(f.data.reward.discount)
            console.log(p.user, '创建年货清单获得:', f.data.reward.discount)
        }
        else {
            // console.log(p.user, '分享了,什么也没有')
        }
        if (discount.length) {
            this.notices(`获得红包: ${this.sum(discount)}`, p.user)
        }
    }
}

module.exports = Main;
