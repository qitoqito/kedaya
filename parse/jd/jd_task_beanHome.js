const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东领京豆"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.help = 'main'
        this.task = 'local'
        this.import = ['jdAlgo']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: 'latest',
            type: 'main'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let gifts = []
        let uuid = this.md5(cookie)
        this.feeds = Array(8).fill(0).map(d => this.rand(10000000, 20000000).toString())
        if (this.feeds) {
            for (let i of this.feeds) {
                console.log(`正在浏览任务`)
                // this.feeds[i] || this.rand(10000000, 20000000).toString()
                let task = await this.algo.curl({
                        url: `https://api.m.jd.com/client.action?functionId=beanHomeTask&body={"skuId":"${i}","awardFlag":false,"type":"1","source":"feeds","scanTime":${new Date().getTime()}}&appid=ld&client=apple&clientVersion=12.3.4&networkType=wifi&osVersion=15.1.1&loginType=2&screen=390*753&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&jsonp=jsonp_1691746000054_62149`,
                        cookie
                    }
                )
                // console.log(task)
                if (!this.haskey(task, 'data')) {
                    console.log(this.haskey(task, 'errorMessage'))
                    break
                }
                else {
                    console.log(`正在浏览任务[${task.data.taskProgress}/${task.data.taskThreshold}]`)
                }
                if (this.haskey(task, 'data.taskProgress') == this.haskey(task, 'data.taskThreshold')) {
                    console.log(`浏览任务完成,正在抽奖`)
                    let reward = await this.algo.curl({
                            'url': `https://api.m.jd.com/client.action?functionId=beanHomeTask&body=${this.dumps({
                                "awardFlag": true,
                                "source": "feeds"
                            })}&appid=ld&client=apple&clientVersion=12.3.4&networkType=wifi&osVersion=15.1.1&loginType=2&screen=390*753&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&jsonp=jsonp_1691746000054_62149`,
                            cookie
                        }
                    )
                    if (this.haskey(reward, 'data.beanNum')) {
                        console.log('获得京豆:', reward.data.beanNum)
                        gifts.push(reward.data.beanNum)
                    }
                    break
                }
                await this.wait(2000)
            }
            await this.wait(2000)
            console.log("正在浏览商品任务")
            for (let i of this.feeds) {
                let doWork = await this.algo.curl({
                        'url': `https://api.m.jd.com/client.action`,
                        'form': `appid=signed_wh5_ihub&client=apple&clientVersion=12.3.4&networkType=wifi&openudid=8c3f8d472369de5fe279c81424c80d2253a73410&osVersion=15.1.1&screen=390*844&uuid=8c3f8d472369de5fe279c81424c80d2253a73410&d_model=iPhone13,3&body={"skuId":"${i}","taskType":1}&functionId=seckillViewTask&x-api-eid-token=jdd03C3HUEKC6G2V5WV6SOXJV5E4J2ILKIIHLPARTU7DKUSMS72ICFUVMMF7ZVZXDON6VLTUCVU2GNZ2RZRMVIDXGF2FBMUAAAAMOGVFCBEIAAAAAC2Z5WJ4M6S4ME4X&t=1710291260447`,
                        cookie,
                        algo: {
                            appId: '8f7ef'
                        }
                    }
                )
                if (!this.haskey(doWork, 'data.taskProgress')) {
                    console.log(this.haskey(doWork, 'errorMessage'))
                    let reward = await this.algo.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `appid=signed_wh5_ihub&client=apple&clientVersion=12.3.4&networkType=wifi&openudid=8c3f8d472369de5fe279c81424c80d2253a73410&osVersion=15.1.1&screen=390*844&uuid=8c3f8d472369de5fe279c81424c80d2253a73410&d_model=iPhone13,3&body={"taskType":2}&functionId=seckillViewTask&x-api-eid-token=jdd03C3HUEKC6G2V5WV6SOXJV5E4J2ILKIIHLPARTU7DKUSMS72ICFUVMMF7ZVZXDON6VLTUCVU2GNZ2RZRMVIDXGF2FBMUAAAAMOGVFCBEIAAAAAC2Z5WJ4M6S4ME4X&t=1710291260447`,
                            cookie,
                            algo: {
                                appId: '8f7ef'
                            }
                        }
                    )
                    if (this.haskey(reward, 'data.taskProgress')) {
                        this.print(`获得京豆:${reward.data.beanNum}`, p.user)
                    }
                    break
                }
                console.log(`正在浏览商品[${doWork.data.taskProgress}/${doWork.data.taskThreshold}] 可获得${doWork.data.beanNum}京豆`)
                if (doWork.data.taskProgress == doWork.data.taskThreshold) {
                    let reward = await this.algo.curl({
                            'url': `https://api.m.jd.com/client.action`,
                            'form': `appid=signed_wh5_ihub&client=apple&clientVersion=12.3.4&networkType=wifi&openudid=8c3f8d472369de5fe279c81424c80d2253a73410&osVersion=15.1.1&screen=390*844&uuid=8c3f8d472369de5fe279c81424c80d2253a73410&d_model=iPhone13,3&body={"taskType":2}&functionId=seckillViewTask&x-api-eid-token=jdd03C3HUEKC6G2V5WV6SOXJV5E4J2ILKIIHLPARTU7DKUSMS72ICFUVMMF7ZVZXDON6VLTUCVU2GNZ2RZRMVIDXGF2FBMUAAAAMOGVFCBEIAAAAAC2Z5WJ4M6S4ME4X&t=1710291260447`,
                            cookie,
                            algo: {
                                appId: '8f7ef'
                            }
                        }
                    )
                    if (this.haskey(reward, 'data.taskProgress')) {
                        console.log('获得京豆:', reward.data.beanNum)
                        gifts.push(reward.data.beanNum)
                    }
                    break
                }
                await this.wait(2000)
            }
        }
        let taskList = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action?functionId=findBeanScene&body=${this.dumps({
                    "source": "AppHome",
                    "viewChannel": "AppHome",
                    "rnVersion": "3.9",
                    "rnClient": "1",
                    "appid": "ea6f2",
                    "needSecurity": true,
                    "bizId": "active"
                })}&appid=ld&client=apple&build=167283&clientVersion=9.1.0&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&area=0_0_0_0&jsonp=jsonp_1691742966852_76927`,
                // 'form':``,
                cookie
            }
        )
        await this.wait(2000)
        for (let i of this.haskey(taskList, 'data.floorList')) {
            switch (i.floorName) {
                case '种豆得豆定制化场景':
                    if (!i.viewed) {
                        console.log(`执行任务:`, i.mainTitle)
                        let doing = await this.algo.curl({
                                'url': `https://api.m.jd.com/client.action?functionId=beanHomeTask&body=${this.dumps({
                                    "awardFlag": false,
                                    "itemId": "zddd",
                                    "source": "home",
                                    "type": "3"
                                })}&appid=ld&client=apple&build=167283&clientVersion=9.1.0&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&area=0_0_0_0&jsonp=jsonp_1691742966852_76927`,
                                // 'form':``,
                                cookie
                            }
                        )
                        console.log(doing)
                        await this.wait(2000)
                    }
                    else {
                        console.log(`任务完成:`, i.mainTitle)
                    }
                    break
                case '赚京豆':
                    for (let j of this.haskey(i, 'stageList')) {
                        if (!j.viewed) {
                            console.log(`执行任务:`, j.mainTitle)
                            let doing = await this.algo.curl({
                                    'url': `https://api.m.jd.com/client.action?functionId=beanHomeTask&body=${this.dumps({
                                        "awardFlag": false,
                                        "itemId": j.stageId,
                                        "source": "home",
                                        "type": `4_${j.stageId}`
                                    })}&appid=ld&client=apple&build=167283&clientVersion=9.1.0&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&area=0_0_0_0&jsonp=jsonp_1691742966852_76927`,
                                    // 'form':``,
                                    cookie
                                }
                            )
                            console.log(doing)
                            await this.wait(2000)
                        }
                        else {
                            console.log(`任务完成:`, j.mainTitle)
                        }
                    }
                    break
            }
        }
        let reward = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action?functionId=beanHomeTask&body=${this.dumps({
                    "awardFlag": true,
                    "source": "home"
                })}&appid=ld&client=apple&build=167283&clientVersion=9.1.0&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&area=0_0_0_0&jsonp=jsonp_1691742966852_76927`,
                cookie
            }
        )
        if (this.haskey(reward, 'data.beanNum')) {
            console.log('获得京豆:', reward.data.beanNum)
            gifts.push(reward.data.beanNum)
        }
        for (let n = 0; n<5; n++) {
            let unlock = 1
            let beanTaskList = await this.algo.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=beanTaskList&body={"viewChannel":"AppHome","beanVersion":1,"imei":"${uuid}","prstate":"0","aid":"","idfa":"","op_type":1,"app_info":"390*753^iPhone13,3^apple^12.3.4^wifi","location_info":"0-0-0"}&appid=ld&client=apple&clientVersion=12.3.4&networkType=wifi&osVersion=15.1.1&loginType=2&screen=390*753&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&area=0_0_0_0&jsonp=jsonp_1691742966852_76927`,
                    cookie
                }
            )
            if (this.haskey(beanTaskList, 'data.viewAppHome') && n == 0) {
                if (!beanTaskList.data.viewAppHome.takenTask) {
                    console.log(`执行任务: ${beanTaskList.data.viewAppHome.mainTitle}`)
                    let iconTask = await this.algo.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=beanHomeIconDoTask&body=${this.dumps({
                            "flag": "0",
                            "viewChannel": "AppHome"
                        })}&appid=ld&client=apple&build=167283&clientVersion=9.1.0&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&area=0_0_0_0&jsonp=jsonp_1691742966852_76927`,
                        cookie
                    })
                }
                await this.wait(2000)
                if (!beanTaskList.data.viewAppHome.doneTask) {
                    console.log(`领取奖励: ${beanTaskList.data.viewAppHome.mainTitle}`)
                    let beanHomeIconDoTask = await this.algo.curl({
                        'url': `https://api.m.jd.com/client.action?functionId=beanHomeIconDoTask&body=${this.dumps({
                            "flag": "1",
                            "viewChannel": "AppHome"
                        })}&appid=ld&client=apple&build=167283&clientVersion=9.1.0&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&area=0_0_0_0&jsonp=jsonp_1691742966852_76927`,
                        cookie
                    })
                    if (this.haskey(beanHomeIconDoTask, 'data.growthResult.sceneLevelConfig.beanNum')) {
                        console.log(`获得京豆:`, beanHomeIconDoTask.data.growthResult.sceneLevelConfig.beanNum)
                        gifts.push(beanHomeIconDoTask.data.growthResult.sceneLevelConfig.beanNum)
                    }
                }
                else {
                    console.log("任务已经完成:", beanTaskList.data.viewAppHome.mainTitle)
                }
            }
            for (let i of this.haskey(beanTaskList, 'data.taskInfos')) {
                if (i.status != 2) {
                    unlock = 0
                    let doTask = await this.algo.curl({
                            'url': `https://api.m.jd.com/client.action?functionId=beanDoTask&body={"actionType":1,"taskToken":"${i.subTaskVOS[0].taskToken}"}&appid=ld&client=apple&clientVersion=12.3.4&networkType=wifi&osVersion=15.1.1&loginType=2&screen=390*753&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&jsonp=jsonp_1691745591235_71237`,
                            cookie
                        }
                    )
                    if (i.waitDuration) {
                        await this.wait(i.waitDuration * 1000)
                        doTask = await this.algo.curl({
                                'url': `https://api.m.jd.com/client.action?functionId=beanDoTask&body={"actionType":0,"taskToken":"${i.subTaskVOS[0].taskToken}"}&appid=ld&client=apple&clientVersion=12.3.4&networkType=wifi&osVersion=15.1.1&loginType=2&screen=390*753&uuid=${uuid}&openudid=${uuid}&d_model=iPhone13,3&jsonp=jsonp_1691745591235_71237`,
                                cookie
                            }
                        )
                    }
                    if (this.haskey(doTask, 'data.bizMsg')) {
                        console.log(doTask.data.bizMsg)
                    }
                    await this.wait(2000)
                }
                else {
                    if (n == 0) {
                        console.log(`任务完成:`, i.taskName)
                    }
                }
            }
            if (unlock) {
                break
            }
        }
        let signBeanAct = await this.algo.curl({
                'url': "https://api.m.jd.com/",
                'form': `functionId=signBeanAct&body={}&appid=signed_wh5_ihub&client=apple&screen=414*896&networkType=wifi&openudid=60f0226f67be77007d7dc5817801e282dda1211e&uuid=60f0226f67be77007d7dc5817801e282dda1211e&clientVersion=12.3.5&d_model=0-2-999&osVersion=15.6.1`,
                cookie,
                algo: {
                    appId: '9d49c',
                    // type: 'main',
                },
            }
        )
     
        if (this.haskey(signBeanAct, 'data.dailyAward.beanAward.beanCount')) {
            console.log(`领京豆: ${this.haskey(signBeanAct, 'data.dailyAward.beanAward.beanCount')}`)
            gifts.push(this.haskey(signBeanAct, 'data.dailyAward.beanAward.beanCount'))
        }
        else if (this.haskey(signBeanAct, 'data.continuityAward.beanAward.beanCount')) {
            console.log(`领京豆: ${this.haskey(signBeanAct, 'data.continuityAward.beanAward.beanCount')}`)
            gifts.push(this.haskey(signBeanAct, 'data.continuityAward.beanAward.beanCount'))
        }
        if (gifts.length>0) {
            let sum = this.sum(gifts)
            console.log(`共获得京豆:`, sum)
            this.notices(`获得京豆: ${sum}`, p.user)
        }
    }
}

module.exports = Main;
