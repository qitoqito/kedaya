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
            console.log(`获得新号奖励:`, this.haskey(userInfo, 'data.userBase.userAward'))
        }
        for (let kk of Array(2)) {
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
        }
    }
}

module.exports = Main;
