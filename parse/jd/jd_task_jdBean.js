const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东轻松赚豆"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.delay = 1000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: '4.4',
            type: 'main',
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let l = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=pg_channel_page_data&appid=jd-bean-task&body={"paramData":{"token":"2752f370-f499-44cd-b024-7c8e881cf7fe","channel":"","upstreamChannel":"","launchChannel":"APP"},"argMap":{"source":"JBean","ubb_loc":"app.myjbean.my-put.yz-my-put","ubb_info":"eyJwIjoiYnRwIn0%3D%0A"},"riskInformation":{}}`,
                cookie,
                algo: {
                    appId: '4646c'
                }
            }
        )
        let bean = 0
        if (!this.haskey(l, 'data.floorInfoList')) {
            console.log("没有获取到数据")
        }
        for (let i of this.haskey(l, 'data.floorInfoList')) {
            if (i.title == '轻松赚豆') {
                let token = i.token
                for (let j of this.haskey(i, 'floorData.pgTaskListVO.taskInfoList')) {
                    if (j.taskStatus != 3) {
                        console.log("正在浏览:", j.name)
                        if (j.name == '领取下单任务') {
                            for (let jj of this.haskey(l, 'data.floorInfoList')) {
                                if (jj.title == '限时挑战') {
                                    let token2 = jj.token
                                    let id2 = jj.floorData.getHomeTaskInfo.beanShortTasks[0].taskEncId
                                    let q = await this.curl({
                                            'url': `https://api.m.jd.com/`,
                                            'form': `functionId=pg_interact_interface_invoke&appid=jd-bean-task&body={"floorToken":"${token2}","dataSourceCode":"taskReceive","argMap":{"channel":"","launchChannel":"APP","taskEncId":"${id2}"}}`,
                                            cookie,
                                            algo: {
                                                appId: 'a7c04'
                                            }
                                        }
                                    )
                                    break
                                }
                            }
                        }
                        let z = await this.curl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=pg_interact_interface_invoke&appid=jd-bean-task&body={"floorToken":"${token}","dataSourceCode":"taskReceive","argMap":{"launchChannel":"APP","channel":"","taskEncId":"${j.taskEncId}"}}`,
                                cookie,
                                algo: {
                                    appId: 'a7c04'
                                }
                            }
                        )
                        let id = this.haskey(j, 'browseInfoVO.browsePageVOS.0.id') || 0
                        let y = await this.algo.curl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=pg_interact_interface_invoke&appid=jd-bean-task&body={"floorToken":"${token}","dataSourceCode":"taskFinish","argMap":{"launchChannel":"APP","channel":"","taskEncId":"${j.taskEncId}","extParamsStr":{"browseTrxId":${id}}}}`,
                                cookie,
                                algo: {
                                    appId: 'a7c04'
                                }
                            }
                        )
                        let d = await this.algo.curl({
                                'url': `https://api.m.jd.com/`,
                                'form': `functionId=pg_interact_interface_invoke&appid=jd-bean-task&body={"floorToken":"${token}","dataSourceCode":"taskReward","argMap":{"launchChannel":"APP","channel":"","taskEncId":"${j.taskEncId}"}}`,
                                cookie,
                                algo: {
                                    appId: "a7c04"
                                }
                            }
                        )
                        if (this.haskey(d, 'data.beanInfo.beanNum')) {
                            console.log('获得京豆:', d.data.beanInfo.beanNum)
                            bean += d.data.beanInfo.beanNum
                        }
                        else {
                            console.log(d)
                        }
                    }
                }
            }
            else if (i.name == '签到活动') {
                let sign = await this.algo.curl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=pg_interact_interface_invoke&appid=jd-bean-task&body={"floorToken":"${i.token}","dataSourceCode":"signIn","argMap":{"currSignCursor":${i.floorData.signActInfo.currSignCursor},"signActId":${i.id}},"riskInformation":{}}`,
                        cookie,
                        algo: {
                            appId: 'a7c04'
                        }
                    }
                )
                if (this.haskey(sign, 'data.rewardVos')) {
                    console.log("签到成功")
                    for (let kk of sign.data.rewardVos) {
                        if (kk.jingBeanVo) {
                            console.log('获得京豆:', kk.jingBeanVo.beanNum)
                            bean += kk.jingBeanVo.beanNum
                        }
                    }
                }
                else {
                    console.log(this.haskey(sign, 'message') || sign)
                }
            }
        }
        if (bean) {
            this.print(`共获得京豆: ${bean}`, p.user)
        }
    }
}

module.exports = Main;
