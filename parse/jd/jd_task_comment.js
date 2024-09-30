const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东商品自动评价"
        this.cron = "54 13 */3 * *"
        this.task = 'local'
        this.import = ['jdUrl', 'crypto-js', 'fs', 'vm', 'jdAlgo', 'logBill']
        this.hint = {
            comment: "评语1|评语2"
        }
    }

    async prepare() {
        this.code = this.profile.custom || this.profile.comment
        if (!this.code) {
            console.log('没有评语列表,退出执行!')
            this.jump = 1
        }
        else {
            this.code = this.code.split("|")
        }
        this.algo = new this.modules.jdAlgo({
            version: "latest",
            type: 'main'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl(this.modules.jdUrl.app('getCommentWareList', {
            "status": "1",
            "planType": "1",
            "pageIndex": "1",
            "pageSize": "400"
        }, 'post', cookie))
        let n = this.haskey(s, 'commentWareListInfo.wait4CommentCount')
        let text = []
        if (n) {
            console.log(`总共有:${n}个订单未评价`)
            let page = Math.ceil(parseInt(n) / 20)
            if (parseInt(n) % 10<3 && page>1) {
                page = page - 1
            }
            let q = await this.curl(this.modules.jdUrl.app('getCommentWareList', {
                    "status": "1",
                    "planType": "1",
                    "pageIndex": page.toString(),
                    "pageSize": "20"
                }, 'post', cookie)
            )
            if (this.haskey(q, 'commentWareListInfo.commentWareList')) {
                let count = parseInt(this.profile.count || 2)
                for (let i of q.commentWareListInfo.commentWareList.reverse().splice(0, count)) {
                    if (i.ahaInfo && !this.profile.ahaComment) {
                        console.log(`${i.wname}有种草秀活动,跳出自动评价`)
                    }
                    else if (i.jingBeanCounts.length && !this.profile.beanComment) {
                        console.log(`${i.wname}有评价有礼活动,跳出自动评价`)
                    }
                    else {
                        console.log(`正在评论: ${i.wname}`)
                        let content = this.random(this.code, 1)[0]
                        let body = await this.body({
                            "tenantCode": "jgm",
                            "bizModeClientType": "M",
                            "bizModeFramework": "H5",
                            "appId": "m91d27dbf599dff74",
                            "token": "3852b12f8c4d869b7ed3e2b3c68c9436",
                            "uuid": this.uuid(26, 'n'),
                            "externalLoginType": "2",
                            "productId": i.wareId,
                            "orderId": i.orderId,
                            "score": 5,
                            "content": content,
                            "commentTagStr": 1,
                            "userclient": 21,
                            "imageJson": "",
                            "anonymous": 1,
                            "syncsg": 0,
                            "scence": 101100000,
                            "videoid": "",
                            "URL": "",
                        })
                        let pub = await this.algo.curl({
                                'url': `https://api.m.jd.com/api`,
                                'form': `functionId=sendEval&appid=jd-cphdeveloper-m&body=${this.dumps(body)}`,
                                cookie,
                                algo: {
                                    appId: 'c397b'
                                }
                            }
                        )
                        if (this.haskey(pub, 'errMsg', 'success')) {
                            this.print(`订单: ${i.orderId} 评价成功`, p.user)
                            console.log(`开始评价物流服务,等待3秒...`)
                            await this.wait(3000)
                            let wuliu = await this.algo.curl({
                                    'url': `https://api.m.jd.com/api?body=${this.dumps({
                                        "tenantCode": "jgm",
                                        "bizModeClientType": "M",
                                        "bizModeFramework": "H5",
                                        "appId": "m91d27dbf599dff74",
                                        "token": "3852b12f8c4d869b7ed3e2b3c68c9436",
                                        "uuid": "23359972496631655993291202",
                                        "externalLoginType": "2",
                                        "pin": p.user,
                                        "userclient": 21,
                                        "orderId": i.orderId,
                                        "otype": "0",
                                        "DSR1": 5,
                                        "DSR2": 5,
                                        "DSR3": 5
                                    })}&appid=jd-cphdeveloper-m&functionId=sendDSR&loginType=2&_=1657256643322&g_login_type=0&callback=jsonpCBKD&g_tk=534892547&g_ty=ls&appCode=msd95910c4`,
                                    cookie,
                                    algo: {
                                        appId: 'c397b'
                                    }
                                }
                            )
                            if (this.haskey(wuliu, 'errMsg', 'success')) {
                                this.print(`订单: ${i.orderId} 物流评价成功`, p.user)
                            }
                            else {
                                console.log(`物流评价失败`)
                            }
                        }
                        else {
                            console.log(`评价失败`)
                        }
                        console.log("等待8秒,执行下一次评价...")
                        await this.wait(8000)
                    }
                }
            }
        }
        else {
            console.log(p.user, `没有待评价订单!`)
        }
        if (text.length) {
            this.notices(text.join("\n"), p.user)
        }
    }

    async body(params) {
        delete this.smashUtils
        let js = await this.modules.fs.readFileSync(this.dirname + '/static/vendors.683f5a61.js', 'utf-8')
        const fnMock = new Function;
        const ctx = {
            window: {addEventListener: fnMock},
            document: {
                addEventListener: fnMock,
                removeEventListener: fnMock,
            },
            navigator: {userAgent: `okhttp/3.12.1;jdmall;android;version/9.5.4;build/${this.rand(10000, 99999)};screen/1440x3007;os/11;network/wifi;`}
        };
        this.modules.vm.createContext(ctx);
        this.modules.vm.runInContext(js, ctx);
        this.smashUtils = ctx.window.smashUtils;
        let random = this.smashUtils.getRandom(8)
        let log = this.smashUtils.get_risk_result({
            id: random,
            data: {
                random
            }
        }).log;
        let b = {
            "random": random,
            log
        }
        return {...b, ...params}
    }
}

module.exports = Main;
