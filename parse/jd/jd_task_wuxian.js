const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东超级互动城"
        this.task = 'local'
        this.corn = "6.6.6.6"
        this.verify = 1
        this.manual = 1
        this.import = ['fs', 'jdAlgo', 'jdUrl', 'jdObf', 'fileCache']
        this.model = 'share'
        this.filter = "activityId"
    }

    async prepare() {
        this.fileExpire = this.haskey(this.fileCache, 'isvObfuscator_expire') || 1800
        this.fileSalt = this.haskey(this.fileCache, 'isvObfuscator_salt') || "abcdefg"
        this.cache = this.modules["fileCache"]
        await this.cache.connect({file: `${this.dirname}/temp/isvToken.json`})
        this.assert(this.custom, '请先添加环境变量')
        this.errMsg = new RegExp(`/奖品已发完|来晚了|全部被领取|明日再来|结束|优惠券|奖项已经领完|${this.profile.errMsg}/`)
        this.dict = this.profile
        this.dicts = {}
        this.isSend = []
        if (this.custom && typeof this.custom != 'object') {
            this.custom = this.custom.replace(/wuxian\s*/, "")
        }
        let custom = this.getValue('custom')
        this.algo = new this.modules.jdAlgo({
            appId: "8adfb",
            type: 'lite',
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
                let host = ''
                if (i.match(/:\/\/([^\/]+)/)) {
                    host = this.match(/:\/\/([^\/]+)/, i)
                    if (host == "cjhydz-isv.isvjcloud.com") {
                        host = "cjhy-isv.isvjcloud.com"
                    }
                }
                let acid = this.match([/(\w{32})/, /(\w{24,27})/, /(\d{12,17})/], i)
                if (acid) {
                    this.code.push({
                        activityId: acid, host
                    })
                }
                else {
                    let vid = this.match(/(\d+)/, i)
                    let u = await this.curl({
                            'url': `https://fjzy-isv.isvjcloud.com/index.php?mod=games&action=buyerTokenJson`,
                            'form': `buyerTokenJson={"state":"0","data":"","msg":""}&venderId=${vid}&yxId=5510`,
                        }
                    )
                    if (u.buyPin) {
                        this.code.push({
                            activityId: this.match(/(\d+)/, i),
                            title: '幸运大抽奖',
                            pageUrl: `https://fjzy-isv.isvjcloud.com/index.php?mod=games&c=redpape&venderId=${vid}&yxId=5510`,
                            type: "lucky", host
                        })
                    }
                }
            }
        }
        let array = [
            "lzkj-isv.isvjcloud.com",
            "cjhy-isv.isvjcloud.com",
        ]
        for (let i of this.code) {
            if (i.activityId.length == 32) {
                if (i.host) {
                    array = [i.host]
                }
                for (let host of array) {
                    switch (host) {
                        case "cjhy-isv.isvjcloud.com":
                            var h = await this.response({
                                    'url': `https://${host}/wxCollectionActivity/activity?activityId=${i.activityId}`,
                                    referer: `https://${host}/customer/getSimpleActInfoVo`,
                                }
                            )
                            break
                        default:
                            var h = await this.response({
                                    'url': `https://${host}/wxCollectionActivity/activity2/${i.activityId}?activityId=${i.activityId}`,
                                    referer: `https://${host}/customer/getSimpleActInfoVo`,
                                }
                            )
                            break
                    }
                    let s = await this.curl({
                            'url': `https://${host}/customer/getSimpleActInfoVo`,
                            form: `activityId=${i.activityId}`,
                            cookie: h.cookie,
                            referer: `https://${host}/customer/getSimpleActInfoVo`,
                        }
                    )
                    if (this.haskey(s, 'data')) {
                        let data = s.data
                        data.host = host
                        if (this.dict.activityType) {
                            data.activityType = parseInt(this.dict.activityType)
                        }
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
                                data.pageUrl = `https://${host}/wxShopGift/activity?activityId=${i.activityId}`
                                break
                            case 46:
                            case 102:
                            case 100:
                                data.type = 'wxTeam'
                                data.title = "组队瓜分"
                                data.pageUrl = `https://${host}/wxTeam/activity?activityId=${i.activityId}`
                                break
                            case 99:
                            case 99999:
                                data.title = "组队瓜分京豆"
                                data.type = 'pool'
                                data.pageUrl = `https://${host}/pool/captain/${i.activityId}?activityId=${i.activityId}`
                                break
                            case 26:
                                data.type = 'wxPointDrawActivity'
                                data.title = "抽奖赚积分"
                                data.pageUrl = `https://${host}/wxPointDrawActivity/activity?activityId=${i.activityId}`
                                break
                            case 17:
                                data.type = 'wxShopFollowActivity'
                                data.title = "关注店铺"
                                data.pageUrl = `https://${host}/wxShopFollowActivity/activity?activityId=${i.activityId}`
                                break
                            case 2001:
                            case 2003:
                            case 2004:
                                data.type = 'drawCenter'
                                data.title = '幸运抽奖'
                                data.pageUrl = `https://${host}/drawCenter/activity?activityId=${i.activityId}`
                                break
                            case 7:
                                data.type = 'wxGameActivity'
                                data.title = "无线游戏"
                                data.pageUrl = `https://${host}/wxGameActivity/activity?activityId=${i.activityId}`
                                break
                            case 65:
                                data.type = 'wxBuildActivity'
                                data.tittle = "盖楼有礼"
                                data.pageUrl = `https://${host}/wxBuildActivity/activity?activityId=${i.activityId}`
                                break
                            case 15:
                                data.type = 'sign'
                                data.title = "签到有礼"
                                data.pageUrl = `https://${host}/sign/signActivity2?activityId=${i.activityId}`
                                break
                            case 18:
                                data.type = 'sevenDay'
                                data.title = "七天签到"
                                data.pageUrl = `https://${host}/sign/sevenDay/signActivity?activityId=${i.activityId}`
                                break
                            case 400:
                            case 66666:
                                data.type = 'microDz'
                                data.title = "微定制"
                                data.pageUrl = `https://${host}/microDz/invite/activity/wx/view/index?activityId=${i.activityId}`
                                break
                            case 104:
                                data.type = "wxMcLevelAndBirthGifts"
                                data.title = "等级礼包"
                                data.pageUrl = `https://${host}/mc/wxMcLevelAndBirthGifts/activity?activityId=${i.activityId}`
                                break
                            // case 40:
                            //     data.type = 'wxInviteActivity'
                            //     data.title = "邀请关注有礼"
                            //     data.pageUrl = `https://${host}/wxInviteActivity/invitee?activityId=${i.activityId}`
                            //     break
                            case 16:
                                data.type = "daily"
                                data.title = "每日抢"
                                data.pageUrl = `https://${host}/activity/daily/wx/indexPage1/${i.activityId}?activityId=${i.activityId}`
                                break
                            // case 66:
                            //     data.type = "WxHbShareActivity"
                            //     data.title = "拼手气赢红包"
                            //     data.pageUrl = `https://${host}/WxHbShareActivity/view/activity/${i.activityId}?activityId=${i.activityId}`
                            //     break
                            case 204:
                                data.pageUrl = `https://${host}/mc/wxPointShopView/pointExgBeans?giftId=${i.activityId}`
                                data.title = "积分换豆"
                                data.type = 'wxPointShop'
                                break
                            case 42:
                                data.pageUrl = `https://${host}/wxCollectCard/activity?activityId=${i.activityId}`
                                data.title = "集卡有礼"
                                data.type = 'wxCollectCard'
                                break
                            case 69:
                                data.pageUrl = `https://${host}/wxFansInterActionActivity/activity/${i.activityId}?activityId=${i.activityId}`
                                data.title = "粉丝互动"
                                data.type = 'wxFansInterActionActivity'
                                break
                            case 25:
                                data.pageUrl = `https://${host}/wxShareActivity/activity/activity?activityId=${i.activityId}`
                                data.title = "分享有礼"
                                data.type = "wxShareActivity"
                                break
                            case 71:
                                data.pageUrl = `https://${host}/wxSecond/activity?activityId=${i.activityId}`
                                data.title = "拼手速"
                                data.type = "wxSecond"
                                break
                            // case 3:
                            //     data.pageUrl = `https://${host}/wxUnPackingActivity/activity/${i.activityId}?activityId=${i.activityId}`
                            //     data.title = "让福袋飞"
                            //     data.type = 'wxUnPackingActivity'
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
                        if (['wxTeam', 'microDz', 'WxHbShareActivity', 'wxCollectCard', 'wxUnPackingActivity', 'wxShareActivity'].includes(data.type)) {
                            await this[data.type](data)
                        }
                        else if (data.type == 'pool') {
                            await this.wxTeam(data)
                        }
                        else {
                            this.shareCode.push(data)
                        }
                        break
                    }
                    else {
                        let html = await this.curl({
                                'url': `https://${host}/pool/captain/${i.activityId}?activityId=${i.activityId}`,
                            }
                        )
                        if (html.includes("瓜分") || this.dict.activityType == '99999') {
                            let venderId = this.match(/id="venderId"\s*value="(\d+)"/, html)
                            if (venderId) {
                                let shopInfo = await this.curl({
                                        'url': `https://api.m.jd.com/?functionId=lite_getShopHomeBaseInfo&body={"venderId":"${venderId}","source":"appshop"}&t=1646398923902&appid=jdlite-shop-app&client=H5`,
                                    }
                                )
                                await this.wxTeam({
                                    activityId: i.activityId,
                                    pageUrl: `https://${host}/pool/captain/${i.activityId}?activityId=${i.activityId}`,
                                    title: "组队瓜分京豆",
                                    type: 'pool',
                                    host, venderId,
                                    shopId: shopInfo.result.shopInfo.shopId,
                                    shopName: shopInfo.result.shopInfo.shopName
                                })
                            }
                            break
                        }
                        else {
                            html = await this.curl({
                                    'url': `https://${host}/microDz/invite/activity/wx/view/index/${i.activityId}?activityId=${i.activityId}`,
                                }
                            )
                            if (html.includes("组队") || this.dict.activityType == '66666') {
                                await this.microDz({
                                    activityId: i.activityId,
                                    pageUrl: `https://${host}/microDz/invite/activity/wx/view/index/${i.activityId}?activityId=${i.activityId}`,
                                    title: "微定制",
                                    type: 'microDz',
                                    host,
                                })
                                break
                            }
                        }
                    }
                }
            }
            else if (!isNaN(i.activityId)) {
                if (this.haskey(i, 'type', 'lucky')) {
                    this.shareCode.push(i)
                }
                else {
                    let venderId = i.activityId.substr(4, i.activityId.length - 6)
                    for (let host of array) {
                        let token = await this.response({
                                'url': `https://${host}/wxCommonInfo/token`,
                                referer: `https://${host}/`
                            }
                        )
                        let s = await this.curl({
                                'url': `https://${host}/pointExchange/activityContent`,
                                'form': `activityId=${i.activityId}&pin=werwr36235244`,
                                cookie: token.cookie,
                                referer: `https://${host}/`
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
        else {
            if (this.profile.noCache) {
                let shareCode = this.shareCode
                this.shareCode = []
                this.cacheId = []
                try {
                    let txt = this.modules.fs.readFileSync(`${this.dirname}/temp/${this.filename}.txt`).toString()
                    this.cacheId = txt.split("\n").map(d => d)
                } catch (e) {
                }
                for (let i of shareCode) {
                    // 检测到不缓存类型,直接push
                    if (this.profile.noCache.includes(i.type)) {
                        this.cacheId.push(i.activityId)
                        this.shareCode.push(i)
                    }
                    else {
                        if (this.cacheId.includes(i.activityId)) {
                            console.log(`跳过运行: ${i.activityId} 已经在${this.filename}.txt里面了哦,类型为: ${i.type}`)
                        }
                        else {
                            this.cacheId.push(i.activityId)
                            this.shareCode.push(i)
                        }
                    }
                }
            }
        }
    }

    async main(p) {
        let cookie = p.cookie
        let type = p.inviter.type
        let text = ''
        if (!this.isSend.includes(this.md5(`${p.inviter.activityId},${p.inviter.signUuid}`))) {
            text = `🐽🐽\n活动店铺: ${p.inviter.shopName}\n活动地址: ${p.inviter.pageUrl}\n活动ID: ${p.inviter.activityId}\n活动名称: ${p.inviter.title}\n活动类型: ${p.inviter.type}`
            if (p.inviter.signUuid) {
                text += `\n${p.inviter.signUuid}`
            }
            this.isSend.push(
                this.md5(`${p.inviter.activityId},${p.inviter.signUuid}`)
            )
            this.notices(text, "当前活动信息")
        }
        if (type == 'exchangeActDetail') {
            await this.rType(p)
        }
        else if (type == 'lucky') {
            await this.lType(p)
        }
        else {
            await this.dType(p)
        }
    }

    async dType(p) {
        let pin = this.userPin(p.cookie)
        let host = p.inviter.host
        let activityId = p.inviter.activityId
        if (this.dict[activityId]) {
            this.finish.push(p.number)
            console.log("检测到活动已经结束")
            return
        }
        let jdActivityId = p.inviter.jdActivityId
        let at = p.inviter.activityType
        let type = p.inviter.type
        let signUuid = p.inviter.signUuid
        console.log(`活动ID: ${activityId}`)
        this.assert(type, "不支持的活动类型")
        this.options.headers.referer = p.inviter.pageUrl || `https://${host}`
        let venderId = p.inviter.venderId
        let shopId = p.inviter.shopId
        if (p.inviter.pageUrl) {
            console.log(`活动地址: ${p.inviter.pageUrl}`)
        }
        if (p.inviter.shopName) {
            console.log(`活动店铺: ${p.inviter.shopName}`)
        }
        let skuList = []
        let getPin = await this.getMyPing(p)
        if (!getPin) {
            return
        }
        var secretPin = getPin.content.data.secretPin
        let sp = getPin.content.data.secretPin
        // 判断开卡
        if (this.dict.openCard && venderId && !['pool'].includes(type)) {
            await this.bindWithVender(venderId, jdActivityId, p.cookie)
        }
        switch (host) {
            case "cjhy-isv.isvjcloud.com":
                secretPin = escape(encodeURIComponent(secretPin))
                break
            default:
                secretPin = encodeURIComponent(secretPin)
                break
        }
        // 认证getPin信息
        let pageUrl = encodeURIComponent(`https://${host}/sign/signActivity?activityId=${activityId}&venderId=${venderId}`)
        let log = await this.response({
                'url': `https://${host}/common/accessLog`,
                'form': `venderId=${venderId || 1}&code=${at || 99}&pin=${secretPin}&activityId=${activityId}&pageUrl=${pageUrl}&subType=app`,
                cookie: getPin.cookie,
                referer: `https://${host}`
            }
        )
        if (['sign'].includes(type)) {
            let signUp = await this.curl({
                    'url': `https://${host}/sign/wx/signUp`,
                    'form': `venderId=${venderId}&pin=${secretPin}&actId=${activityId}`,
                    cookie: getPin.cookie,
                    referer: `https://${host}/`
                }
            )
            if (this.haskey(signUp, 'gift.giftName')) {
                console.log(`获得: ${signUp.gift.giftName}`)
                this.notices(signUp.gift.giftName, p.user)
            }
            else {
                console.log(signUp)
                console.log(signUp.errorMessage || signUp.msg || "什么也没有")
                if (this.haskey(signUp, 'msg', '该活动已经结束')) {
                    this.finish.push(p.number)
                }
            }
        }
        else if (['wxSecond'].includes(type)) {
            let getData = await this.curl({
                    'url': `https://${host}/wxSecond/getData`,
                    'form': `pin=${secretPin}&activityId=${activityId}`,
                    cookie: getPin.cookie
                }
            )
            let uuid = this.haskey(getData, 'data.uuid')
            let targetTime = this.haskey(getData, 'data.secondActive.targetTime')
            console.log(`当前手速:`, targetTime)
            while (true) {
                let getPrize = await this.curl({
                        'url': `https://${host}/wxSecond/start`,
                        'form': `pin=${secretPin}&activityId=${activityId}&uuid=${uuid}&seconds=${targetTime}`,
                        cookie: getPin.cookie
                    }
                )
                if (this.haskey(getPrize, 'data.draw.drawOk')) {
                    console.log(`获得: ${getPrize.data.draw.name}`)
                    this.notices(getPrize.data.draw.name, p.user)
                }
                else {
                    let err = this.haskey(getPrize, 'errorMessage') || this.haskey(getPrize, 'msg') || "什么也没有"
                    console.log(err)
                    if (this.match(this.errMsg, err)) {
                        this.finish.push(p.number)
                    }
                }
                if (!this.haskey(getPrize, 'data.draw.canDrawTimes')) {
                    break
                }
                await this.wait(500)
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
                this.notices(signUp.signResult.gift.giftName, p.user)
            }
            else {
                console.log(signUp)
                console.log(signUp.errorMessage || signUp.msg || "什么也没有")
            }
        }
        else if (['daily'].includes(type)) {
            let draw = await this.curl({
                    'url': `https://${host}/activity/daily/wx/grabGift`,
                    'form': `actId=${activityId}&pin=${secretPin}`,
                    cookie: getPin.cookie
                }
            )
            if (this.haskey(draw, 'isOk')) {
                let name = this.haskey(draw, 'gift.gift.name') || this.haskey(draw, 'gift.gift.giftName')
                console.log(name)
                this.notices(name, p.user)
            }
            else {
                console.log(draw.msg || "什么也没有抢到")
            }
        }
        else if (['wxPointShop'].includes(type)) {
            let c = await this.curl({
                    'url': `https://${host}/mc/beans/selectBeansForC`,
                    'form': `giftId=${activityId}&venderId=${venderId}&buyerPin=${secretPin}&beansLevel=1`,
                    cookie: getPin.cookie,
                    referer: `https://${host}/`
                }
            )
            if (this.haskey(c, 'data.usedNum')) {
                let r = {}
                let count
                if (c.data.beansLevelCount) {
                    r = await this.curl({
                            'url': `https://${host}/mc/wxPointShop/exgBeans`,
                            'form': `buyerPin=${secretPin}&buyerNick=${getPin.content.data.pin}&giftId=${activityId}&venderId=${venderId}&beansLevel=${c.data.beansLevel}&exgBeanNum=${c.data.beansLevelCount}`,
                            cookie: getPin.cookie,
                            referer: `https://${host}/`
                        }
                    )
                    count = c.data.beansLevelCount
                }
                else {
                    let point = await this.curl({
                            'url': `https://${host}/mc/wxPointShop/getBuyerPoints`,
                            'form': `buyerPin=${secretPin}&venderId=${venderId}`,
                            cookie: getPin.cookie
                        }
                    )
                    console.log(`当前积分:`, this.haskey(point, 'data.buyerPoints'))
                    if (this.haskey(point, 'data.buyerPoints')) {
                        r = await this.curl({
                                'url': `https://${host}/mc/wxPointShop/exgBeans`,
                                'form': `buyerPin=${secretPin}&buyerNick=${getPin.content.data.pin}&giftId=${activityId}&venderId=${venderId}&beansLevel=&exgBeanNum=${this.haskey(point, 'data.buyerPoints') / 10}`,
                                cookie: getPin.cookie,
                                referer: `https://${host}/`
                            }
                        )
                        count = this.haskey(point, 'data.buyerPoints') / 10
                    }
                }
                if (r.result) {
                    console.log(r)
                    console.log(`积分换豆:`, count)
                    this.notices(`积分换豆: ${count}`, p.user)
                }
                else {
                    console.log(r.errorMessage || "可能没有积分")
                }
            }
            else {
                console.log(`没获取到用户积分信息`)
            }
        }
        else if (['microDz'].includes(type)) {
            for (let kkk of this.venderIds || []) {
                await this.bindWithVender(kkk, jdActivityId, p.cookie)
            }
            if (p.inviter.aid.includes(pin)) {
                p.finish = 1
                console.log('已经组队过了')
            }
            else {
                let ad = await this.response({
                        'url': `https://${host}/common/accessLog`,
                        'form': `venderId=1&code=99&pin=${secretPin}&activityId=${activityId}&pageUrl=https%3A%2F%2Flzdz1-isv.isvjcloud.com&subType=app&adSource=`,
                        cookie: getPin.cookie,
                        referer: `https://${host}`
                    }
                )
                let f = await this.curl({
                        'url': `https://${host}/microDz/invite/activity/wx/acceptInvite`,
                        'form': `activityId=${activityId}&invitee=${secretPin}&inviteeNick=${pin}&inviteeImg=${encodeURIComponent('https://storage.jd.com/karma/image/20220112/1dafd93018624d74b5f01f82c9ac97b0.png')}&inviter=${p.inviter.inviter}&inviterNick=${p.inviter.inviterNick}&inviterImg=${p.inviter.imgUrl}`,
                        cookie: getPin.cookie,
                        referer: `https://${host}/`
                    }
                )
                console.log(f)
                if (f.result) {
                    p.finish = 1
                    p.inviter.aid.push(pin)
                    console.log("加团成功")
                }
                else {
                    let error = f.errorMessage || ''
                    console.log(error)
                    if (error.includes('队伍已经满员')) {
                        this.finish.push(p.n)
                    }
                }
            }
            await this.wait(1000)
            let get = await this.curl({
                    'url': `https://${host}/microDz/invite/activity/wx/getOpenCardAllStatuesNew`,
                    'form': `isInvited=1&activityId=${activityId}&pin=${secretPin}`,
                    cookie: getPin.cookie,
                    referer: `https://${host}/`
                }
            )
            if (this.haskey(get, 'data.reward')) {
                console.log(`获得奖励: ${get.data.reward}`)
                this.notices(`获得奖励: ${get.data.reward}`, p.user)
            }
            else {
                console.log("可能已经领取奖励了")
            }
            let count = this.dict.count || 56
            // if (this.dict.count) {
            if (this.unique(p.inviter.aid).length>=parseInt(count)) {
                console.log(`组队满足: ${count}`)
                this.finish.push(p.number)
            }
            // }
            this.dicts[pin] = {
                cookie: p.cookie,
                repeat: {
                    'url': `https://${host}/microDz/invite/activity/wx/getOpenCardAllStatuesNew`,
                    'form': `isInvited=1&activityId=${activityId}&pin=${secretPin}`,
                    cookie: getPin.cookie,
                    referer: `https://${host}/`
                }
            }
        }
        else {
            var url = `https://${host}/${type}/activityContent`
            if (type == 'wxMcLevelAndBirthGifts') {
                url = `https://${host}/mc/wxMcLevelAndBirthGifts/activityContent`
            }
            var activityContent = await this.response({
                    url,
                    'form': `pin=${secretPin}&activityId=${activityId}&buyerPin=${secretPin}&signUuid=${signUuid}&nick=${pin}&friendUuid=${signUuid}`,
                    cookie: getPin.cookie,
                    referer: `https://${host}/`
                }
            )
            // console.log(activityContent.content.data)
            if (!this.haskey(activityContent, 'content.result')) {
                console.log(activityContent.content.errorMessage)
                return
            }
            var need = this.haskey(activityContent, 'content.data.needCollectionSize')
            var has = this.haskey(activityContent, 'content.data.hasCollectionSize')
            var data = activityContent.content.data
            switch (type) {
                case 'wxFansInterActionActivity':
                    var uuid = data.actorInfo.uuid
                    var wxFollow = await this.response({
                            'url': `https://${host}/wxFansInterActionActivity/followShop`,
                            'form': `activityId=${activityId}&uuid=${uuid}`,
                            cookie: getPin.cookie,
                            referer: `https://${host}/`
                        }
                    )
                    break
                case 'wxShopGift':
                    var wxFollow = await this.response({
                            'url': `https://${host}/${type}/followShop`,
                            'form': `userId=${venderId}&buyerNick=${secretPin}&activityId=${activityId}&activityType=${p.inviter.activityType}`,
                            cookie: `${getPin.cookie}`
                        }
                    )
                    break
                case 'wxShopFollowActivity':
                    var wxFollow = await this.response({
                            'url': `https://${host}/${type}/follow`,
                            'form': `pin=${secretPin}&activityId=${activityId}`,
                            cookie: `${getPin.cookie}`,
                            referer: `https://${host}/`
                        }
                    )
                    break
                default:
                    var wxFollow = await this.response({
                            'url': `https://${host}/wxActionCommon/followShop`,
                            'form': `userId=${venderId}&buyerNick=${secretPin}&activityId=${activityId}&activityType=${p.inviter.activityType}`,
                            cookie: `${getPin.cookie}`,
                            referer: `https://${host}/`
                        }
                    )
                    break
            }
            if (['wxCollectionActivity'].includes(type)) {
                let skus = await this.curl({
                        'url': `https://${host}/act/common/findSkus`,
                        'form': `actId=${activityId}&userId=${venderId}&type=${p.inviter.activityType}`,
                        cookie: `${getPin.cookie}`,
                        referer: `https://${host}/`
                    }
                )
                skuList = this.column(skus.skus, 'skuId').map(d => d.toString())
                console.log(`加购列表: ${this.dumps(skuList)}`)
                // 判断数据中是否存在一键加购字段
                let lc = await this.curl({
                        'url': `https://${host}/crmCard/common/coupon/lightAddCart`,
                        'form': `actId=${activityId}&venderId=${venderId}&type=${at}&pin=${secretPin}`,
                        cookie: getPin.cookie,
                        referer: `https://${host}/`
                    }
                )
                if (this.haskey(activityContent, 'content.data.oneKeyAddCart')) {
                    for (let z = 0; z<3; z++) {
                        var add = await this.response({
                                'url': `https://${host}/wxCollectionActivity/oneKeyAddCart`,
                                form: `activityId=${activityId}&pin=${secretPin}&productIds=${this.dumps(this.column(skus.skus, 'skuId'))}`,
                                cookie: `${getPin.cookie}`,
                                referer: `https://${host}/`
                            }
                        )
                        await this.wait(1000)
                    }
                    if (add.cookie) {
                        var cookie = `${add.cookie};AUTH_C_USER=${secretPin};`
                    }
                }
                else {
                    cookie = `${getPin.cookie}`
                    if (has>=need) {
                        console.log(`加购已经完成...`)
                        for (let k of skuList.slice(0, 2)) {
                            let addOne = await this.response({
                                    'url': `https://${host}/wxCollectionActivity/addCart`,
                                    'form': `activityId=${activityId}&pin=${secretPin}&productId=${k}`,
                                    cookie,
                                    referer: `https://${host}/`
                                }
                            )
                            if (this.haskey(addOne, 'content.result')) {
                                var cookie = `${addOne.cookie};AUTH_C_USER=${secretPin};`
                                break
                            }
                        }
                    }
                    else {
                        let err = 0
                        for (let k of skuList) {
                            let addOne = await this.response({
                                    'url': `https://${host}/wxCollectionActivity/addCart`,
                                    'form': `activityId=${activityId}&pin=${secretPin}&productId=${k}`,
                                    cookie,
                                    referer: `https://${host}/`
                                }
                            )
                            console.log(`加购: ${k}`)
                            if (this.haskey(addOne, 'content.data.hasAddCartSize') == need) {
                                break
                            }
                            if (err>2) {
                                break
                            }
                            if (this.haskey(addOne, 'content.errorMessage').includes('异常')) {
                                console.log(addOne.content.errorMessage)
                            }
                            var cookie = `${addOne.cookie};AUTH_C_USER=${secretPin};`
                            err = 0
                        }
                    }
                }
                if (skuList.length) {
                    console.log("加购有延迟,等待3秒...")
                    await this.wait(3000)
                }
                // cookie = getPin.cookie
                let tempCookie = cookie
                getPin = await this.response({
                        'url': `https://${host}/customer/getMyPing`,
                        form: `userId=${venderId}&token=${this.isvObfuscator.token}&fromType=APP`,
                        cookie: cookie,
                        referer: `https://${host}/`
                    }
                )
                cookie = getPin.cookie
                while (true) {
                    for (let nn = 0; nn<3; nn++) {
                        for (let xx of Array(3)) {
                            var getPrize = await this.curl({
                                    'url': `https://${host}/wxCollectionActivity/getPrize`,
                                    form: `activityId=${activityId}&pin=${secretPin}`,
                                    cookie,
                                    referer: `https://${host}/`
                                }
                            )
                            console.log(getPrize)
                            if (this.haskey(getPrize, 'data', 'AUTH.FAILED.VALID')) {
                                cookie = tempCookie
                            }
                            else if (typeof getPrize == 'object') {
                                break
                            }
                        }
                        if (this.haskey(getPrize, 'errorMessage') && (getPrize.errorMessage.includes("擦肩") || getPrize.errorMessage.includes("未达到领奖条件"))) {
                            console.log(this.haskey(getPrize, 'errorMessage'))
                            await this.wait(1000)
                        }
                        else {
                            break
                        }
                    }
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        this.notices(getPrize.data.name, p.user)
                    }
                    else {
                        let err = this.haskey(getPrize, 'errorMessage') || this.haskey(getPrize, 'msg') || "什么也没有"
                        console.log(err)
                        if (this.match(this.errMsg, err)) {
                            this.finish.push(p.number)
                        }
                    }
                    if (!this.haskey(getPrize, 'data.canDrawTimes')) {
                        break
                    }
                }
            }
            else if (['drawCenter'].includes(type)) {
                while (true) {
                    for (let xx of Array(3)) {
                        var getPrize = await this.curl({
                                'url': `https://${host}/drawCenter/draw/luckyDraw`,
                                form: `activityId=${activityId}&pin=${secretPin}`,
                                cookie: getPin.cookie,
                                referer: `https://${host}/`
                            }
                        )
                        if (typeof getPrize == 'object') {
                            break
                        }
                    }
                    // console.log(getPrize)
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        this.notices(getPrize.data.name, p.user)
                    }
                    else {
                        let err = this.haskey(getPrize, 'errorMessage') || this.haskey(getPrize, 'msg') || "什么也没有"
                        console.log(err)
                        if (this.match(this.errMsg, err)) {
                            this.finish.push(p.number)
                        }
                    }
                    if (!this.haskey(getPrize, 'data.canDrawTimes')) {
                        break
                    }
                }
            }
            else if (['wxDrawActivity', 'wxPointDrawActivity'].includes(type)) {
                while (true) {
                    for (let xx of Array(3)) {
                        var draw = await this.curl({
                                'url': `https://${host}/${type}/start`,
                                'form': `pin=${secretPin}&activityId=${activityId}`,
                                cookie: `${getPin.cookie}`,
                                referer: `https://${host}/`
                            }
                        )
                        if (typeof draw == 'object') {
                            break
                        }
                    }
                    // console.log(draw)
                    if (this.haskey(draw, 'data.drawOk')) {
                        this.notices(draw.data.drawInfo.name, p.user)
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
                let cookie = getPin.cookie
                for (let xx of Array(2)) {
                    var draw = await this.curl({
                            'url': `https://${host}/wxShopGift/draw`,
                            'form': `activityId=${activityId}&buyerPin=${secretPin}&hasFollow=false&accessType=app`,
                            cookie,
                            referer: `https://${host}/`
                        }
                    )
                    if (this.haskey(getPrize, 'data', 'AUTH.FAILED.VALID')) {
                        let ad = await this.response({
                                'url': `https://${host}/common/accessLogWithAD`,
                                'form': `venderId=${venderId}&code=${at}&pin=${secretPin}&activityId=${activityId}&pageUrl=https%3A%2F%2Flzkj-isv.isvjcloud.com%2FwxShopGift%2Factivity%3FactivityId%3D${activityId}`,
                                cookie: getPin.cookie,
                                referer: `https://${host}/`
                            }
                        )
                        cookie = ad.cookie
                    }
                    if (typeof draw == 'object') {
                        break
                    }
                }
                if (draw.result) {
                    console.log(this.haskey(activityContent.content, 'data.list') || activityContent.content)
                    let g = {
                        'jd': '京豆',
                        'jf': '积分',
                        'dq': `东券`,
                    }
                    for (let i of this.haskey(activityContent.content, 'data.list')) {
                        console.log(`获得: ${i.takeNum || i.discount}${g[i.type]}`)
                        this.notices(
                            `${i.takeNum || i.discount}${g[i.type]}`, p.user
                        )
                    }
                }
                else {
                    console.log(draw.errorMessage || draw.msg || `什么也没有`)
                }
            }
            else if (['wxShopFollowActivity'].includes(type)) {
                while (true) {
                    for (let xx of Array(3)) {
                        var getPrize = await this.curl({
                                'url': `https://${host}/${type}/getPrize`,
                                form: `activityId=${activityId}&pin=${secretPin}`,
                                cookie: getPin.cookie,
                                referer: p.inviter.pageUrl
                            }
                        )
                        if (typeof getPrize == 'object') {
                            break
                        }
                    }
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        this.notices(getPrize.data.name, p.user)
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
                    for (let xx of Array(3)) {
                        var getPrize = await this.curl({
                                'url': `https://${host}/${type}/gameOverRecord`,
                                form: `activityId=${activityId}&pin=${secretPin}&score=${this.rand(1000, 100000)}`,
                                cookie: getPin.cookie,
                                referer: `https://${host}/`
                            }
                        )
                        if (typeof getPrize == 'object') {
                            break
                        }
                    }
                    // console.log(getPrize)
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        this.notices(getPrize.data.name, p.user)
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
                    let contents = ["很好很不错!", '2333333', '6666666', this.uuid(12), "红红火火恍恍惚惚", "哈哈哈哈哈哈哈哈哈"]
                    let content = this.random(contents, 1)[0]
                    if (this.haskey(activityContent, 'content.data.words') && this.random(activityContent.content.data.words, 1).length>0) {
                        content = this.random(activityContent.content.data.words, 1)[0].content
                    }
                    let c = await this.response({
                            'url': `https://${host}/${type}/currentFloor`,
                            'form': `activityId=${activityId}`,
                            cookie: getPin.cookie,
                            referer: `https://${host}/`
                        }
                    )
                    if (this.haskey(c, 'content.data.currentFloors')) {
                        console.log(`盖楼楼层: ${c.content.data.currentFloors}`)
                    }
                    for (let xx of Array(3)) {
                        var getPrize = await this.curl({
                                'url': `https://${host}/wxBuildActivity/publish`,
                                'form': `pin=${secretPin}&activityId=${activityId}&content=${encodeURIComponent(content)}`,
                                cookie: getPin.cookie,
                                referer: `https://${host}/`
                            }
                        ) 
                        if (typeof getPrize == 'object') {
                            break
                        }
                    }
                    if (this.haskey(getPrize, 'data.drawResult.drawOk')) {
                        console.log(`获得: ${getPrize.data.drawResult.name}`)
                        this.notices(getPrize.data.drawResult.name, p.user)
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
                if (this.haskey(activityContent, 'content.data.active.endTimeStr') && new Date(activityContent.content.data.active.endTimeStr.replace(/-/g, '/')).getTime()<new Date().getTime()) {
                    this.dict[activityId] = true
                    this.jump = 1
                    console.log("活动已经结束")
                    return
                }
                else if (p.inviter.aid.includes(sp)) {
                    console.log("已经在队伍里面了哦")
                }
                else {
                    if (this.haskey(activityContent, 'content.data.canJoin')) {
                        // console.log("入会有延迟,等待3秒...")
                        // await this.wait(3000)
                        let join = await this.curl({
                                'url': `https://${host}/${type}/saveMember`,
                                'form': `venderId=${venderId}&pin=${secretPin}&activityId=${activityId}&signUuid=${signUuid}&pinImg=${encodeURIComponent('https://storage.jd.com/karma/image/20220112/1dafd93018624d74b5f01f82c9ac97b0.png')}`,
                                cookie: getPin.cookie,
                                referer: `https://${host}/`
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
            }
            else if (['pool'].includes(type)) {
                if (p.inviter.aid.includes(sp)) {
                    console.log("已经在队伍里面了哦")
                }
                else {
                    if (this.haskey(activityContent, 'content.data.canJoin')) {
                        // console.log("入会有延迟,等待3秒...")
                        // await this.wait(3000)
                        let join = await this.curl({
                                'url': `https://${host}/${type}/saveCandidate`,
                                'form': `pin=${secretPin}&activityId=${activityId}&signUuid=${signUuid}&pinImg=${encodeURIComponent('https://storage.jd.com/karma/image/20220112/1dafd93018624d74b5f01f82c9ac97b0.png')}&jdNick=${encodeURIComponent(pin)}`,
                                cookie: getPin.cookie,
                                referer: `https://${host}/`
                            }
                        )
                        console.log(join)
                        if (this.haskey(join, 'result')) {
                            console.log("参团成功")
                            p.inviter.aid.push(sp)
                            await this.bindWithVender(venderId, jdActivityId, p.cookie)
                        }
                        if (this.dumps(join).includes("满员")) {
                            this.finish.push(p.number)
                        }
                    }
                    else {
                        console.log('不能参团,或者已经参加过活动')
                    }
                }
                let count = this.dict.count || 80
                if (p.inviter.aid.length>=parseInt(count)) {
                    console.log("开团上限了,换个队伍")
                    this.finish.push(p.number)
                }
            }
            else if (['wxMcLevelAndBirthGifts'].includes(type)) {
                let getMemberLevel = await this.curl({
                        'url': `https://${host}/mc/wxMcLevelAndBirthGifts/getMemberLevel`,
                        'form': `venderId=${venderId}&pin=${secretPin}&activityId=${activityId}`,
                        cookie: getPin.cookie,
                        referer: `https://${host}/`
                    }
                )
                if (this.haskey(getMemberLevel, 'data.level')) {
                    if (!this.haskey(activityContent, 'content.data.isReceived')) {
                        let level = parseInt(getMemberLevel.data.level)
                        console.log("当前等级:", level)
                        for (let ll = 1; ll<=level; ll++) {
                            let s = await this.curl({
                                    'url': `https://${host}/mc/wxMcLevelAndBirthGifts/sendLevelGifts`,
                                    'form': `venderId=${venderId}&pin=${secretPin}&level=${ll}&activityId=${activityId}`,
                                    cookie: getPin.cookie,
                                    referer: `https://${host}/`
                                }
                            )
                            if (this.haskey(s, 'data.levelData')) {
                                if (s.data.levelData.length) {
                                    for (let k of s.data.levelData) {
                                        console.log(k)
                                        this.notices(`获得奖励: ${k.beanNum} ${k.name}`)
                                    }
                                }
                                else {
                                    console.log(s.data.levelError || "可能已经获取过奖励了")
                                }
                            }
                            else {
                                console.log("什么奖励也没有")
                            }
                        }
                    }
                    else {
                        console.log(`没有获取到等级信息`)
                    }
                }
                else {
                    console.log("已经领取过了")
                }
            }
            else if (['pointExchange'].includes(type)) {
                let g = await this.response({
                        'url': `https://${host}/common/pointRedeem/getGiftList`,
                        'form': `pin=${secretPin}&venderId=${venderId}`,
                        cookie: getPin.cookie,
                        referer: `https://${host}/`
                    }
                )
                if (this.haskey(g, 'content.point')) {
                    let point = g.content.point
                    console.log('有积分:', point)
                    let reward = await this.curl({
                            'url': `https://${host}/pointExchange/exchange`,
                            'form': `pin=${secretPin}&activityId=${venderId}&beanCount=${point}`,
                            cookie: getPin.cookie,
                            referer: `https://${host}/`
                        }
                    )
                    console.log(reward)
                }
                else {
                    console.log("没有积分可以兑换")
                }
            }
            else if (['wxCollectCard'].includes(type)) {
                console.log('当前助力:', p.inviter.inviter)
                let g = []
                let n = this.match(/(\d+)次/, this.dumps(activityContent)) || 6
                var form = `sourceId=${p.inviter.signUuid}&activityId=${activityId}&type=1&pinImg=${encodeURIComponent(
                    'https://storage.jd.com/karma/image/20220112/1dafd93018624d74b5f01f82c9ac97b0.png')}&pin=${secretPin}&jdNick=${encodeURIComponent(
                    pin)}`
                let co = ''
                for (let z = 0; z<parseInt(n); z++) {
                    if (z == 1) {
                        let source = await this.response({
                                'url': `https://${host}/wxCollectCard/saveSource`,
                                'form': `activityId=${activityId}&pinImg=${encodeURIComponent('https://storage.jd.com/karma/image/20220112/1dafd93018624d74b5f01f82c9ac97b0.png')}&pin=${secretPin}&jdNick=${encodeURIComponent(pin)}`,
                                cookie: getPin.cookie,
                                referer: `https://${host}/`
                            }
                        )
                        let uuid = this.haskey(source, 'content.data') || p.inviter.signUuid
                        form = `sourceId=${uuid}&activityId=${activityId}&type=0`
                        co = source.cookie
                    }
                    let draw = await this.curl({
                            'url': `https://${host}/wxCollectCard/drawCard`,
                            form,
                            cookie: getPin.cookie,
                            referer: `https://${host}/`
                        }
                    )
                    await this.wait(200)
                    if (this.haskey(draw, 'errorMessage').includes("上限")) {
                        console.log(draw.errorMessage)
                        break
                    }
                    if (this.haskey(draw, 'data.reward')) {
                        console.log(`获得: ${draw.data.reward.cardName}`)
                        g.push(`获得: ${draw.data.reward.cardName}`)
                    }
                    else {
                        console.log(draw.errorMessage || "什么也没有抽到")
                    }
                }
                await this.wait(200)
                while (true) {
                    for (let nn = 0; nn<3; nn++) {
                        getPrize = await this.curl({
                                'url': `https://${host}/wxCollectCard/getPrize`,
                                form: `activityId=${activityId}&pin=${secretPin}`,
                                cookie: co || getPin.cookie,
                                referer: `https://${host}/`
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
                    console.log(getPrize)
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        g.push(getPrize.data.name)
                    }
                    else {
                        console.log(getPrize.errorMessage || getPrize.msg || "什么也没有")
                    }
                    if (!this.haskey(getPrize, 'data.canDrawTimes')) {
                        break
                    }
                }
                if (g.length) {
                    this.notices(g.join("\n"), p.user)
                }
            }
            else if (['wxFansInterActionActivity'].includes(type)) {
                let dict = {
                    'task1Sign': {
                        task: 'doSign'
                    },
                    'task2BrowGoods': {
                        task: 'doBrowGoodsTask',
                        list: 'taskGoodList',
                        key: 'skuId'
                    },
                    'task3AddCart': {
                        task: 'doAddGoodsTask',
                        list: 'taskGoodList',
                        key: 'skuId'
                    },
                    'task4Share': {
                        task: 'doShareTask',
                    },
                    'task5Remind': {
                        task: 'doRemindTask',
                    },
                    'task6GetCoupon': {
                        task: 'doGetCouponTask',
                        list: 'taskCouponInfoList',
                        key: 'couponId'
                    },
                    'task7MeetPlaceVo': {
                        task: 'doMeetingTask',
                    },
                }
                let cookie = getPin.cookie
                if (this.haskey(data, 'task3AddCart.taskGoodList')) {
                    skuList = this.column(data.task3AddCart.taskGoodList, 'skuId')
                }
                for (let task in dict) {
                    let d = data[task]
                    if (d && d.finishedCount != d.upLimit) {
                        if (dict[task].list) {
                            for (let v of d[dict[task].list].slice(0, d.upLimit - d.finishedCount)) {
                                if (!v.finished) {
                                    let dd = await this.response({
                                            'url': `https://${host}/wxFansInterActionActivity/${dict[task].task}`,
                                            'form': `activityId=${activityId}&uuid=${uuid}&${dict[task].key}=${v[dict[task].key]}`,
                                            cookie,
                                            referer: `https://${host}/`
                                        }
                                    )
                                    console.log(task, typeof dd.content == 'object' ? dd.content : '可能出错了')
                                    await this.wait(500)
                                    cookie = dd.cookie
                                }
                            }
                        }
                        else {
                            for (let kk = d.finishedCount; kk<d.upLimit; kk++) {
                                let dd = await this.response({
                                        'url': `https://${host}/wxFansInterActionActivity/${dict[task].task}`,
                                        'form': `activityId=${activityId}&uuid=${uuid}`,
                                        cookie: cookie,
                                        referer: `https://${host}/`
                                    }
                                )
                                console.log(task, typeof dd.content == 'object' ? dd.content : '可能出错了')
                                await this.wait(500)
                                cookie = dd.cookie
                            }
                        }
                    }
                }
                let prize = ['prizeOneStatus', 'prizeTwoStatus', 'prizeThreeStatus']
                for (let k = 0; k<3; k++) {
                    if (!data.actorInfo[prize[k]]) {
                        let draw = await this.response({
                                'url': `https://${host}/wxFansInterActionActivity/startDraw`,
                                'form': `activityId=${activityId}&uuid=${uuid}&drawType=0${k + 1}`,
                                cookie,
                                referer: `https://${host}/`
                            }
                        )
                        cookie = draw.cookie
                        if (this.haskey(draw, 'content.data.drawOk')) {
                            this.notices(draw.content.data.drawInfo.name, p.user)
                            console.log(`获得奖品: ${draw.content.data.drawInfo.name} ${draw.content.data.drawInfo.priceInfo}`)
                        }
                        else {
                            console.log(draw.content.errorMessage || draw.content.msg || "什么也没有")
                        }
                    }
                }
            }
            else if (['wxShareActivity'].includes(type)) {
                console.log('uuid', activityContent.content.data.myUuid)
                console.log(`正在助力: ${p.inviter.signUuid}`)
                if (p.inviter.aid.includes(sp)) {
                    console.log(`已经助力过了`)
                }
                else {
                    p.inviter.aid.push(sp)
                }
                let count = this.dict.count || p.inviter.count
                if (p.inviter.aid.length>parseInt(count)) {
                    this.finish.push(p.number)
                }
            }
        }
        // 取消关注店铺
        await this.curl({
            'url': 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=518274330',
            'form': `functionId=followShop&body={"follow":"false","shopId":"${shopId}","venderId":"${venderId}","award":"true","sourceRpc":"shop_app_home_follow"}&osVersion=13.7&appid=wh5&clientVersion=9.2.0&loginType=2&loginWQBiz=interact`,
            cookie: p.cookie
        })
        // 删除加购
        if (skuList.length>0) {
            skuList = skuList.map(d => d.toString())
            let cart = await this.curl({
                    'url': `https://api.m.jd.com/api?functionId=pcCart_jc_getCurrentCart&appid=JDC_mall_cart&body={}`,
                    // 'form':``,
                    cookie: p.cookie,
                    headers: {
                        "referer": "https://cart.jd.com/cart_index/",
                        "user-agent": "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0",
                    }
                }
            )
            let skus = []
            let packs = []
            if (this.haskey(cart, 'resultData.cartInfo.vendors')) {
                for (let i of cart.resultData.cartInfo.vendors) {
                    for (let j of this.haskey(i, 'sorted')) {
                        if (this.haskey(j, 'item.items')) {
                            if (j.item.items.length>0) {
                                for (let k of j.item.items) {
                                    if (skuList.includes(k.item.Id)) {
                                        packs.push(
                                            {
                                                "num": k.item.Num.toString(),
                                                "ybPackId": j.item.promotionId,
                                                "sType": "11",
                                                "TheSkus": [{"num": k.item.Num.toString(), "Id": k.item.Id.toString()}],
                                                "Id": j.item.promotionId
                                            }
                                        )
                                    }
                                }
                            }
                            else {
                                if (skuList.includes(j.item.Id)) {
                                    skus.push(
                                        {
                                            "num": j.item.Num.toString(),
                                            "Id": j.item.Id.toString(),
                                            "skuUuid": j.item.skuUuid,
                                            "useUuid": j.item.useUuid
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
            console.log('即将删除购物车数目:', skus.length + packs.length)
            if (skus.length>0 || packs.length>0) {
                let cartRemove = await this.curl({
                        'url': `https://api.m.jd.com/api`,
                        'form': `functionId=pcCart_jc_cartRemove&appid=JDC_mall_cart&body=${this.dumps({
                            "operations": [{
                                "carttype": "4",
                                "TheSkus": skus,
                                "ThePacks": packs
                            }], "serInfo": {}
                        })}`,
                        cookie: p.cookie,
                        headers: {
                            "referer": "https://cart.jd.com/cart_index/",
                            "user-agent": "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0",
                        }
                    }
                )
            }
        }
    }

    async rType(p) {
        let pin = this.userPin(p.cookie)
        let host = p.inviter.host
        let activityId = p.inviter.activityId
        let jdActivityId = p.inviter.jdActivityId
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
            let isvObfuscator = await this.isvToken(p)
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

    async lType(p) {
        let isvObfuscator = await this.isvToken(p)
        let u = await this.curl({
                'url': `https://fjzy-isv.isvjcloud.com/index.php?mod=games&action=buyerTokenJson`,
                'form': `buyerTokenJson={"state":"0","data":"${isvObfuscator.token}","msg":""}&venderId=${p.inviter.activityId}&yxId=5510`,
                cookie: `IsvToken:${isvObfuscator.token}`
            }
        )
        if (u.drawNum) {
            let r = await this.curl({
                    'url': `https://fjzy-isv.isvjcloud.com/index.php?mod=games&action=check&venderId=${p.inviter.activityId}&actId=6&yxId=5510&token=undefined&buyPin=${u.buyPin}`,
                    cookie: `IsvToken:${isvObfuscator.token}`
                }
            )
            console.log(r.result.prize)
            if (this.haskey(r, 'result.grade', 1)) {
                this.notices(r.result.prize, p.user)
            }
        }
        else {
            console.log('没有抽奖机会')
        }
    }

    async microDz(dicts) {
        // this.model = 'share'
        this.filter = ''
        dicts.sid = 599119
        for (let cookie of this.cookies['help']) {
            var data = this.loads(this.dumps(dicts))
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
                    let jdActivityId = p.inviter.jdActivityId
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
                    let residualPercentage = this.haskey(acc, 'data.residualPercentage')
                    if (!residualPercentage) {
                        console.log("没获取到进度条,可能活动已经结束了")
                        continue
                    }
                    else {
                        console.log(`当前剩余: ${residualPercentage}%`)
                    }
                    let venderIds = []
                    if (this.haskey(acc, 'data.venderIds')) {
                        venderIds = acc.data.venderIds.split(",")
                        this.venderIds = venderIds
                        for (let kkk of venderIds) {
                            await this.bindWithVender(kkk, jdActivityId, p.cookie)
                        }
                    }
                    let inviter = await this.curl({
                            'url': `https://${host}/microDz/invite/activity/wx/inviteRecord`,
                            'form': `activityId=${activityId}&inviter=${secretPin}&pageNo=1&pageSize=100&type=0`,
                            cookie: getPin.cookie
                        }
                    )
                    let aid = []
                    if (this.haskey(inviter, 'data.list')) {
                        aid = this.column(inviter.data.list, 'inviteeNick')
                        delete inviter.data.list
                    }
                    if (this.haskey(inviter, 'data.inviterNick')) {
                        data.aid = aid
                        data.inviter = secretPin
                        data.venderIds = venderIds
                        data.user = this.userName(cookie)
                        this.shareCode.push({...data, ...inviter.data})
                    }
                    await this.wait(2000)
                    let get = await this.curl({
                            'url': `https://${host}/microDz/invite/activity/wx/getOpenCardAllStatuesNew`,
                            'form': `isInvited=1&activityId=${activityId}&pin=${secretPin}`,
                            cookie: getPin.cookie
                        }
                    )
                    if (this.haskey(get, 'data.reward')) {
                        console.log(`获得奖励: ${get.data.reward}`)
                        this.notices(`获得奖励: ${get.data.reward}`, p.user)
                    }
                    this.dicts[user] = {
                        cookie,
                        repeat: {
                            'url': `https://${host}/microDz/invite/activity/wx/getOpenCardAllStatuesNew`,
                            'form': `isInvited=0&activityId=${activityId}&pin=${secretPin}`,
                            cookie: getPin.cookie
                        }
                    }
                }
            } catch (e) {
            }
        }
    }

    async wxTeam(dicts) {
        // this.model = 'share'
        this.filter = ''
        for (let cookie of this.cookies['help']) {
            var data = this.loads(this.dumps(dicts))
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
                    let jdActivityId = p.inviter.jdActivityId
                    let host = p.inviter.host
                    await this.bindWithVender(venderId, jdActivityId, p.cookie)
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
                            'url': `https://${host}/${p.inviter.type}/activityContent`,
                            'form': `activityId=${p.inviter.activityId}&pin=${secretPin}`,
                            cookie: getPin.cookie
                        }
                    )
                    try {
                        let prizeName = ''
                        if (this.haskey(ac, 'data.active.prizeType', 9)) {
                            prizeName = '积分'
                        }
                        else if (this.haskey(ac, 'data.active.prizeType', 6)) {
                            prizeName = '京豆'
                        }
                        this.notices(`活动详情:\n每人可组 ${ac.data.active.maxGroup} 队\n队内每人获得: ${ac.data.active.prizeNumbers} ${prizeName}\n队长额外获得: ${ac.data.active.extraPrizeNumbers} ${prizeName}`)
                        console.log(`活动详情:\n每人可组 ${ac.data.active.maxGroup} 队\n队内每人获得: ${ac.data.active.prizeNumbers} ${prizeName}\n队长额外获得: ${ac.data.active.extraPrizeNumbers} ${prizeName}`)
                    } catch (ee) {
                    }
                    if (this.haskey(ac, 'data.active.endTimeStr') && new Date(ac.data.active.endTimeStr.replace(/-/g, '/')).getTime()<new Date().getTime()) {
                        this.notices("活动已经结束")
                        console.log("活动结束了哦")
                        this.shareCode = []
                        return
                    }
                    else if (this.haskey(ac, 'data.active.startTimeStr') && new Date(ac.data.active.startTimeStr.replace(/-/g, '/')).getTime()>new Date().getTime()) {
                        this.shareCode = []
                        this.notices(`还未开始ID: ${p.inviter.activityId}\n活动时间: ${ac.data.active.startTimeStr}`, 'message')
                        console.log("活动还未开始", ac.data.active.startTimeStr)
                        return
                    }
                    let aid = []
                    let captainId = []
                    if (this.haskey(ac, 'data.successRetList')) {
                        try {
                            for (let kk of ac.data.successRetList) {
                                // captainId = this.unique([...aid, ...this.column(kk.memberList, 'captainId')])
                                aid = this.unique([...aid, ...this.column(kk.memberList, 'pin')])
                            }
                        } catch (e2) {
                        }
                    }
                    if (this.haskey(ac, 'data.successRetList') && this.haskey(ac, 'data.active.maxGroup') && ac.data.successRetList.length == ac.data.active.maxGroup) {
                        console.log(user, "人员已满")
                    }
                    else {
                        let signUuid
                        if (this.haskey(ac, 'data.signUuid')) {
                            signUuid = ac.data.signUuid
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
                                    'url': `https://${host}/${p.inviter.type}/saveCaptain`,
                                    'form': `venderId=${venderId}&activityId=${p.inviter.activityId}&pin=${secretPin}&pinImg=${encodeURIComponent('https://storage.jd.com/karma/image/20220112/1dafd93018624d74b5f01f82c9ac97b0.png')}`,
                                    cookie: getPin.cookie
                                }
                            )
                            if (this.haskey(catpain, 'data.signUuid')) {
                                signUuid = catpain.data.signUuid
                            }
                        }
                        if (signUuid) {
                            console.log(`队伍Id: ${signUuid}`)
                            data.signUuid = signUuid
                            data.aid = aid
                            data.user = this.userName(cookie)
                            this.shareCode.push(data)
                            this.dicts[user] = {
                                'pool': {
                                    'url': `https://${host}/${p.inviter.type}/activityContent`,
                                    'form': `venderId=${venderId}&activityId=${p.inviter.activityId}&pin=${secretPin}`,
                                    cookie: getPin.cookie,
                                    host
                                }
                            }
                        }
                        else {
                            console.log(user, '没有获取到队伍Id')
                        }
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    async wxCollectCard(dicts) {
        this.model = 'shuffle'
        this.filter = ''
        for (let cookie of this.cookies['help']) {
            var data = this.loads(this.dumps(dicts))
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
                    let jdActivityId = p.inviter.jdActivityId
                    let host = p.inviter.host
                    await this.bindWithVender(venderId, jdActivityId, p.cookie)
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
                    let source = await this.curl({
                            'url': `https://${host}/wxCollectCard/saveSource`,
                            'form': `activityId=${activityId}&pinImg=${encodeURIComponent('https://storage.jd.com/karma/image/20220112/1dafd93018624d74b5f01f82c9ac97b0.png')}&pin=${secretPin}&jdNick=${encodeURIComponent(user)}`,
                            cookie: getPin.cookie
                        }
                    )
                    let insert = await this.curl({
                            'url': `https://${host}/crm/pageVisit/insertCrmPageVisit`,
                            'form': `venderId=${venderId}&elementId=%E9%82%80%E8%AF%B7&pageId=${activityId}&pin=${secretPin}`,
                            cookie: getPin.cookie
                        }
                    )
                    if (this.haskey(source, 'data')) {
                        this.dicts[user] = {
                            repeat: {
                                'url': `https://${host}/wxCollectCard/getPrize`,
                                form: `activityId=${activityId}&pin=${secretPin}`,
                                cookie: getPin.cookie
                            }
                        }
                        data.signUuid = source.data
                        data.inviter = user
                        data.user = this.userName(cookie)
                        this.shareCode.push(data)
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    async wxUnPackingActivity(dicts) {
        this.model = 'team'
        this.filter = ''
        for (let cookie of this.cookies['help']) {
            var data = this.loads(this.dumps(dicts))
            let p = {
                cookie, inviter: data
            }
            let pin = this.userPin(cookie)
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
                    let jdActivityId = p.inviter.jdActivityId
                    let host = p.inviter.host
                    await this.bindWithVender(venderId, jdActivityId, p.cookie)
                    switch (host) {
                        case "cjhy-isv.isvjcloud.com":
                            secretPin = escape(encodeURIComponent(secretPin))
                            break
                        default:
                            secretPin = encodeURIComponent(secretPin)
                            break
                    }
                    let ac = await this.curl({
                            'url': `https://${host}/wxUnPackingActivity/activityContent`,
                            'form': `activityId=${activityId}&buyerNick=${secretPin}&friendUuid=`,
                            cookie: getPin.cookie
                        }
                    )
                    if (this.haskey(ac, 'data.wucvo')) {
                        let signUuid = ac.data.wucvo.mySelfId
                        let inviter = pin
                        let drawInfoId = ac.data.wdifo.id
                        let h = await this.curl({
                                'url': `https://${host}/wxActionPrizeResult/hasPrize`,
                                'form': `activityId=${activityId}&drawInfoId=${drawInfoId}`,
                                cookie: getPin.cookie
                            }
                        )
                        data.user = this.userName(cookie)
                        this.shareCode.push({
                            ...data, ...{
                                inviter, drawInfoId, signUuid
                            }
                        })
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    async wxShareActivity(dicts) {
        // this.model = 'share'
        this.filter = ''
        for (let cookie of this.cookies['help']) {
            var data = this.loads(this.dumps(dicts))
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
                    let jdActivityId = p.inviter.jdActivityId
                    let host = p.inviter.host
                    await this.bindWithVender(venderId, jdActivityId, p.cookie)
                    switch (host) {
                        case "cjhy-isv.isvjcloud.com":
                            secretPin = escape(encodeURIComponent(secretPin))
                            break
                        default:
                            secretPin = encodeURIComponent(secretPin)
                            break
                    }
                    let ac = await this.curl({
                            'url': `https://${host}/wxShareActivity/activityContent`,
                            'form': `activityId=${activityId}&pin=${secretPin}`,
                            cookie: getPin.cookie,
                            referer: p.inviter.pageUrl
                        }
                    )
                    let share = await this.curl({
                            'url': `https://${host}/wxShareActivity/share`,
                            'form': `activityId=${activityId}&pin=${secretPin}`,
                            cookie: getPin.cookie,
                            referer: p.inviter.pageUrl
                        }
                    )
                    data.inviter = user
                    data.inviterPin = secretPin
                    data.signUuid = ac.data.myUuid
                    if (this.haskey(ac, 'data.drawContentVOs')) {
                        data.gifts = this.column(ac.data.drawContentVOs, 'name', 'drawInfoId')
                        data.count = this.sum(this.column(ac.data.drawContentVOs, 'shareTimes'))
                    }
                    let list = await this.curl({
                            'url': `https://${host}/wxShareActivity/memberList`,
                            'form': `uuid=${ac.data.myUuid}&pageNo=1&pageSize=100`,
                            cookie: getPin.cookie,
                            referer: p.inviter.pageUrl
                        }
                    )
                    if (this.haskey(list, 'data.items')) {
                        data.aid = this.column(list.data.items, 'pin')
                    }
                    data.user = this.userName(cookie)
                    this.shareCode.push(data)
                    this.dicts[user] = {
                        wxShareActivity: {
                            'url': `https://${host}/wxShareActivity/getPrize`,
                            form: `activityId=${activityId}&pin=${secretPin}&drawInfoId=`,
                            cookie: getPin.cookie,
                            referer: p.inviter.pageUrl,
                            gifts: data.gifts
                        },
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    async WxHbShareActivity(dicts) {
        // this.model = 'shuffle'
        this.filter = ''
        for (let cookie of this.cookies['help']) {
            var data = this.loads(this.dumps(dicts))
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
                    let jdActivityId = p.inviter.jdActivityId
                    let host = p.inviter.host
                    await this.bindWithVender(venderId, jdActivityId, p.cookie)
                    switch (host) {
                        case "cjhy-isv.isvjcloud.com":
                            secretPin = escape(encodeURIComponent(secretPin))
                            break
                        default:
                            secretPin = encodeURIComponent(secretPin)
                            break
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    async getMyPing(p) {
        let host = p.inviter.host
        let activityId = p.inviter.activityId
        let jdActivityId = p.inviter.jdActivityId
        let at = p.inviter.activityType
        let type = p.inviter.type
        this.assert(type, "不支持的活动类型")
        let venderId = p.inviter.venderId
        let shopId = p.inviter.shopId
        let sid = p.inviter.sid || ''
        let isvObfuscator = await this.isvToken(p)
        this.assert(isvObfuscator.token, "没有获取到isvToken")
        this.isvObfuscator = isvObfuscator
        switch (host) {
            case "cjhy-isv.isvjcloud.com":
            case "cjhydz-isv.isvjcloud.com":
                var h = await this.response({
                        'url': `https://${host}/wxCollectionActivity/activity?activityId=${activityId}`,
                        referer: `https://${host}/`
                    }
                )
                break
            default:
                var h = await this.response({
                        'url': `https://${host}/wxCollectionActivity/activity2/${activityId}?activityId=${activityId}`,
                        referer: `https://${host}/`
                    }
                )
                break
        }
        let info = await this.response({
                'url': `https://${host}/customer/getSimpleActInfoVo`,
                form: `activityId=${activityId}`,
                cookie: h.cookie,
                referer: `https://${host}/`
            }
        )
        var getPin = await this.response({
                'url': `https://${host}/customer/getMyPing`,
                form: `userId=${sid || venderId}&token=${isvObfuscator.token}&fromType=APP`,
                cookie: info.cookie,
                referer: `https://${host}/`
            }
        )
        if (!this.haskey(getPin, 'content.data.secretPin')) {
            console.log(`可能是黑号或者黑ip,停止运行`)
            return
        }
        else {
            getPin.token = isvObfuscator.token
            return getPin
        }
    }

    async bindWithVender(venderId, jdActivityId, cookie) {
        jdActivityId = jdActivityId || ''
        if (this.dict.openCard) {
            for (let kk of Array(3)) {
                var o = await this.algo.curl({
                        'url': `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"${venderId}","bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0,"channel":8018802}&clientVersion=9.2.0&client=H5&uuid=88888`,
                        cookie
                    }
                )
                // var o = await this.curl(this.modules.jdUrl.app('bindWithVender', {
                //         "venderId": venderId.toString(),
                //        // "shopId": "",
                //         "bindByVerifyCode1Flag": 1
                //     }, 'post', cookie)
                // )
                if (o.success) {
                    break
                }
            }
            console.log(`开卡中${venderId}`, o.message)
        }
    }

    async extra() {
        // 此处用来跑组队开卡
        for (let i in this.dicts) {
            console.log(`正在运行: ${i}`)
            if (this.dict.openCard && this.shareCode.length) {
                if (this.venderIds && this.venderIds.length) {
                    for (let kkk of this.venderIds) {
                        await this.bindWithVender(kkk, '', this.dicts[i].cookie)
                    }
                }
            }
            if (this.dicts[i].repeat) {
                while (true) {
                    let getPrize = await this.curl(this.dicts[i].repeat
                    )
                    await this.wait(2000)
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        this.notices(getPrize.data.name, i)
                    }
                    else {
                        console.log(getPrize.errorMessage || getPrize.msg || "什么也没有")
                    }
                    if (!this.haskey(getPrize, 'data.canDrawTimes')) {
                        break
                    }
                }
            }
            if (this.dicts[i].pool) {
                try {
                    let data = this.dicts[i].pool
                    let ac = await this.curl(data)
                    if (this.haskey(ac, 'data.successRetList')) {
                        var url = `https://${data.host}/pool/updateCaptain`
                        try {
                            for (let kk of ac.data.successRetList) {
                                let member = (this.column(kk.memberList, 'jdNick').length ? this.column(kk.memberList, 'jdNick') : this.column(kk.memberList, 'nickName')).join("  ")
                                let c = kk.memberList[0].captainId
                                let s = await this.curl({
                                        url,
                                        'form': `uuid=${c}`,
                                        cookie: data.cookie,
                                        referer: `https://${data.host}/pool/updateCaptain`
                                    }
                                )
                                if (this.haskey(s, 'errorMessage', '更新信息出错')) {
                                    url = `https://${data.host}/common/pool/updateCaptain`
                                    s = await this.curl({
                                            url,
                                            'form': `uuid=${c}`,
                                            cookie: data.cookie,
                                            referer: `https://${data.host}/pool/updateCaptain`
                                        }
                                    )
                                }
                                this.notices(`${c} ${s.errorMessage}\n组队成员: ${member}`, i)
                                console.log(c, s.errorMessage)
                                console.log(`组队成员: ${member}`)
                                await this.wait(2000)
                            }
                        } catch (e2) {
                            console.log(e2.message)
                        }
                    }
                } catch (e) {
                }
            }
            if (this.dicts[i].wxShareActivity) {
                let r = this.dicts[i].wxShareActivity
                let form = r.form
                for (let id in this.dicts[i].wxShareActivity.gifts) {
                    console.log(`正在领取: ${this.dicts[i].wxShareActivity.gifts[id]}`)
                    r.form = form.concat(id)
                    let getPrize = await this.curl(r)
                    await this.wait(2000)
                    if (this.haskey(getPrize, 'data.drawOk')) {
                        console.log(`获得: ${getPrize.data.name}`)
                        this.notices(getPrize.data.name, i)
                    }
                    else {
                        console.log(getPrize.errorMessage || getPrize.msg || "什么也没有")
                    }
                }
            }
        }
        if (this.cacheId) {
            await this.modules.fs.writeFile(`${this.dirname}/temp/${this.filename}.txt`, this.cacheId.map(d => d).join("\n"), (error) => {
                if (error) return console.log("写入化失败" + error.message);
                console.log("ID写入成功");
            })
        }
        if (this.cache.set) {
            console.log(`关闭缓存....`)
            await this.cache.close()
        }
    }

    async isvToken(p) {
        let cacheKey = this.md5(`${this.fileSalt}_isvObfuscator_${this.userName(p.cookie)}`)
        try {
            var isvObfuscator = await this.cache.get(cacheKey)
        } catch (e) {
        }
        if (!isvObfuscator) {
            var isvObfuscator = await this.curl(this.modules.jdObf.app('isvObfuscator', {
                "url": `https://lzdz1-isv.isvjcloud.com`,
                "id": ""
            }, 'post', p.cookie))
            if (this.haskey(isvObfuscator, 'token') && this.cache.set) {
                await this.cache.set(cacheKey, isvObfuscator, parseInt(this.fileExpire))
                console.log("写入isvToken缓存成功...")
            }
        }
        else {
            console.log("读取isvToken缓存成功...")
        }
        console.log(`isvToken: ${this.haskey(isvObfuscator, 'token') || "没有获取到isvToken"}`)
        return isvObfuscator
    }
}

module.exports = Main;
