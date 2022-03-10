const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东无线活动整合"
        this.task = 'active'
        this.verify = 1
        this.manual = 1
        this.readme = `filename_custom="url|id"\n如果显示The ShareCode is empty...\n就是你IP黑了,暂时无法访问活动\n更换ip或者等服务器解除限制方可运行\n如需开卡,filename_expand="openCard"`
        this.import = ['fs', 'jdAlgo']
        this.model = 'user'
        this.filter = "activityId"
    }

    async prepare() {
        this.assert(this.custom, '请先添加环境变量')
        let custom = this.getValue('custom')
        this.algo = new this.modules.jdAlgo({
            appId: "8adfb",
            type: 'app',
            fp: "8389547038003203",
        })
        for (let i of custom) {
            let query = this.query(i, '&', 1)
            if (query.actId && i.includes('exchangeActDetail')) {
                query.type = 'exchangeActDetail'
                query.activityId = query.actId
                query.host = this.match(/\/\/([^\/]+)\//, i)
                this.shareCode.push(query)
            }
            else {
                let s = this.match(/\/\/([^\/]+)\/.+?(\w{32})/, i)
                if (s) {
                    this.code.push({
                        host: s[0],
                        activityId: s[1],
                    })
                }
                else {
                    s = this.match(/\s*([^\=]+)\s*=\s*(\w{32})/, i)
                    if (s) {
                        this.code.push({
                            host: s[0].includes('isvjcloud.com') ? s[0] : `${s[0]}.isvjcloud.com`,
                            activityId: s[1],
                        })
                    }
                    else if (i.length == 32) {
                        this.code.push({
                            activityId: i
                        })
                    }
                    else {
                        let n = this.match(/(\d{12,17})/, i)
                        if (n) {
                            this.code.push({
                                activityId: n
                            })
                        }
                        else {
                            s = this.match(/(\w{24})/, i)
                            this.code.push({
                                activityId: s
                            })
                        }
                    }
                }
            }
            let array = [
                "lzkj-isv.isvjcloud.com",
                "cjhy-isv.isvjcloud.com",
            ]
            let shopArray = [
                'txzj-isv.isvjcloud.com'
            ]
            for (let i of this.code) {
                if (i.activityId.length == 32) {
                    for (let host of array) {
                        let p = await this.response({
                                'url': `https://${host}/wxCommonInfo/token`,
                            }
                        )
                        var s = await this.curl({
                                'url': `https://${host}/customer/getSimpleActInfoVo`,
                                'form': `activityId=${i.activityId}`,
                                cookie: p.cookie
                            }
                        )
                        if (!this.haskey(s, 'data')) {
                            switch (host) {
                                case "cjhy-isv.isvjcloud.com":
                                    var h = await this.response({
                                            'url': `https://${host}/wxCollectionActivity/activity?activityId=${i.activityId}`,
                                        }
                                    )
                                    break
                                default:
                                    var h = await this.response({
                                            'url': `https://${host}/wxCollectionActivity/activity2/${i.activityId}?activityId=${i.activityId}`,
                                        }
                                    )
                                    break
                            }
                            s = await this.curl({
                                    'url': `https://${host}/customer/getSimpleActInfoVo`,
                                    form: `activityId=${i.activityId}`,
                                    cookie: h.cookie
                                }
                            )
                        }
                        if (this.haskey(s, 'data')) {
                            let data = s.data
                            data.host = host
                            switch (data.activityType) {
                                case 5:
                                case 6:
                                    data.type = 'wxCollectionActivity'
                                    data.title = "加购有礼"
                                    data.pageUrl = `https://${host}/wxCollectionActivity/activity2/${i.activityId}?activityId=${i.activityId}`
                                    break
                                case 11:
                                case 12:
                                case 13:
                                    data.type = 'wxDrawActivity'
                                    data.title = "幸运大转盘"
                                    data.pageUrl = `https://${host}/${data.type}/activity?activityId=${i.activityId}`
                                    break
                                case 24:
                                case 73:
                                    data.type = 'wxShopGift'
                                    data.title = "店铺礼包"
                                    break
                                case 46:
                                case 102:
                                case 100:
                                    data.type = 'wxTeam'
                                    data.title = "组队瓜分"
                                    break
                                case 26:
                                    data.type = 'wxPointDrawActivity'
                                    break
                                case 17:
                                    data.type = 'wxShopFollowActivity'
                                    data.title = "关注店铺"
                                    break
                                case 2001:
                                    data.type = 'drawCenter'
                                    data.title = '老虎抽奖机'
                                    break
                                case 7:
                                    data.type = 'wxGameActivity'
                                    // data.title = ""
                                    break
                                case 65:
                                    data.type = 'wxBuildActivity'
                                    data.tittle = "盖楼有礼"
                                    data.pageUrl = `https://${host}/wxBuildActivity/activity?activityId=${i.activityId}`
                                    break
                                case 15:
                                    // case 16:
                                    data.type = 'sign'
                                    data.title = "签到有礼"
                                    data.pageUrl = `https://${host}/sign/signActivity2?activityId=${i.activityId}`
                                    break
                                case 18:
                                    data.type = 'sevenDay'
                                    data.title = "七天签到"
                                    break
                                case 400:
                                    data.type = 'microDz'
                                    data.title = "微定制"
                                    break
                                // case 40:
                                //     data.type = 'wxInviteActivity'
                                //     data.title = "邀请关注有礼"
                                //     data.pageUrl = `https://${host}/wxInviteActivity/invitee?activityId=${i.activityId}`
                                //     break
                            }
                            if (!data.pageUrl) {
                                data.pageUrl = i.activityId
                            }
                            let shopInfo = await this.curl({
                                    'url': `https://api.m.jd.com/?functionId=lite_getShopHomeBaseInfo&body={"shopId":"${data.shopId}","venderId":"${data.venderId}","source":"appshop"}&t=1646398923902&appid=jdlite-shop-app&client=H5`,
                                }
                            )
                            if (this.haskey(shopInfo, 'result.shopInfo.shopName')) {
                                data.shopName = shopInfo.result.shopInfo.shopName
                            }
                            if (['wxTeam'].includes(data.type)) {
                                await this.wxTeam(data)
                            }
                            else if (['microDz'].includes(data.type)) {
                                await this.microDz(data)
                            }
                            else {
                                this.shareCode.push(data)
                            }
                            break
                        }
                    }
                }
                else if (!isNaN(i.activityId)) {
                    let venderId = i.activityId.substr(4, i.activityId.length - 6)
                    for (let host of array) {
                        let token = await this.response({
                                'url': `https://${host}/wxCommonInfo/token`,
                            }
                        )
                        let s = await this.curl({
                                'url': `https://${host}/pointExchange/activityContent`,
                                'form': `activityId=${i.activityId}&pin=werwr36235244`,
                                cookie: token.cookie
                            }
                        )
                        if (this.haskey(s, 'data.activity')) {
                            this.shareCode.push({
                                "venderId": venderId,
                                "activityId": i.activityId,
                                type: 'pointExchange',
                                host
                            })
                            break
                        }
                    }
                }
            }
        }
        if (this.shareCode.length<1) {
            console.log("没获取到数据,可能IP黑了或者类型不支持")
        }
    }

    async main(p) {
        let type = p.inviter.type
        if (type == 'exchangeActDetail') {
            await this.rType(p)
        }
        else {
            await this.dType(p)
        }
    }

    async dType(p) {
        let pin = this.userPin(p.cookie)
        let host = p.inviter.host
        let activityId = p.inviter.activityId
        let at = p.inviter.activityType
        let type = p.inviter.type
        console.log(`活动ID: ${activityId}`)
        this.assert(type, "不支持的活动类型")
        let venderId = p.inviter.venderId
        let shopId = p.inviter.shopId
        if (p.inviter.pageUrl) {
            console.log(`活动地址: ${p.inviter.pageUrl}`)
        }
        if (p.inviter.shopName) {
            console.log(`活动店铺: ${p.inviter.shopName}`)
        }
        let gifts = []
        let skuList = []
        let getPin = await this.getMyPing(p)
        if (!getPin) {
            return
        }
        var secretPin = getPin.content.data.secretPin
        let sp = getPin.content.data.secretPin
        if (this.getValue('expand').includes('openCard')) {
            for (let kk of Array(3)) {
                var o = await this.algo.curl({
                        'url': `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"${venderId}","shopId":"${shopId}","bindByVerifyCodeFlag":1,"registerExtend":{"v_birthday":"${this.rand(1990, 2002)}-07-${this.rand(10, 28)}"},"writeChildFlag":0,"activityId":${p.inviter.jdActivityId},"channel":8016}&clientVersion=9.2.0&client=H5&uuid=88888`,
                        // 'form':``,
                        cookie: p.cookie
                    }
                )
                if (o.success) {
                    break
                }
            }
            console.log(`开卡中`, o.success)
        }
        switch (host) {
            case "cjhy-isv.isvjcloud.com":
                secretPin = escape(encodeURIComponent(secretPin))
                break
            default:
                secretPin = encodeURIComponent(secretPin)
                break
        }
        let pageUrl = encodeURIComponent(`https://${host}/sign/signActivity?activityId=${activityId}&venderId=${venderId}`)
        let log = await this.response({
                'url': `https://${host}/common/accessLog`,
                'form': `venderId=${venderId}&code=${at}&pin=${secretPin}&activityId=${activityId}&pageUrl=${pageUrl}&subType=app`,
                cookie: getPin.cookie
            }
        )
        if (['sign'].includes(type)) {
            let signUp = await this.curl({
                    'url': `https://${host}/sign/wx/signUp`,
                    'form': `venderId=${venderId}&pin=${secretPin}&actId=${activityId}`,
                    cookie: getPin.cookie
                }
            )
            if (this.haskey(signUp, 'gift.giftName')) {
                console.log(`获得: ${signUp.gift.giftName}`)
                gifts.push(signUp.gift.giftName)
            }
            else {
                console.log(signUp.errorMessage || signUp.msg || "什么也没有")
            }
        }
        else if (['sevenDay'].includes(type)) {
            let signUp = await this.curl({
                    'url': `https://${host}/sign/${type}/wx/signUp`,
                    'form': `venderId=${venderId}&pin=${secretPin}&actId=${activityId}`,
                    cookie: getPin.cookie
                }
            )
            if (this.haskey(signUp, 'signResult.gift.giftName')) {
                console.log(`获得: ${signUp.signResult.gift.giftName}`)
                gifts.push(signUp.signResult.gift.giftName)
            }
            else {
                console.log(signUp.errorMessage || signUp.msg || "什么也没有")
            }
        }
        else {
            let signUuid = p.inviter.signUuid
            if (['microDz'].includes(type)) {
                // 这边不做限制
            }
            else {
                var url = `https://${host}/${type}/activityContent`
                var activityContent = await this.response({
                        url,
                        'form': `pin=${secretPin}&activityId=${activityId}&buyerPin=${secretPin}&signUuid=${signUuid}&nick=${pin}`,
                        cookie: `${getPin.cookie};`
                    }
                )
                // console.log(activityContent.content.data)
                if (!this.haskey(activityContent, 'content.result')) {
                    console.log(activityContent.content.errorMessage)
                    return
                }
            }
            let need = this.haskey(activityContent, 'content.data.needCollectionSize')
            let has = this.haskey(activityContent, 'content.data.hasCollectionSize')
            let skus = await this.curl({
                    'url': `https://${host}/act/common/findSkus`,
                    'form': `actId=${activityId}&userId=${venderId}&type=${p.inviter.activityType}`,
                    cookie: `${getPin.cookie}`
                }
            )
            let wxFollow = await this.response({
                    'url': `https://${host}/wxActionCommon/followShop`,
                    'form': `userId=${venderId}&buyerNick=${secretPin}&activityId=${activityId}&activityType=${p.inviter.activityType}`,
                    cookie: `${getPin.cookie}`
                }
            )
            skuList = this.column(skus.skus, 'skuId').map(d => d.toString())
            if (!['wxTeam'].includes(type)) {
                if (skuList.length) {
                    console.log(`加购列表: ${this.dumps(skuList)}`)
                }
            }
            if (['wxCollectionActivity'].includes(type)) {
                switch (host) {
                    case "cjhy-isv.isvjcloud.com":
                        cookie = `${getPin.cookie}`
                        for (let k of skuList) {
                            let addOne = await this.response({
                                    'url': `https://${host}/wxCollectionActivity/addCart`,
                                    'form': `activityId=${activityId}&pin=${secretPin}&productId=${k}`,
                                    cookie
                                }
                            )
                            console.log(`加购: ${k}`)
                            if (this.haskey(addOne, 'content.data.hasAddCartSize') == need) {
                                break
                            }
                            if (this.haskey(addOne, 'content.errorMessage').includes('异常')) {
                                console.log(addOne.content.errorMessage)
                                return
                            }
                            var cookie = `${addOne.cookie};AUTH_C_USER=${secretPin};`
                        }
                        break
                    default:
                        for (let z = 0; z<4; z++) {
                            var add = await this.response({
                                    'url': `https://${host}/wxCollectionActivity/oneKeyAddCart`,
                                    form: `activityId=${activityId}&pin=${secretPin}&productIds=${this.dumps(this.column(skus.skus, 'skuId'))}`,
                                    cookie: `${getPin.cookie}`
                                }
                            )
                            await this.wait(1000)
                        }
                        if (add.cookie) {
                            var cookie = `${add.cookie};AUTH_C_USER=${secretPin};`
                        }
                        break
                }
                if (skuList.length) {
                    console.log("加购有延迟,等待3秒...")
                    await this.wait(3000)
                }
                while (true) {
                    for (let nn = 0; nn<3; nn++) {
                        var getPrize = await this.curl({
                                'url': `https://${host}/wxCollectionActivity/getPrize`,
                                form: `activityId=${activityId}&pin=${secretPin}`,
                                cookie
                            }
                        )
                        if (getPrize.errorMessage && (getPrize.errorMessage.includes("擦肩") || getPrize.errorMessage.includes("未达到领奖条件"))) {
                            console.log('奖品与您擦肩而过了哟,重新获取')
                            await this.wait(1000)
                        }
                        else {
                            break
                        }
                    }
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        gifts.push(getPrize.data.name)
                    }
                    else {
                        console.log(getPrize.errorMessage || getPrize.msg || "什么也没有")
                    }
                    if (!this.haskey(getPrize, 'data.canDrawTimes')) {
                        break
                    }
                }
            }
            else if (['drawCenter'].includes(type)) {
                while (true) {
                    let getPrize = await this.curl({
                            'url': `https://${host}/drawCenter/draw/luckyDraw`,
                            form: `activityId=${activityId}&pin=${secretPin}`,
                            cookie: getPin.cookie
                        }
                    )
                    // console.log(getPrize)
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        gifts.push(getPrize.data.name)
                    }
                    else {
                        console.log(getPrize.errorMessage || getPrize.msg || "什么也没有")
                    }
                    if (!this.haskey(getPrize, 'data.canDrawTimes')) {
                        break
                    }
                }
            }
            else if (['wxDrawActivity', 'wxPointDrawActivity'].includes(type)) {
                while (true) {
                    let draw = await this.curl({
                            'url': `https://${host}/${type}/start`,
                            'form': `pin=${secretPin}&activityId=${activityId}`,
                            cookie: `${getPin.cookie}`
                        }
                    )
                    // console.log(draw)
                    if (this.haskey(draw, 'data.drawOk')) {
                        gifts.push(draw.data.drawInfo.name)
                        console.log(`获得奖品: ${draw.data.drawInfo.name} ${draw.data.drawInfo.priceInfo}`)
                    }
                    else {
                        console.log(draw.errorMessage || draw.msg || "什么也没有")
                    }
                    if (!this.haskey(draw, 'data.canDrawTimes')) {
                        break
                    }
                }
            }
            else if (['wxShopGift'].includes(type)) {
                let ad = await this.response({
                        'url': `https://${host}/common/accessLogWithAD`,
                        'form': `venderId=${venderId}&code=24&pin=${encodeURIComponent(getPin.content.data.secretPin)}&activityId=${activityId}&pageUrl=https%3A%2F%2Flzkj-isv.isvjcloud.com%2FwxShopGift%2Factivity%3FactivityId%3D${activityId}`,
                        cookie: getPin.cookie
                    }
                )
                let ac = await this.response({
                        'url': `https://${host}/${type}/activityContent`,
                        'form': `activityId=${activityId}&buyerPin=${encodeURIComponent(getPin.content.data.secretPin)}`,
                        cookie: ad.cookie
                    }
                )
                let draw = await this.curl({
                        'url': `https://${host}/wxShopGift/draw`,
                        'form': `activityId=${activityId}&buyerPin=${encodeURIComponent(getPin.content.data.secretPin)}&hasFollow=false&accessType=app`,
                        cookie: ac.cookie
                    }
                )
                // console.log(draw)
                if (draw.result) {
                    console.log(this.haskey(ac.content, 'data.list') || ac.content)
                    let g = {
                        'jd': '京豆',
                        'jf': '积分',
                        'dq': `东券`,
                    }
                    for (let i of this.haskey(ac.content, 'data.list')) {
                        console.log(`获得: ${i.takeNum}${g[i.type]}`)
                        gifts.push(
                            `${i.takeNum}${g[i.type]}`
                        )
                    }
                }
                else {
                    console.log(draw.errorMessage || draw.msg || `什么也没有`)
                }
            }
            else if (['wxShopFollowActivity'].includes(type)) {
                while (true) {
                    let getPrize = await this.curl({
                            'url': `https://${host}/${type}/getPrize`,
                            form: `activityId=${activityId}&pin=${secretPin}`,
                            cookie: getPin.cookie
                        }
                    )
                    // console.log(getPrize)
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        gifts.push(getPrize.data.name)
                    }
                    else {
                        console.log(getPrize.errorMessage || getPrize.msg || "什么也没有")
                    }
                    if (!this.haskey(getPrize, 'data.canDrawTimes')) {
                        break
                    }
                }
            }
            else if (['wxGameActivity'].includes(type)) {
                while (true) {
                    let getPrize = await this.curl({
                            'url': `https://${host}/${type}/gameOverRecord`,
                            form: `activityId=${activityId}&pin=${secretPin}&score=${this.rand(1000, 100000)}`,
                            cookie: getPin.cookie
                        }
                    )
                    // console.log(getPrize)
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        gifts.push(getPrize.data.name)
                    }
                    else {
                        console.log(getPrize.errorMessage || getPrize.msg || "什么也没有")
                    }
                    if (!this.haskey(getPrize, 'data.canDrawTimes')) {
                        break
                    }
                }
            }
            else if (['wxBuildActivity'].includes(type)) {
                while (true) {
                    let content = "很好!"
                    if (this.haskey(activityContent, 'content.data.words')) {
                        content = this.random(activityContent.content.data.words, 1)[0].content
                    }
                    let c = await this.response({
                            'url': `https://${host}/${type}/currentFloor`,
                            'form': `activityId=${activityId}`,
                            cookie: getPin.cookie
                        }
                    )
                    if (this.haskey(c, 'content.data.currentFloors')) {
                        console.log(`盖楼楼层: ${c.content.data.currentFloors}`)
                    }
                    let getPrize = await this.curl({
                            'url': `https://${host}/${type}/publish`,
                            'form': `pin=${secretPin}&activityId=${activityId}&content=${encodeURIComponent(content)}`,
                            cookie: c.cookie
                        }
                    )
                    // console.log(getPrize)
                    if (this.haskey(getPrize, 'data.drawResult.drawOk')) {
                        console.log(`获得: ${getPrize.data.drawResult.name}`)
                        gifts.push(getPrize.data.drawResult.name)
                    }
                    else {
                        console.log(getPrize.errorMessage || getPrize.msg || "什么也没有")
                    }
                    if (!this.haskey(getPrize, 'data.drawResult.canDrawTimes')) {
                        break
                    }
                }
            }
            else if (['wxTeam'].includes(type)) {
                if (this.haskey(activityContent, 'content.data.canJoin')) {
                    console.log("入会有延迟,等待3秒...")
                    await this.wait(3000)
                    let join = await this.curl({
                            'url': `https://${host}/${type}/saveMember`,
                            'form': `pin=${secretPin}&activityId=${activityId}&signUuid=${signUuid}&pinImg=${encodeURIComponent('https://storage.jd.com/karma/image/20220112/1dafd93018624d74b5f01f82c9ac97b0.png')}`,
                            cookie: getPin.cookie
                        }
                    )
                    console.log(join)
                    if (this.dumps(join).includes("满员")) {
                        this.finish.push(p.number)
                    }
                }
                else {
                    console.log('不能参团,或者已经参加过活动')
                }
            }
            else if (['pointExchange'].includes(type)) {
                let g = await this.response({
                        'url': `https://${host}/common/pointRedeem/getGiftList`,
                        'form': `pin=${secretPin}&venderId=${venderId}`,
                        cookie: getPin.cookie
                    }
                )
                if (this.haskey(g, 'content.point')) {
                    let point = g.content.point
                    console.log('有积分:', point)
                    let reward = await this.curl({
                            'url': `https://${host}/pointExchange/exchange`,
                            'form': `pin=${secretPin}&activityId=${venderId}&beanCount=${point}`,
                            cookie: getPin.cookie
                        }
                    )
                    console.log(reward)
                }
                else {
                    console.log("没有积分可以兑换")
                }
            }
            else if (['microDz'].includes(type)) {
                let f = await this.curl({
                        'url': `https://${host}/microDz/invite/activity/wx/acceptInvite
                        `,
                        'form': `activityId=${activityId}&invitee=${secretPin}&inviteeNick=${pin}&inviteeImg=${encodeURIComponent('https://storage.jd.com/karma/image/20220112/1dafd93018624d74b5f01f82c9ac97b0.png')}&inviter=${p.inviter.inviter}&inviterNick=${p.inviter.inviterNick}&inviterImg=${p.inviter.imgUrl}`,
                        cookie: getPin.cookie
                    }
                )
                if (f.result) {
                    console.log("加团成功")
                    for (let kkk of this.venderIds || []) {
                        for (let kk of Array(3)) {
                            var o = await this.algo.curl({
                                    'url': `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"${kkk}","shopId":"","bindByVerifyCodeFlag":1,"registerExtend":{"v_birthday":"${this.rand(1990, 2002)}-07-${this.rand(10, 28)}"},"writeChildFlag":0,"activityId":"","channel":8016}&clientVersion=9.2.0&client=H5&uuid=88888`,
                                    cookie: p.cookie
                                }
                            )
                            if (o.success) {
                                break
                            }
                        }
                        console.log(kkk, `开卡中`, o.success)
                    }
                }
                else {
                    console.log(f.errorMessage)
                }
            }
        }
        if (gifts.length) {
            gifts.unshift(`活动店铺: ${p.inviter.shopName}\n活动链接: ${p.inviter.pageUrl}`)
            this.notices(gifts.join("\n"), p.user)
        }
        await this.curl({
            'url': 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=518274330',
            'form': `functionId=followShop&body={"follow":"false","shopId":"${shopId}","venderId":"${venderId}","award":"true","sourceRpc":"shop_app_home_follow"}&osVersion=13.7&appid=wh5&clientVersion=9.2.0&loginType=2&loginWQBiz=interact`,
            cookie: p.cookie
        })
        if (skuList.length) {
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

    async rType(p) {
        let pin = this.userPin(p.cookie)
        let host = p.inviter.host
        let activityId = p.inviter.activityId
        console.log(`活动ID: ${activityId}`)
        let at = p.inviter.activityType
        let type = p.inviter.type
        this.assert(type, "不支持的活动类型")
        let venderId = p.inviter.venderId
        let shopId = p.inviter.shopId
        if (p.inviter.pageUrl) {
            console.log(`活动地址: ${p.inviter.pageUrl}`)
        }
        if (p.inviter.shopName) {
            console.log(`活动店铺: ${p.inviter.shopName}`)
        }
        let gifts = []
        let skuList = []
        if (type == 'exchangeActDetail') {
            let isvObfuscator = await this.curl({
                url: 'https://api.m.jd.com/client.action',
                form: 'functionId=isvObfuscator&body=%7B%22id%22%3A%22%22%2C%22url%22%3A%22https%3A%2F%2Fddsj-dz.isvjcloud.com%22%7D&uuid=5162ca82aed35fc52e8&client=apple&clientVersion=10.0.10&st=1631884203742&sv=112&sign=fd40dc1c65d20881d92afe96c4aec3d0',
                cookie: p.cookie
            })
            let reward = await this.curl({
                    'url': `https://${host}/ql/front/postQlExchange`,
                    'form': `act_id=9e8080cd7f4f2d0f017f68437a964e83&user_id=618229`,
                    cookie: `IsvToken=${isvObfuscator.token}`,
                    headers: {
                        'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
                    }
                }
            )
            console.log(this.dumps(reward))
            return
        }
    }

    async microDz(data) {
        data.sid = 599119
        for (let cookie of this.cookies['help']) {
            let p = {
                cookie, inviter: data
            }
            let user = this.userPin(cookie)
            try {
                for (let nnn = 0; nnn<2; nnn++) {
                    var getPin = await this.getMyPing(p)
                    if (getPin) {
                        break
                    }
                }
                if (getPin) {
                    let venderId = p.inviter.venderId
                    let shopId = p.inviter.shopId
                    var secretPin = getPin.content.data.secretPin
                    let activityId = p.inviter.activityId
                    let host = p.inviter.host
                    switch (host) {
                        case "cjhy-isv.isvjcloud.com":
                            secretPin = escape(encodeURIComponent(secretPin))
                            break
                        default:
                            secretPin = encodeURIComponent(secretPin)
                            break
                    }
                    let acc = await this.curl({
                            'url': `https://${host}/microDz/invite/activity/wx/getActivityInfo`,
                            'form': `activityId=${activityId}`,
                            cookie: getPin.cookie
                        }
                    )
                    let venderIds = []
                    if (this.haskey(acc, 'data.venderIds')) {
                        venderIds = acc.data.venderIds.split(",")
                        this.venderIds = venderIds
                        if (this.getValue('expand').includes('openCard')) {
                            for (let kkk of venderIds) {
                                for (let kk of Array(3)) {
                                    var o = await this.algo.curl({
                                            'url': `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"${kkk}","shopId":"","bindByVerifyCodeFlag":1,"registerExtend":{"v_birthday":"${this.rand(1990, 2002)}-07-${this.rand(10, 28)}"},"writeChildFlag":0,"activityId":"","channel":8016}&clientVersion=9.2.0&client=H5&uuid=88888`,
                                            // 'form':``,
                                            cookie: p.cookie
                                        }
                                    )
                                    if (o.success) {
                                        break
                                    }
                                }
                                console.log(kkk, `开卡中`, o.success)
                            }
                        }
                    }
                    let inviter = await this.curl({
                            'url': `https://${host}/microDz/invite/activity/wx/inviteRecord`,
                            'form': `activityId=${activityId}&inviter=${secretPin}&pageNo=1&pageSize=15&type=0`,
                            cookie: getPin.cookie
                        }
                    )
                    if (this.haskey(inviter, 'data.inviterNick')) {
                        data.inviter = secretPin
                        data.venderIds = venderIds
                        this.shareCode.push({...data, ...inviter.data})
                    }
                }
            } catch (e) {
            }
        }
    }

    async wxTeam(data) {
        for (let cookie of this.cookies['help']) {
            let p = {
                cookie, inviter: data
            }
            let user = this.userPin(cookie)
            try {
                for (let nnn = 0; nnn<2; nnn++) {
                    var getPin = await this.getMyPing(p)
                    if (getPin) {
                        break
                    }
                }
                if (getPin) {
                    let venderId = p.inviter.venderId
                    let shopId = p.inviter.shopId
                    var secretPin = getPin.content.data.secretPin
                    let activityId = p.inviter.activityId
                    let host = p.inviter.host
                    if (this.getValue('expand').includes('openCard')) {
                        for (let kk of Array(3)) {
                            var o = await this.algo.curl({
                                    'url': `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"${venderId}","shopId":"${shopId}","bindByVerifyCodeFlag":1,"registerExtend":{"v_birthday":"${this.rand(1990, 2002)}-07-${this.rand(10, 28)}"},"writeChildFlag":0,"activityId":${p.inviter.jdActivityId},"channel":8016}&clientVersion=9.2.0&client=H5&uuid=88888`,
                                    cookie: p.cookie
                                }
                            )
                            if (o.success) {
                                break
                            }
                        }
                        console.log(user, `开卡中`, o.success)
                    }
                    switch (host) {
                        case "cjhy-isv.isvjcloud.com":
                            secretPin = escape(encodeURIComponent(secretPin))
                            break
                        default:
                            secretPin = encodeURIComponent(secretPin)
                            break
                    }
                    let wxFollow = await this.response({
                            'url': `https://${p.inviter.host}/wxActionCommon/followShop`,
                            'form': `userId=${venderId}&buyerNick=${secretPin}&activityId=${p.inviter.activityId}&activityType=${p.inviter.activityType}`,
                            cookie: `${getPin.cookie}`
                        }
                    )
                    let ac = await this.curl({
                            'url': `https://${host}/wxTeam/activityContent`,
                            'form': `activityId=${p.inviter.activityId}&pin=${secretPin}`,
                            cookie: getPin.cookie
                        }
                    )
                    if (this.haskey(ac, 'data.successRetList') && ac.data.successRetList.length == ac.data.active.maxGroup) {
                        console.log(user, "人员已满")
                    }
                    else {
                        if (this.haskey(ac, 'data.signUuid')) {
                            var signUuid = ac.data.signUuid
                        }
                        else {
                            let pageUrl = encodeURIComponent(`https://${host}/sign/signActivity?activityId=${p.inviter.activityId}&venderId=${venderId}`)
                            let log = await this.response({
                                    'url': `https://${host}/common/accessLog`,
                                    'form': `venderId=${venderId}&code=${p.inviter.activityType}&pin=${secretPin}&activityId=${p.inviter.activityId}&pageUrl=${pageUrl}&subType=app`,
                                    cookie: getPin.cookie
                                }
                            )
                            let catpain = await this.curl({
                                    'url': `https://${host}/wxTeam/saveCaptain`,
                                    'form': `activityId=${p.inviter.activityId}&pin=${secretPin}&pinImg=${encodeURIComponent('https://storage.jd.com/karma/image/20220112/1dafd93018624d74b5f01f82c9ac97b0.png')}`,
                                    cookie: getPin.cookie
                                }
                            )
                            if (this.haskey(catpain, 'data.signUuid')) {
                                var signUuid = catpain.data.signUuid
                            }
                        }
                        if (signUuid) {
                            console.log(`队伍Id: ${signUuid}`)
                            data.signUuid = signUuid
                            this.shareCode.push(data)
                        }
                        else {
                            console.log(user, '没有获取到队伍Id')
                        }
                    }
                }
            } catch (e) {
            }
        }
    }

    async getMyPing(p) {
        let host = p.inviter.host
        let activityId = p.inviter.activityId
        let at = p.inviter.activityType
        let type = p.inviter.type
        this.assert(type, "不支持的活动类型")
        let venderId = p.inviter.venderId
        let shopId = p.inviter.shopId
        let sid = p.inviter.sid || ''
        if (venderId) {
            let follow = await this.curl({
                'url': 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=518274330',
                'form': `functionId=followShop&body={"follow":"true","shopId":"${shopId}","venderId":"${venderId}","award":"true","sourceRpc":"shop_app_home_follow"}&osVersion=13.7&appid=wh5&clientVersion=9.2.0&loginType=2&loginWQBiz=interact`,
                cookie: p.cookie
            })
        }
        let isvObfuscator = await this.curl({
            url: 'https://api.m.jd.com/client.action',
            form: 'functionId=isvObfuscator&body=%7B%22id%22%3A%22%22%2C%22url%22%3A%22https%3A%2F%2Fddsj-dz.isvjcloud.com%22%7D&uuid=5162ca82aed35fc52e8&client=apple&clientVersion=10.0.10&st=1631884203742&sv=112&sign=fd40dc1c65d20881d92afe96c4aec3d0',
            cookie: p.cookie
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
        var getPin = await this.response({
                'url': `https://${host}/customer/getMyPing`,
                form: `userId=${sid || venderId}&token=${isvObfuscator.token}&fromType=APP`,
                cookie: info.cookie
            }
        )
        if (!this.haskey(getPin, 'content.data.secretPin')) {
            console.log(`可能是黑号或者黑ip,停止运行`)
            return
        }
        else {
            return getPin
        }
    }

    async extra() {
        if (this.venderIds.length) {
            for (let cookie of this.cookies[this.task]) {
                console.log(`正在运行: ${this.userPin(cookie)}`)
                for (let kkk of this.venderIds) {
                    for (let kk of Array(3)) {
                        var o = await this.algo.curl({
                                'url': `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"${kkk}","shopId":"","bindByVerifyCodeFlag":1,"registerExtend":{"v_birthday":"${this.rand(1990, 2002)}-07-${this.rand(10, 28)}"},"writeChildFlag":0,"activityId":"","channel":8016}&clientVersion=9.2.0&client=H5&uuid=88888`,
                                cookie
                            }
                        )
                        if (o.success) {
                            break
                        }
                    }
                    console.log(kkk, `开卡中`, o.success)
                }
            }
        }
    }
}

module.exports = Main;
