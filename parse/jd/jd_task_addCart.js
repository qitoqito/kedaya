const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东加购有礼"
        // this.cron = "12 0,13 * * *"
        this.task = 'active'
        this.verify = 1
        this.readme = `filename_custom="url1|host=id"`
    }

    async prepare() {
        this.assert(this.custom, '请先添加加购地址')
        let custom = this.getValue('custom')
        for (let i of custom) {
            let s = this.match(/\/\/([^\/]+)\/.+?(\w{32})/, i)
            if (s) {
                this.shareCode.push({
                    host: s[0],
                    activityId: s[1]
                })
            }
            else {
                s = this.match(/\s*([^\=]+)\s*=\s*(\w{32})/, i)
                if (s) {
                    this.shareCode.push({
                        host: s[0].includes('isvjcloud.com') ? s[0] : `${s[0]}.isvjcloud.com`,
                        activityId: s[1]
                    })
                }
            }
        }
        for (let i of this.shareCode) {
            let h = await this.response({
                    'url': `https://${i.host}/wxCollectionActivity/activity2/${i.activityId}?activityId=${i.activityId}`,
                }
            )
            let shop = await this.curl({
                    'url': `https://${i.host}/wxCollectionActivity/shopInfo`,
                    'form': `activityId=${i.activityId}`,
                    cookie: h.cookie
                }
            )
            if (this.haskey(shop, 'data.sid')) {
                i.venderId = shop.data.sid
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let host = p.inviter.host
        let activityId = p.inviter.activityId
        if (p.inviter.venderId) {
            let follow = await this.curl({
                'url': 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=518274330',
                'form': `functionId=followShop&body={"follow":"true","shopId":"${p.inviter.venderId}","award":"true","sourceRpc":"shop_app_home_follow"}&osVersion=13.7&appid=wh5&clientVersion=9.2.0&loginType=2&loginWQBiz=interact`,
                cookie: p.cookie
            })
        }
        let isvObfuscator = await this.curl({
            url: 'https://api.m.jd.com/client.action',
            form: 'functionId=isvObfuscator&body=%7B%22id%22%3A%22%22%2C%22url%22%3A%22https%3A%2F%2Fddsj-dz.isvjcloud.com%22%7D&uuid=5162ca82aed35fc52e8&client=apple&clientVersion=10.0.10&st=1631884203742&sv=112&sign=fd40dc1c65d20881d92afe96c4aec3d0',
            cookie
        })
        let h = await this.response({
                'url': `https://${host}/wxCollectionActivity/activity2/${activityId}?activityId=${activityId}`,
                cookie
            }
        )
        let info = await this.response({
                'url': `https://${host}/customer/getSimpleActInfoVo`,
                form: `activityId=${activityId}`,
                cookie: h.cookie
            }
        )
        try {
            var venderId = info.content.data.venderId
        } catch (e) {
            let shop = await this.curl({
                    'url': `https://${host}/wxCollectionActivity/shopInfo`,
                    'form': `activityId=${activityId}`,
                    cookie: h.cookie
                }
            )
            if (this.haskey(shop, 'data.sid')) {
                var venderId = shop.data.sid
            }
        }
        let getPin = await this.response({
                'url': `https://${host}/customer/getMyPing`,
                form: `userId=${venderId}&token=${isvObfuscator.token}&fromType=APP`,
                cookie: info.cookie
            }
        )
        if (!this.haskey(getPin, 'content.data.secretPin')) {
            console.log(`可能是黑号或者黑ip,停止运行`)
            return
        }
        let member = await this.response({
                'url': `https://${host}/wxCommonInfo/getActMemberInfo`,
                'form': `venderId=${venderId}&activityId=${activityId}&pin=${encodeURIComponent(getPin.content.data.secretPin)}`,
                cookie: `${info.cookie};${getPin.cookie}`
            }
        )
        let skus = await this.curl({
                'url': `https://${host}/act/common/findSkus`,
                'form': `actId=${activityId}&userId=${venderId}&type=6`,
                cookie: `${info.cookie};${getPin.cookie}`
            }
        )
        let add = await this.response({
                'url': `https://${host}/wxCollectionActivity/oneKeyAddCart`,
                form: `activityId=${activityId}&pin=${encodeURIComponent(getPin.content.data.secretPin)}&productIds=${this.dumps(this.column(skus.skus, 'skuId'))}`,
                cookie: `${member.cookie};${getPin.cookie}`
            }
        )
        cookie = `${add.cookie};AUTH_C_USER=${getPin.content.data.secretPin};`
        let getPrize = await this.curl({
                'url': `https://${host}/wxCollectionActivity/getPrize`,
                form: `activityId=${activityId}&pin=${encodeURIComponent(getPin.content.data.secretPin)}`,
                cookie
            }
        )
        if (this.haskey(getPrize, 'data.drawOk')) {
            console.log(`获得: ${getPrize.data.name}`)
            this.notices(`获得: ${getPrize.data.name}`, p.user)
        }
        else {
            console.log(getPrize.errorMessage);
        }
        await this.curl({
            'url': 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=518274330',
            'form': `functionId=followShop&body={"follow":"false","shopId":"${p.inviter.venderId}","award":"true","sourceRpc":"shop_app_home_follow"}&osVersion=13.7&appid=wh5&clientVersion=9.2.0&loginType=2&loginWQBiz=interact`,
            cookie: p.cookie
        })
    }
}

module.exports = Main;
