const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东京享红包"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.help = '3'
        this.import = ['jdAlgo', 'logBill', 'jdSign', 'jsdom']
        this.delay = 500
        this.jdJdc = '123'
        this.hint = {
            shareUrl: "分享链接",
            known: '风控较严,订单有异常的风险,如订单一直异常,请停用此脚本'
        }
        this.readme = "风控较严,算法经常变动,锁佣需谨慎,如还要使用此脚本请添加\n[jd_task_union]\nknown=1"
        // this.verify = 1
    }

    async uuaa() {
        let ua = this.userAgents().wechat
        if (!this._hashCode) {
            try {
                let url = this.profile.shareUrl || `https://u.jd.com/${this.unionId}`
                const {
                    JSDOM
                } = this.modules.jsdom;
                let virtualConsole = new this.modules.jsdom.VirtualConsole()
                let resourceLoader = new this.modules.jsdom.ResourceLoader(this.options.headers);
                var options = {
                    runScripts: "dangerously",
                    resources: resourceLoader,
                    virtualConsole,
                };
                const dom = await JSDOM.fromURL(url, options);
                if (dom.window.hashCode && typeof dom.window.hashCode == 'function') {
                    console.log("Jsdom: 获取hashCode成功...")
                    this._hashCode = dom.window.hashCode
                }
            } catch (e) {
            }
        }
        if (!this._hashCode) {
            this._hashCode = s => s.split('').reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a
            }, 0);
        }
        return {
            ua,
            h5st: this._hashCode(ua)
        }
    }

    async prepare() {
        if (!this.profile.known) {
            // this.jump = 1
            // return
        }
        var {ua, h5st} = await this.uuaa()
        this.sign = new this.modules.jdSign()
        this.algo = new this.modules.jdAlgo({
            version: "latest",
            ua,
            type: "main",
        })
        try {
            let cookie = ''
            let url = this.profile.shareUrl || `https://u.jd.com/${this.unionId}`
            let jda = await this.curl({
                    'url': url,
                    'response': `all`,
                    redirect: 'follow',
                    headers: {
                        'user-agent': ua,
                    }
                }
            )
            let jdaUrl = this.match([/hrl\s*='([^\']+)'/, /hrl\s*="([^\"]+)"/], jda.content)
            cookie = `${cookie};${jda.cookie}`
            let scheme = await this.curl({
                    'url': jdaUrl + `&h5st=${h5st}`,
                    maxRedirects: 0,
                    scheme: 'http',
                    'response': `all`,
                    cookie,
                    ua,
                    referer: url
                }
            )
            cookie = `${cookie};${scheme.cookie}`
            let linkUrl = scheme.location
            await this.curl({
                url: linkUrl,
                referer: url,
                'ua': ua,
            })
            let actId = this.match(/active\/(\w+)/, linkUrl)
            let unionActId = this.match(/unionActId=(\d+)/, linkUrl)
            let d = this.match(/com\/(\w+)/, url)
            this.dict = {
                actId, unionActId, d
            }
            for (let i of this.cookies.help) {
                let shareUnion = await this.algo.curl({
                        'url': `https://api.m.jd.com/api?functionId=shareUnionCoupon&appid=u_hongbao&_=1716943673297&loginType=2&body={"unionActId":"${unionActId}","actId":"${actId}","platform":5,"unionShareId":"","d":"${d}","supportPic":2}&client=apple&clientVersion=12.3.1&osVersion=15.1.1&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=wifi&openudid=`,
                        cookie: `${i};${cookie}`,
                        appId: 'c10dc',
                        referer: linkUrl,
                        ua
                    }
                )
                if (this.haskey(shareUnion, 'data.shareUrl')) {
                    let unionShareId = this.match(/s=(\w+)/, shareUnion.data.shareUrl)
                    this.code.push(unionShareId)
                }
            }
        } catch (e) {
            // console.log(e.message)
        }
        if (this.code.length>0) {
            console.log("当前助力码:", this.code)
        }
        else {
            this.jump = 1
        }
    }

    async main(p) {
        let cookie = p.cookie
        var user = p.user
        let gift = function(getCoupons) {
            for (let i of this.haskey(getCoupons, 'data.couponList')) {
                if (i.type == 1) {
                    this.print(`获得[红包]🧧${i.discount}元`, user)
                }
                else if (i.type == 3) {
                    console.log(`获得[优惠券]🎟️满${i.quota}减${i.discount}`)
                }
                else if (i.type == 6) {
                    console.log(`获得[打折券]🎫满${i.quota}打${i.discount * 10}折`)
                }
                else {
                    console.log(`获得[未知]🎉${i.quota || ''} ${i.discount}`)
                }
            }
        }
        var {ua, h5st} = await this.uuaa()
        await this.shareId()
        for (let unionShareId of this.code.slice(0, 4)) {
            cookie = p.cookie
            if (this.dict.d) {
                var url = `https://u.jd.com/${this.dict.d}?s=${unionShareId}`
            }
            else if (this.profile.shareUrl) {
                let url = `${this.profile.shareUrl.split('?')[0]}?s=${unionShareId}`
            }
            let jda = await this.curl({
                    'url': url,
                    'response': `all`,
                    redirect: 'follow',
                    cookie,
                    headers: {
                        'user-agent': ua
                    }
                }
            )
            let jdaUrl = this.match([/hrl\s*='([^\']+)'/, /hrl\s*="([^\"]+)"/], jda.content)
            cookie = `${cookie};${jda.cookie}`
            let scheme = await this.curl({
                    'url': jdaUrl + `&h5st=${h5st}`,
                    maxRedirects: 0,
                    scheme: 'http',
                    'response': `all`,
                    cookie,
                    ua,
                    referer: url
                }
            )
            cookie = `${cookie};${scheme.cookie}`
            let linkUrl = scheme.location
            let query = (this.query(linkUrl, '&', 'split'))
            let actId = this.match(/active\/(\w+)/, linkUrl)
            let {
                unionActId, d, utm_source, utm_medium, utm_campaign, utm_term
            } = query
            let __jdv = `${this.jdJdc}|${utm_source}|${utm_campaign}|${utm_medium}|${utm_term}|${new Date().getTime()}`
            cookie = `${cookie};__jdv=${encodeURIComponent(__jdv)}`
            await this.curl({
                url: linkUrl,
                referer: url,
                ua
            })
            await this.algo.set({
                referer: linkUrl,
                ua
            })
            // let showCoupon = await this.algo.curl({
            //         url: `https://api.m.jd.com/api`,
            //         form: `functionId=showCoupon&appid=u_hongbao&_=1729029312285&loginType=2&body={"platform":5,"unionActId":"${unionActId}","actId":"${actId}","d":"${d}","unionShareId":"${unionShareId}","type":1,"qdPageId":"MO-J2011-1","mdClickId":"jxhongbao_ck","actType":1}&client=apple&clientVersion=1.1.0&osVersion=iOS&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=&openudid=&uuid=1729028921991924762424&aid=&oaid=&ext={"idfa":""}`,
            //         cookie,
            //         algo: {
            //             appId: 'c822a'
            //         },
            //     }
            // )
            let getCoupons = await this.algo.curl({
                    url: `http://api.m.jd.com/api`,
                    form: `functionId=getCoupons&appid=u_hongbao&_=1716912812082&loginType=2&body={"platform":5,"unionActId":"${unionActId}","actId":"${actId}","d":"${d}","unionShareId":"${unionShareId}","type":1,"qdPageId":"MO-J2011-1","mdClickId":"jxhongbao_ck","actType":1}&client=apple&clientVersion=1.1.0&osVersion=iOS&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=&openudid=&uuid=17165464753211715186324&aid=&oaid=&ext={"idfa":""}&x-api-eid-token=`,
                    cookie,
                    algo: {
                        appId: 'c822a'
                    },
                }
            )
            let msg = this.haskey(getCoupons, 'msg')
            if (msg.includes('领取成功')) {
                gift.call(this, getCoupons)
            }
            else {
                console.log("领取失败:", msg)
                if (msg == '达到领取上限') {
                    break
                }
                if (msg == '活动未开始') {
                    this.jump = 1
                    return
                }
                if (msg.includes("用户未登录")) {
                    return
                }
            }
        }
        let qry = await this.algo.curl({
                'url': `https://api.m.jd.com/api?functionId=queryFullGroupInfoMap&appid=u_hongbao&_=1716946027013&loginType=2&body={"actId":"${this.dict.actId}","unionActId":"${this.dict.unionActId}","platform":5,"d":"${this.dict.d}","taskType":1,"prstate":0}&client=apple&clientVersion=12.3.1&osVersion=15.1.1&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=wifi&openudid=&aid=&oaid=`,
                cookie,
                algo: {appId: '7b74b'}
            }
        )
        for (let i of this.haskey(qry, 'data.dayGroupData.groupInfo')) {
            if (i.info) {
                if (i.status == 1) {
                    console.log("正在运行:", i.info)
                    if (i.info.includes("点击") && i.taskTargetUrl) {
                        let query = this.query(i.taskTargetUrl, '&', 'split')
                        let goods = await this.algo.curl({
                                'url': `https://api.m.jd.com/api?functionId=unionSearchRecommend&appid=u_activity_h5&loginType=2&client=apple&clientVersion=&body={"funName":"getSkuByMaterialId","page":{"pageNo":1,"pageSize":20},"param":{"materialId":12354,"sortName":null,"sortType":"","keyword":"","category1":null,"batchId":"","requestScene":1,"source":20200,"clientPageId":"union_activity_265222","packageName":""}}`,
                                cookie,
                                algo: {
                                    appId: '66248'
                                }
                            }
                        )
                        let goodList = this.haskey(goods, 'result.goodsSynopsisList') || []
                        for (let z of goodList.slice(0, 6)) {
                            let couponUrl = this.haskey(z, `purchasePriceInfo.unionCouponList.0.couponLink`)
                            if (couponUrl) {
                                console.log("正在浏览:", z.skuName)
                                let free = await this.algo.curl({
                                        'url': `https://api.m.jd.com/api?functionId=getUnionFreeCoupon&appid=u_activity_h5&loginType=2&client=apple&clientVersion=&body={"couponUrl":"${couponUrl}","recommendCouponUrl":["${couponUrl}"],"skuPrice":${z.purchasePriceInfo.thresholdPrice},"pageId":${query.union_page_id},"pageType":5,"source":20221}`,
                                        // 'form':``,
                                        cookie,
                                        algo: {
                                            appI: '66248'
                                        }
                                    }
                                )
                                await this.wait(1000)
                            }
                        }
                        let complete = await this.algo.curl({
                                'url': `https://api.m.jd.com/api?functionId=completeUnionTask&appid=u_activity_h5&loginType=2&client=apple&clientVersion=&body={"unionActTask":"${query.unionActTask}"}`,
                                // 'form':``,
                                cookie,
                                algo: {
                                    appId: '66248'
                                }
                            }
                        )
                        console.log(complete)
                    }
                    else if (this.haskey(i, ['adInfo.target_url', 'taskTargetUrl'])) {
                        let apStart = await this.algo.curl({
                                'url': `https://api.m.jd.com/api`,
                                'form': `functionId=apStartTiming&appid=u_hongbao&_=1716946560092&loginType=2&body={"timerId":"${i.componentId}","uniqueId":"${i.taskId}","jumpUrl":"${encodeURIComponent(this.haskey(i, ['adInfo.target_url', 'taskTargetUrl']))}","jumpType":1}&client=apple&clientVersion=12.3.1&osVersion=15.1.1&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=wifi&openudid=`,
                                cookie,
                                algo: {
                                    appId: '0d977'
                                }
                            }
                        )
                        console.log(this.haskey(apStart, 'errMsg') || apStart)
                        if (this.match(/\d+秒/, i.info)) {
                            let ts = (this.match(/(\d+)秒/, i.info))
                            if (this.sign.verify()) {
                                try {
                                    let z = await this.sign.jdCurl({
                                        url: 'https://api.m.jd.com/client.action',
                                        form: `functionId=apResetTiming&body={"timerId":"${i.componentId}","uniqueId":"${i.taskId}"}&build=169498&client=apple&clientVersion=13.2.8&d_brand=apple&d_model=iPhone13%2C3&ef=1`,
                                        cookie
                                    })
                                    console.log("等待", ts)
                                    await this.wait(parseInt(ts) * 1000)
                                    let y = await this.sign.jdCurl({
                                        url: 'https://api.m.jd.com/client.action',
                                        form: `functionId=apCheckTimingEnd&body={"timerId":"${i.componentId}","uniqueId":"${i.taskId}"}&build=169498&client=apple&clientVersion=13.2.8&d_brand=apple&d_model=iPhone13%2C3&ef=1`,
                                        cookie
                                    })
                                } catch (e) {
                                }
                            }
                            else {
                                console.log("等待", ts)
                                await this.wait(parseInt(ts) * 1000)
                                // console.log(i)
                                let apsDoTask = await this.algo.curl({
                                        'url': `https://api.m.jd.com/api`,
                                        'form': `functionId=apCheckTimingEnd&appid=activities_platform&_=1716946560092&loginType=2&body={"timerId":"${i.componentId}","uniqueId":"${i.taskId}"}&build=169498&client=apple&clientVersion=13.2.8&d_brand=apple&d_model=iPhone13%2C3&ef=1`,
                                        cookie,
                                        algo: {
                                            appId: '0d977'
                                        }
                                    }
                                )
                            }
                        }
                        await this.wait(1000)
                    }
                    else if (i.info.includes("分享")) {
                        let shareUnion = await this.algo.curl({
                                'url': `https://api.m.jd.com/api?functionId=shareUnionCoupon&appid=u_hongbao&_=1716943673297&loginType=2&body={"unionActId":"${this.dict.unionActId}","actId":"${this.dict.actId}","platform":5,"unionShareId":"","d":"${this.dict.d}","supportPic":2,"taskId":"${i.taskId}"}&client=apple&clientVersion=12.3.1&osVersion=15.1.1&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=wifi&openudid=`,
                                cookie,
                                appId: 'c10dc'
                            }
                        )
                        // console.log(shareUnion)/
                        let share = await this.curl({
                                'url': `https://api.m.jd.com/api?functionId=unionShare&appid=u_hongbao&_=1716949639549&loginType=2&body={"funName":"share","param":{"shareReq":[{"shareType":5,"plainUrl":"${this.haskey(shareUnion, 'data.shareUrl')}","command":1}]}}&client=apple&clientVersion=12.3.1&osVersion=15.1.1&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=wifi`,
                                // 'form':``,
                                cookie, algo: {
                                    appId: '18813'
                                }
                            }
                        )
                        let getCoupons = await this.algo.curl({
                                url: `http://api.m.jd.com/api`,
                                form: `functionId=getCoupons&appid=u_hongbao&_=1716912812082&loginType=2&body={"actId":"${this.dict.actId}","unionActId":"${this.dict.unionActId}","platform":5,"d":"${this.dict.d}","unionShareId":"","type":8,"qdPageId":"MO-J2011-1","mdClickId":"jxhongbao_ck","actType":1,"taskId":"${i.taskId}","agreeState":0}&client=apple&clientVersion=1.1.0&osVersion=iOS&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=&openudid=&uuid=17165464753211715186324&aid=&oaid=&ext={"idfa":""}&x-api-eid-token=`,
                                cookie,
                                algo: {
                                    appId: 'c822a'
                                }
                            }
                        )
                        let getCoupons2 = await this.algo.curl({
                                url: `http://api.m.jd.com/api`,
                                form: `functionId=getCoupons&appid=u_hongbao&_=1716912812082&loginType=2&body={"actId":"${this.dict.actId}","unionActId":"${this.dict.unionActId}","platform":5,"d":"${this.dict.d}","unionShareId":"","type":8,"qdPageId":"MO-J2011-1","mdClickId":"jxhongbao_ck","actType":1,"taskId":"${i.taskId}","agreeState":1}&client=apple&clientVersion=1.1.0&osVersion=iOS&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=&openudid=&uuid=17165464753211715186324&aid=&oaid=&ext={"idfa":""}&x-api-eid-token=`,
                                cookie,
                                algo: {
                                    appId: 'c822a'
                                }
                            }
                        )
                        gift.call(this, getCoupons2)
                    }
                    else if (i.info.includes("点击")) {
                        let unionActTask = this.match(/unionActTask=([^\&]+)/, i.taskTargetUrl)
                        this.algo.set({
                            referer: i.taskTargetUrl
                        })
                        let rec = await this.algo.curl({
                                'url': `https://api.m.jd.com/api?functionId=unionSearchRecommend&appid=u_activity_h5&loginType=2&client=apple&clientVersion=&body={"funName":"getSkuByMaterialId","page":{"pageNo":1,"pageSize":20},"param":{"materialId":12354,"sortName":null,"sortType":"","keyword":"","category1":null,"batchId":"","requestScene":1,"source":20200,"clientPageId":"union_activity_265222","packageName":""}}`,
                                // 'form':``,
                                cookie,
                                algo: {
                                    appId: '66248'
                                }
                            }
                        )
                        let ik = 0
                        for (let i of this.random(this.haskey(rec, 'result.goodsSynopsisList') || [], 123)) {
                            if (this.haskey(i, 'purchasePriceInfo.unionCouponList.0.couponLink')) {
                                console.log("正在浏览:", i.skuName)
                                let getUnionActivity = await this.curl({
                                        'url': `https://api.m.jd.com/api?functionId=getUnionActivity&appid=u_activity_h5&loginType=2&client=apple&clientVersion=&body={"id":"265222","qdPageId":"MO-J2011-1","mdClickId":"union_activity_paycoupon_expo","skuList":"","skuListSign":"","platform":3,"clientPageId":"union_activity","parentActivityId":"","parentCouponConfigId":""}`,
                                        // 'form':``,
                                        cookie
                                    }
                                )
                                let free = await this.algo.curl({
                                        url: `https://api.m.jd.com/api?functionId=getUnionFreeCoupon&appid=u_activity_h5&loginType=2&client=apple&clientVersion=&body={"couponUrl":"${i.purchasePriceInfo.unionCouponList[0].couponLink}","recommendCouponUrl":["${i.purchasePriceInfo.unionCouponList[0].couponLink}"],"skuPrice":${i.wlPrice},"pageId":265222,"pageType":5,"source":20221}`,
                                        cookie,
                                        algo: {
                                            appId: '66248'
                                        }
                                    }
                                )
                                if (this.haskey(free, 'data')) {
                                    ik++
                                }
                                // console.log(this.dumps(free))
                                if (ik>=5) {
                                    break
                                }
                                await this.wait(1000)
                            }
                        }
                        let comp = await this.algo.curl({
                                'url': `https://api.m.jd.com/api?functionId=completeUnionTask&appid=u_activity_h5&loginType=2&client=apple&clientVersion=&body={"unionActTask":"${(unionActTask)}"}&x-api-eid-token=jdd01VD3JGEPGE54ERTF24JG43RNNY4NFEDZITDT3FYE6NYXFV2B27GNMA6R4QVHVRDBZKC7HS3BHZCRRFX2NBBN5TASNAQRGAFOZFYBTBDI01234567`,
                                // 'form':``,
                                cookie,
                                algo: {
                                    appId: '66248'
                                }
                            }
                        )
                        console.log(comp)
                    }
                }
                else {
                    console.log("任务完成:", i.info)
                }
            }
        }
        qry = await this.algo.curl({
                'url': `https://api.m.jd.com/api?functionId=queryFullGroupInfoMap&appid=u_hongbao&_=1716946027013&loginType=2&body={"actId":"${this.dict.actId}","unionActId":"${this.dict.unionActId}","platform":5,"d":"${this.dict.d}","taskType":1,"prstate":0}&client=apple&clientVersion=12.3.1&osVersion=15.1.1&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=wifi&openudid=&aid=&oaid=`,
                cookie,
                algo: {appId: '7b74b'}
            }
        )
        let getCoupons = await this.algo.curl({
                url: `http://api.m.jd.com/api`,
                form: `functionId=getCoupons&appid=u_hongbao&_=1716912812082&loginType=2&body={"actId":"${this.dict.actId}","unionActId":"${this.dict.unionActId}","platform":5,"d":"${this.dict.d}","unionShareId":"","type":3,"qdPageId":"MO-J2011-1","mdClickId":"jxhongbao_ck","actType":1}&client=apple&clientVersion=1.1.0&osVersion=iOS&screen=390*844&d_brand=iPhone&d_model=iPhone&lang=zh-CN&networkType=&openudid=&uuid=17165464753211715186324&aid=&oaid=&ext={"idfa":""}&x-api-eid-token=`,
                cookie,
                algo: {
                    appId: 'c822a'
                }
            }
        )
        gift.call(this, getCoupons)
    }

    async shareId() {
        let c1 = this.code.slice(0, 2)
        let c2 = this.code.slice(2)
        c2.push(this.random(this.unionShareId, 1)[0])
        c2 = this.random(c2, c2.length + 1)
        this.code = this.unique([...c1, ...c2])
    }
}

module.exports = Main;
