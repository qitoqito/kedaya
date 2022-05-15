const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京喜签到领红包"
        this.cron = "10 0,22 * * *"
        this.task = 'local'
        this.import = ['jdAlgo']
        this.overtime = 9
        this.model = "shuffle"
        this.turn = 2
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({'appId': 10038, 'type': 'pingou'})
        let smp = ''
        for (let i of this.cookies['help']) {
            let signhb = await this.algo.curl({
                url: `https://m.jingxi.com/fanxiantask/signhb/query?signhb_source=5&smp=${smp}&type=0&_stk=signhb_source%2Csmp%2Ctype&_ste=1&g_ty=ls&g_tk=181187500&sceneval=2&g_login_type=1`,
                cookie: i
            })
            if (signhb.smp) {
                smp = signhb.smp
                let report = await this.algo.curl({
                        'url': `https://m.jingxi.com/activetmp/helpdraw/sharereport?call=reportshare&active=copy_qiandaolinghongbao1&hj=jx_app&sharetype=2&shareid=${smp}&idowner=&idctime=1652027061747&reportrefer=https%3A%2F%2Fwq.jd.com%2Fcube%2Ffront%2FactivePublish%2Fqdlhb%2F520923.html&activityid=&gpin=&gp_adr_id=&_=1652027061751&sceneval=2&g_login_type=1&callback=jsonpCBKF&g_ty=ls&appCode=msd1188198`,
                        // 'form':``,
                        cookie: i
                    }
                )
                this.shareCode.push({'smp': smp})
            }
        }
    }

    async assist(p) {
        let cookie = p.cookie
        let s = await this.algo.curl({
            url: `https://wq.jd.com/fanxiantask/signhb/query?signhb_source=5&smp=${p.inviter.smp}&type=0&_stk=signhb_source%2Csmp%2Ctype&_ste=2`,
            cookie
        })
        console.log(p.user, s.todaysign);
        await this.wait(1000)
        let ss = await this.algo.curl({
            url: `https://wq.jd.com/fanxiantask/signhb/query?signhb_source=5&smp=${p.inviter.smp}&type=1&_stk=signhb_source%2Csmp%2Ctype&_ste=2`,
            cookie
        })
        console.log(p.user, ss.todaysign);
    }

    async main(p) {
        let cookie = p.cookie;
        for (let kk of ['hb', 'xd']) {
            switch (kk) {
                case 'xd':
                    var queryUrl = `https://m.jingxi.com/fanxiantask/signhb/query_jxpp?type=1&signhb_source=5&smp=bd67efc3be1c59bcab4f8b90e3a0f708&ispp=1&tk=&encrypt=&_stk=encrypt%2Cispp%2Csignhb_source%2Csmp%2Ctk%2Ctype&_ste=1`
                    break
                default:
                    var queryUrl = `https://m.jingxi.com/fanxiantask/signhb/query?type=1&signhb_source=5&smp=bd67efc3be1c59bcab4f8b90e3a0f708&ispp=0&tk=&_stk=ispp%2Csignhb_source%2Csmp%2Ctk%2Ctype&_ste=1`
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
        if (new Date().getDay() == 5) {
            await this.wait(3000)
            let draw = await this.curl({
                    'url': `https://jxa.jd.com/wq.jd.com/fanxiantask/signhb/fridaydraw?g_ty=mp&g_tk=621647716&appCode=msc9ed9e31&sceneval=2&g_login_type=1&site=2`,
                    // 'form':``,
                    cookie
                }
            )
            if (this.haskey(draw, 'prize.0.discount')) {
                console.log(`获得京喜红包: ${draw.prize[0].discount}`)
                this.notices(`获得京喜红包: ${draw.prize[0].discount}`, p.user)
            }
            else {
            }
        }
    }
}

module
    .exports = Main;
