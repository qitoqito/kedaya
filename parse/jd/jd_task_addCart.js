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
                if (i.includes('=')) {
                    s = this.match(/\s*([^\=]+)\s*=\s*(\w{32})/, i)
                    if (s) {
                        this.shareCode.push({
                            host: s[0].includes('isvjcloud.com') ? s[0] : `${s[0]}.isvjcloud.com`,
                            activityId: s[1]
                        })
                    }
                }
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let host = p.inviter.host
        let activityId = p.inviter.activityId
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
        let venderId = info.content.data.venderId
        let getPin = await this.response({
                'url': `https://${host}/customer/getMyPing`,
                form: `userId=${venderId}&token=${isvObfuscator.token}&fromType=APP`,
                cookie: info.cookie
            }
        )
        if (!this.haskey(getPin, 'content.data.secretPin')) {
            console.log(`可能是黑号,停止运行`)
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
    }
}

module.exports = Main;
