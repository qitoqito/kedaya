const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东摇京豆"
        this.cron = "23 0,22 * * *"
        this.task = 'local'
        this.thread = 3
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
        this.algo.set({
            'appId': 'c04c9',
            'type': 'app',
            'fp': '5960318609667564',
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let data = await this.algo.curl({
                'url': `https://api.m.jd.com/?appid=sharkBean&functionId=pg_channel_page_data&body=${this.dumps({
                    "paramData": {"token": "dd2fb032-9fa3-493b-8cd0-0d57cd51812d", "device": "APP"},
                })}`,
                cookie
            }
        )
        if (this.haskey(data, 'data.floorInfoList')) {
            let beanNum = 0;
            let column = this.column(data.data.floorInfoList, '', 'code')
            let token = column.SIGN_ACT_INFO.token
            let floorData = column.SIGN_ACT_INFO.floorData || {}
            let currSignCursor = this.haskey(floorData, 'signActInfo.currSignCursor')
            let signStatus = this.haskey(floorData, `signActInfo.signActCycles.${parseInt(currSignCursor) - 1}.signStatus`)
            if (signStatus == -1) {
                let signin = await this.algo.curl({
                        'url': `https://api.m.jd.com/?appid=sharkBean&functionId=pg_interact_interface_invoke&body=${this.dumps({
                            "floorToken": token,
                            "dataSourceCode": "signIn",
                            "argMap": {"currSignCursor": currSignCursor}
                        })}`,
                        cookie
                    }
                )
                if (signin.success && signin.data) {
                    beanNum = this.haskey(signin, 'data.rewardVos.0.jingBeanVo.beanNum')
                    console.log(`京东会员成功签到: ${currSignCursor}天, 获得: ${beanNum}京豆`)
                }
            }
            else {
                console.log(`京东会员签到: ${currSignCursor}天`)
            }
            let task = await this.algo.curl({
                    'url': `https://api.m.jd.com/?appid=vip_h5&functionId=vvipclub_lotteryTask&body={"info":"browseTask","withItem":true}`,
                    // 'form':``,
                    cookie
                }
            )
            if (this.haskey(task, 'data.0.taskItems')) {
                for (let i of task.data[0].taskItems) {
                    if (i.finish) {
                        console.log("任务已完成:", i.title)
                    }
                    else {
                        let doTask = await this.algo.curl({
                                'url': `https://api.m.jd.com/?appid=vip_h5&functionId=vvipclub_doTask&body={"taskName":"browseTask","taskItemId":${i.id}}`,
                                // 'form':``,
                                cookie
                            }
                        )
                        console.log("正在执行:", i.title, doTask.success)
                    }
                }
            }
            for (let i = 0; i<20; i++) {
                let lottery = await this.algo.curl({
                        'url': `https://api.m.jd.com/?appid=sharkBean&functionId=vvipclub_shaking_lottery&body={}`,
                        // 'form':``,
                        cookie
                    }
                )
                if (lottery.success) {
                    console.log(`剩余摇奖次数：${lottery.data.remainLotteryTimes}`)
                    if (lottery.data.remainLotteryTimes == 0) {
                        break
                    }
                    if (lottery.data && lottery.data.rewardBeanAmount) {
                        beanNum += lottery.data.rewardBeanAmount;
                        console.log(`获得: ${lottery.data.rewardBeanAmount}京豆`)
                    }
                    else {
                        console.log(`未中奖`)
                    }
                }
                else {
                    break
                }
            }
            if (beanNum) {
                console.log(`共获得京豆: ${beanNum}`)
                this.notices(`获得京豆: ${beanNum}`, p.user)
            }
        }
        else {
            console.log("没有获取到数据")
        }
    }
}

module.exports = Main;
