const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京喜签到领红包"
        this.cron = "22 3,21 * * *"
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({'appId': 10038, 'type': 'pingou'})
    }

    async main(p) {
        let cookie = p.cookie;
        for (let kk of ['hb', 'xd']) {
            switch (kk) {
                case 'xd':
                    var queryUrl = `https://m.jingxi.com/fanxiantask/signhb/query_jxpp?type=1&signhb_source=5&smp=&ispp=1&tk=&encrypt=&_stk=encrypt%2Cispp%2Csignhb_source%2Csmp%2Ctk%2Ctype&_ste=1`
                    break
                default:
                    var queryUrl = `https://m.jingxi.com/fanxiantask/signhb/query?type=1&signhb_source=5&smp=&ispp=0&tk=&_stk=ispp%2Csignhb_source%2Csmp%2Ctk%2Ctype&_ste=1`
                    break
            }
            let s = await this.algo.curl({
                    'url': queryUrl,
                    cookie
                }
            )
            for (let i of s.commontask || []) {
                if (i.status != 2) {
                    if (i.taskLink) {
                        await this.curl({
                                'url': `https:${i.taskLink}`,
                                cookie
                            }
                        )
                    }
                    switch (kk) {
                        case 'xd':
                            var taskUrl = `https://m.jingxi.com/fanxiantask/signhb/dotask_jxpp?ispp=1&sqactive=${s.sqactive}&task=${i.task}&signhb_source=5&ispp=0&sqactive=&tk=&_stk=ispp%2Csignhb_source%2Csqactive%2Ctask%2Ctk&_ste=1`
                            break
                        default:
                            var taskUrl = `https://m.jingxi.com/fanxiantask/signhb/dotask?task=${i.task}&signhb_source=5&ispp=0&sqactive=&tk=&_stk=ispp%2Csignhb_source%2Csqactive%2Ctask%2Ctk&_ste=1`
                            break
                    }
                    let ss = await this.algo.curl({
                            'url': taskUrl,
                            // 'form':``,
                            cookie
                        }
                    )
                    if ([145, 1003].includes(ss.ret)) {
                        console.log(ss.errmsg || '黑号')
                        return
                    }
                    console.log(i.taskname, ss.sendhb || ss.sendxd)
                    if (i.browsetime) {
                        await this.wait(parseInt(i.browsetime) * 1000)
                    }
                    switch (kk) {
                        case 'xd':
                            var doUrl = `https://m.jingxi.com/fanxiantask/signhb/fxquery_jxpp?ispp=1&sqactive=${s.sqactive}&_=1650454134963&sceneval=2&g_login_type=1&callback=jsonpCBKX&g_ty=ls&appCode=msd1188198`
                            break
                        default:
                            var doUrl = `https://m.jingxi.com/fanxiantask/signhb/fxquery?ispp=0&_=1650454134963&sceneval=2&g_login_type=1&callback=jsonpCBKX&g_ty=ls&appCode=msd1188198`
                            break
                    }
                    let e = await this.algo.curl({
                            'url': doUrl,
                            // 'form':``,
                            cookie
                        }
                    )
                }
            }
            // 打开宝箱
            for (let i of Array(5)) {
                switch (kk) {
                    case 'xd':
                        var drawUrl = `https://m.jingxi.com/fanxiantask/signhb/bxdraw_jxpp?ispp=1&sqactive=${s.sqactive}&tk=&_=1637034318890&sceneval=2&g_login_type=1`
                        break
                    default:
                        var drawUrl = `https://m.jingxi.com/fanxiantask/signhb/bxdraw?ispp=0&sqactive=&tk=&_stk=ispp%2Csqactive%2Ctk&_ste=1`
                        break
                }
                let uu = await this.algo.curl({
                        'url': drawUrl,
                        cookie
                    }
                )
                if (uu && uu.ret != 0) {
                    console.log("宝箱开完了")
                    break
                }
                else {
                    console.log("宝箱红包:", uu.sendhb || uu.sendxd)
                }
            }
        }
    }
}

module.exports = Main;
