const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京喜购物金"
        this.cron = "44 7,20 * * *"
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set(
            {
                type: 'pingou',
                appId: 'c4dc6',
                verify: 1,
                fp: '4800824416375898'
            }
        )
    }

    async main(p) {
        let cookie = p.cookie;
        let userInfo = await this.algo.curl({
                'url': `https://m.jingxi.com/prmt_playearn/playearn/userinfo?g_ty=h5&g_tk=&appCode=msd1188198&__t=1652858891787&_stk=__t&_ste=1`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(userInfo, 'data.userBase.isNewUser', 1)) {
            console.log(`获得新号奖励金币:`, this.haskey(userInfo, 'data.userBase.userAward'))
        }
        for (let kk of Array(2)) {
            let isOk = 1
            let task = await this.algo.curl({
                    'url': `https://m.jingxi.com/newtasksys/newtasksys_front/GetUserTaskStatusList?g_ty=h5&g_tk=&appCode=msd1188198&__t=1652859180554&source=bwbz&bizCode=bwbz&sceneval=2&callback=__jsonp1652858779865`,
                    // 'form':``,
                    cookie
                }
            )
            for (let i of this.haskey(task, 'data.userTaskStatusList')) {
                if (i.awardStatus == 1) {
                    console.log('任务完成:', i.taskName
                    )
                }
                else {
                    console.log(`正在运行:`, i.taskName)
                    if (i.dateType == 2) {
                        if (!i.ext2) {
                            for (let n of Array(i.configTargetTimes)) {
                                isOk = 0
                                console.log(`执行中...`)
                                let doTask = await this.algo.curl({
                                        'url': `https://m.jingxi.com/newtasksys/newtasksys_front/DoTask?g_ty=h5&g_tk=&appCode=msd1188198&__t=1652860784328&source=bwbz&isSecurity=true&taskId=${i.taskId}&bizCode=bwbz&configExtra=&sceneval=2&callback=__jsonp1652858779895`,
                                        // 'form':``,
                                        cookie
                                    }
                                )
                                await this.wait(1000)
                                let award = await this.algo.curl({
                                        'url': `https://m.jingxi.com/newtasksys/newtasksys_front/Award?g_ty=h5&g_tk=&appCode=msd1188198&__t=1652860723372&source=bwbz&taskId=${i.taskId}&bizCode=bwbz&sceneval=2&callback=__jsonp1652858779889`,
                                        // 'form':``,
                                        cookie
                                    }
                                )
                                await this.wait(1000)
                            }
                        }
                    }
                    else if (i.configTargetTimes == i.completedTimes) {
                        let award = await this.algo.curl({
                                'url': `https://m.jingxi.com/newtasksys/newtasksys_front/Award?g_ty=h5&g_tk=&appCode=msd1188198&__t=1652860723372&source=bwbz&taskId=${i.taskId}&bizCode=bwbz&sceneval=2&callback=__jsonp1652858779889`,
                                // 'form':``,
                                cookie
                            }
                        )
                        console.log(award)
                    }
                }
                // if (i.configTargetTimes != i.completedTimes) {
            }
            if (isOk) {
                break
            }
        }
        for (let i = 0; i<30; i++) {
            console.log(`正在抽奖`)
            let open = await this.algo.curl({
                    'url': `https://m.jingxi.com/prmt_playearn/playearn/openbox?g_ty=h5&g_tk=&appCode=msd1188198&__t=1652862927551&_stk=__t&_ste=1`,
                    // 'form':``,
                    cookie
                }
            )
            console.log(this.haskey(open, 'data'))
            if (this.haskey(open, 'data.shoppingGoldAmount')) {
                console.log(`获得金币`, open.data.shoppingGoldAmount)
            }
            if (i % 3 == 2) {
                console.log(`正在抽解锁礼包`)
                let step = await this.algo.curl({
                        'url': `https://m.jingxi.com/prmt_playearn/playearn/openstepbox?g_ty=h5&g_tk=&appCode=msd1188198&__t=1652863209128&_stk=__t&_ste=1`,
                        // 'form':``,
                        cookie
                    }
                )
                if (this.haskey(step, 'data.shoppingGoldAmount')) {
                    console.log(`获得金币`, step.data.shoppingGoldAmount)
                }
            }
            await this.wait(1000)
            if (!this.haskey(open, 'data')) {
                console.log(`没有抽奖机会`)
                break
            }
        }
        userInfo = await this.algo.curl({
                'url': `https://m.jingxi.com/prmt_playearn/playearn/userinfo?g_ty=h5&g_tk=&appCode=msd1188198&__t=1652858891787&_stk=__t&_ste=1`,
                // 'form':``,
                cookie
            }
        )
        if (this.haskey(userInfo, 'data.skuList')) {
            let coin = `当前购物金: ${this.haskey(userInfo, 'data.userProperty.shoppingGold')}`

            let gifts = [...[coin, '积分换购'], ...this.column(userInfo.data.skuList, 'name')]
            console.log(gifts.join("\n"))
            this.notices(coin, p.user)
        }
    }
}

module.exports = Main;
