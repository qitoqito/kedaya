const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东加购有礼"
        // this.cron = "12 0,13 * * *"
        this.task = 'active'
        this.verify = 1
        this.readme = `filename_custom="url1|host=id|id"`
        this.manual=1
    }

    async prepare() {
        this.assert(this.custom, '请先添加加购地址')
        let custom = this.getValue('custom')
        let type = 'addCart'
        for (let i of custom) {
            let s = this.match(/\/\/([^\/]+)\/.+?(\w{32})/, i)
            if (i.includes('ShopGift')) {
                type = 'shopGift'
            }
            if (s) {
                this.shareCode.push({
                    host: s[0],
                    activityId: s[1],
                    type
                })
            }
            else {
                s = this.match(/\s*([^\=]+)\s*=\s*(\w{32})/, i)
                if (s) {
                    this.shareCode.push({
                        host: s[0].includes('isvjcloud.com') ? s[0] : `${s[0]}.isvjcloud.com`,
                        activityId: s[1],
                        type
                    })
                }
                else if (i.length == 32) {
                    let array = [
                        "lzkj-isv.isvjcloud.com",
                        "cjhy-isv.isvjcloud.com",
                    ]
                    for (let j of array) {
                        switch (j) {
                            case "cjhy-isv.isvjcloud.com":
                                var h = await this.response({
                                        'url': `https://${j}/wxCollectionActivity/activity?activityId=${i}`,
                                    }
                                )
                                break
                            default:
                                var h = await this.response({
                                        'url': `https://${j}/wxCollectionActivity/activity2/${i}?activityId=${i}`,
                                    }
                                )
                                break
                        }
                        let shop = await this.curl({
                                'url': `https://${j}/wxCollectionActivity/shopInfo`,
                                'form': `activityId=${i}`,
                                cookie: h.cookie
                            }
                        )
                        if (this.haskey(shop, 'data.sid')) {
                            this.shareCode.push(
                                {
                                    host: j,
                                    activityId: i,
                                    venderId: shop.data.sid,
                                    type
                                }
                            )
                            break
                        }
                    }
                }
            }
        }
        for (let i of this.shareCode) {
            if (!i.venderId) {
                switch (i.host) {
                    case "cjhy-isv.isvjcloud.com":
                        var h = await this.response({
                                'url': `https://${i.host}/wxCollectionActivity/activity?activityId=${i.activityId}`,
                            }
                        )
                        break
                    default:
                        var h = await this.response({
                                'url': `https://${i.host}/wxCollectionActivity/activity2/${i.activityId}?activityId=${i.activityId}`,
                            }
                        )
                        break
                }
                let shop = await this.curl({
                        'url': `https://${i.host}/wxCollectionActivity/shopInfo`,
                        'form': `activityId=${i.activityId}`,
                        cookie: h.cookie
                    }
                )
                console.log(shop)
                if (this.haskey(shop, 'data.sid')) {
                    i.venderId = shop.data.sid
                }
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
        switch (host) {
            case "cjhy-isv.isvjcloud.com":
                var h = await this.response({
                        'url': `https://${host}/wxCollectionActivity/activity?activityId=${activityId}`,
                    }
                )
                break
            default:
                var h = await this.response({
                        'url': `https://${host}/wxCollectionActivity/activity2/${activityId}?activityId=${activityId}`,
                    }
                )
                break
        }
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
        var getPin = await this.response({
                'url': `https://${host}/customer/getMyPing`,
                form: `userId=${venderId}&token=${isvObfuscator.token}&fromType=APP`,
                cookie: info.cookie
            }
        )
        if (!this.haskey(getPin, 'content.data.secretPin')) {
            console.log(`可能是黑号或者黑ip,停止运行`)
            return
        }
        switch (host) {
            case "cjhy-isv.isvjcloud.com":
                var secretPin = escape(encodeURIComponent(getPin.content.data.secretPin))
                break
            default:
                var secretPin = encodeURIComponent(getPin.content.data.secretPin)
                break
        }
        console.log(`secretPin`, secretPin)
        let activityContent = await this.response({
                'url': `https://${host}/wxCollectionActivity/activityContent`,
                'form': `pin=${secretPin}&activityId=${activityId}`,
                cookie: `${info.cookie};${getPin.cookie}`
            }
        )
        let need = this.haskey(activityContent, 'content.data.needCollectionSize')
        let has = this.haskey(activityContent, 'content.data.hasCollectionSize')
        let member = await this.response({
                'url': `https://${host}/wxCommonInfo/getActMemberInfo`,
                'form': `venderId=${venderId}&activityId=${activityId}&pin=${secretPin}`,
                cookie: `${activityContent.cookie};${getPin.cookie}`
            }
        )
        // console.log(member)
        let skus = await this.curl({
                'url': `https://${host}/act/common/findSkus`,
                'form': `actId=${activityId}&userId=${venderId}&type=6`,
                cookie: `${info.cookie};${getPin.cookie}`
            }
        )
        let skuList = this.column(skus.skus, 'skuId').map(d => d.toString())
        let wxFollow = await this.response({
                'url': `https://${host}/wxActionCommon/followShop`,
                'form': `userId=${venderId}&buyerNick=${secretPin}&activityId=${activityId}&activityType=6`,
                cookie: `${info.cookie};${getPin.cookie}`
            }
        )
        // console.log(wxFollow)
        console.log(`加购列表: ${this.dumps(skuList)}`)
        switch (host) {
            case "cjhy-isv.isvjcloud.com":
                cookie = `${member.cookie};${getPin.cookie}`
                for (let k of skuList) {
                    let addOne = await this.response({
                            'url': `https://${host}/wxCollectionActivity/addCart`,
                            'form': `activityId=${activityId}&pin=${secretPin}&productId=${k}`,
                            cookie
                        }
                    )
                    console.log(`加购: ${k}`)
                    console.log(addOne)
                    if (this.haskey(addOne, 'data.hasAddCartSize') == need) {
                        break
                    }
                    cookie = `${addOne.cookie};AUTH_C_USER=${getPin.content.data.secretPin};`
                }
                break
            default:
                for (let z = 0; z<3; z++) {
                    var add = await this.response({
                            'url': `https://${host}/wxCollectionActivity/oneKeyAddCart`,
                            form: `activityId=${activityId}&pin=${secretPin}&productIds=${this.dumps(this.column(skus.skus, 'skuId'))}`,
                            cookie: `${member.cookie};${getPin.cookie}`
                        }
                    )
                    await this.wait(1000)
                }
                cookie = `${add.cookie};AUTH_C_USER=${getPin.content.data.secretPin};`
                break
        }
        // info = await this.response({
        //         'url': `https://${host}/customer/getSimpleActInfoVo`,
        //         form: `activityId=${activityId}`,
        //         cookie: h.cookie
        //     }
        // )
        console.log("加购有延迟,等待3秒...")
        await this.wait(3000)
        let getPrize = await this.curl({
                'url': `https://${host}/wxCollectionActivity/getPrize`,
                form: `activityId=${activityId}&pin=${secretPin}`,
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
        let s = await this.curl({
                'url': `https://wq.jd.com/deal/mshopcart/rmvCmdy?sceneval=2&g_login_type=1&g_ty=ajax`,
                'form': `pingouchannel=0&commlist=123,,1,123,11,123,0,skuUuid:aaa@@useUuid:0&type=0&checked=0&locationid=&templete=1&reg=1&scene=0&version=20190418&traceid=1394319544881167891&tabMenuType=1&sceneval=2`,
                cookie: p.cookie
            }
        )
        let list = []
        let name = []
        let n = 0
        try {
            let cart = s.cart.venderCart
            for (let i of cart) {
                for (let items of i.sortedItems) {
                    for (let products of items.polyItem.products) {
                        if (skuList.includes(products.mainSku.id.toString())) {
                            if (this.haskey(items, 'polyItem.promotion.pid')) {
                                list.push(`${products.mainSku.id},,1,${products.mainSku.id},11,${items.polyItem.promotion.pid},0,skuUuid:${products.skuUuid}@@useUuid:0`)
                            }
                            else {
                                list.push(
                                    `${products.mainSku.id},,1,${products.mainSku.id},1,,0,skuUuid:${products.skuUuid}@@useUuid:0`
                                )
                            }
                            name.push(
                                `${products.mainSku.id} -- ${products.mainSku.name}`
                            )
                            n++
                        }
                    }
                }
            }
        } catch (e) {
        }
        if (list.length) {
            s = await this.curl({
                    'url': `https://wq.jd.com/deal/mshopcart/rmvCmdy?sceneval=2&g_login_type=1&g_ty=ajax`,
                    'form': `pingouchannel=0&commlist=${list.join("$")}&checked=0&locationid=&templete=1&reg=1&scene=0&version=20190418&traceid=&tabMenuType=1&sceneval=2`,
                    cookie: p.cookie
                }
            )
            console.log(`删除购物车商品数: ${list.length}`)
        }
    }
}

module.exports = Main;
