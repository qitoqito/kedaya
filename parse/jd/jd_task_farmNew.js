const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东新农场"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 9)},${this.rand(14, 21)} * * *`
        this.help = 'main'
        this.task = 'local'
        this.import = ['fs', 'jdAlgo']
        this.hint = {
            'tenWater': '1 #每天只做10次浇水任务',
            'stock': "100 #保留水滴数",
            'cache': "1 #缓存助力code,设置后不会每次运行后都把助力码都写入json",
            'tree': '1 #如果检测到没有种树,自动选择一个商品进行种植'
        }
        this.turn = 2
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            appId: "c57f6",
            type: 'main',
            version: "4.2",
            refere: 'https://h5.m.jd.com/pb/015686010/Bc9WX7MpCW7nW9QjZ5N3fFeJXMH/index.html'
        })
        this._cc = 0
        try {
            let txt = this.modules.fs.readFileSync(`${this.dirname}/invite/jd_task_farmNew.json`).toString()
            this.dict = this.loads(txt)
            this._cc = 1
        } catch (e) {
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let stock = parseInt(this.profile.stock || 20)
        for (let i of Array(3)) {
            var farmHome = await this.wget({
                fn: 'farm_home',
                body: {"version": 3},
                algo: {appId: 'c57f6'},
                cookie
            })
            if (this.haskey(farmHome, 'data.result')) {
                break
            }
        }
        if (this.turnCount == 1) {
            if (!this.cookies.help.includes(cookie)) {
                console.log("本轮运行助力水滴获取,当前账号不是被助力账号,此次将跳过运行")
                return
            }
        }
        if (this.haskey(farmHome, 'data.bizCode', -1001)) {
            console.log("活动火爆...")
            return
        }
        let home = this.haskey(farmHome, 'data.result') || {}
        if (this.haskey(farmHome, 'code', -30001)) {
            console.log("cookie失效,登陆失败")
            return
        }
        else if (this.haskey(home, 'treeFullStage', 5) && this.turnCount == 0) {
            this.print('可以兑换商品了', p.user)
        }
        if (!home.skuName) {
            console.log("没有种树")
            let board = await this.wget({
                fn: 'farm_tree_board',
                body: {"version": 3},
                algo: {},
                cookie
            })
            try {
                let skus = board.data.result.farmTreeLevels[0].farmLevelTrees[0]
                console.log("正在种树,选择商品:", skus.skuName)
                let tree = await this.wget({
                    fn: 'farm_plant_tree',
                    body: {"version": 3, "uid": skus.uid},
                    algo: {},
                    cookie
                })
                if (this.haskey(tree, 'data.success')) {
                    farmHome = await this.wget({
                        'fn': 'farm_home',
                        'body': {"version": 3},
                        algo: {appId: 'c57f6'},
                        cookie,
                    })
                    home = this.haskey(farmHome, 'data.result') || {}
                }
                else {
                    console.log("种树失败")
                    return
                }
            } catch (e) {
                console.log("种树失败")
                return
            }
        }
        let inviteCode = home.farmHomeShare.inviteCode
        let bottleWater = home.bottleWater
        console.log("当前进度:", home.waterTips)
        if (!this.dict[p.user]) {
            this.dict[p.user] = {inviteCode}
        }
        let helpError = 0
        for (let i in this.dict) {
            if (helpError>3) {
                console.log("多次助力没有返回数据,可能黑ip,停止助力...")
                break
            }
            console.log("正在助力:", i)
            if (p.finish) {
                console.log("没有助力次数了")
                break
            }
            if (i == p.user) {
                console.log("不能助力自己")
            }
            else if (this.dict[i].finish) {
                console.log("助力已满,", i)
            }
            else {
                let help = await this.wget({
                    fn: 'farm_assist',
                    body: {
                        "version": 3,
                        "inviteCode": this.dict[i].inviteCode,
                        "shareChannel": "ttt7",
                        "assistChannel": ""
                    },
                    algo: {'appId': '28981'},
                    cookie
                })
                if (this.haskey(help, 'data.success')) {
                    console.log("助力成功")
                    let amount = help.data.result.amount
                    if (amount == 0) {
                        p.finish = 1
                    }
                }
                else {
                    console.log("助力失败:", this.haskey(help, 'data.bizMsg'))
                    if (this.haskey(help, 'data.bizCode', 5004)) {
                        p.finish = 1
                    }
                    else if (this.haskey(help, 'data.bizCode', -1001)) {
                        p.finish = 1
                    }
                    else if (this.haskey(help, 'data.bizCode', 5005)) {
                        this.dict[i].finish = 1
                    }
                    if (!help) {
                        helpError++
                    }
                }
                await this.wait(4000)
            }
        }
        let helpInfo = await this.wget({
            fn: 'farm_assist_init_info',
            body: {"version": 3},
            algo: {},
            cookie
        })
        for (let i of this.haskey(helpInfo, 'data.result.assistStageList')) {
            if (i.stageStaus == 2) {
                let award = await this.wget({
                    fn: 'farm_assist_receive_award',
                    body: {"version": 3},
                    algo: {'appId': 'c4332'},
                    cookie
                })
                if (this.haskey(award, 'data.success')) {
                    console.log("获取助力奖励成功:", award.data.result.amount)
                    bottleWater += award.data.result.amount
                }
                else {
                    console.log("获取助力奖励失败")
                }
                await this.wait(4000)
            }
        }
        await this.algo.set({referer: 'https://lotterydraw-new.jd.com/?id=VssYBUKJOen7HZXpC8dRFA'})
        let error = 0
        let luTask = await this.wget({
            fn: 'apTaskList',
            appid: "activities_platform",
            body: {"linkId": "VssYBUKJOen7HZXpC8dRFA"},
            algo: {},
            cookie
        })
        for (let i of this.haskey(luTask, 'data')) {
            if (i.taskDoTimes == i.taskLimitTimes) {
                console.log("任务已完成:", i.taskShowTitle)
            }
            else {
                console.log("正在运行:", i.taskShowTitle)
                let luDo = await this.wget({
                    fn: 'apsDoTask',
                    appid: "activities_platform",
                    body: {
                        "taskType": i.taskType,
                        "taskId": i.id,
                        "channel": 4,
                        "checkVersion": true,
                        "cityId": "1234",
                        "provinceId": "12",
                        "countyId": "1314",
                        "linkId": "VssYBUKJOen7HZXpC8dRFA",
                        "itemId": encodeURIComponent(i.taskSourceUrl)
                    },
                    algo: {'appId': '54ed7'},
                    cookie
                })
                if (this.haskey(luDo, 'success')) {
                    if (error<3) {
                        console.log("任务完成,正在抽奖...")
                        let wheelsLottery = await this.wget({
                            fn: 'wheelsLottery',
                            appid: "activities_platform",
                            body: {"linkId": "VssYBUKJOen7HZXpC8dRFA"},
                            algo: {'appId': 'bd6c8'},
                            cookie
                        })
                        if (this.haskey(wheelsLottery, 'data.prizeCode')) {
                            console.log("抽奖获得:", wheelsLottery.data.prizeCode)
                        }
                        else {
                            if (this.haskey(wheelsLottery, 'code', 4000)) {
                                console.log('没有抽奖次数')
                            }
                            if (!wheelsLottery) {
                                console.log('可能黑ip了,啥都没有抽到')
                            }
                            else {
                                console.log('啥都没有抽到')
                            }
                        }
                        await this.wait(6000)
                    }
                    else {
                        bd6c8
                        console.log("任务完成...")
                    }
                }
                else {
                    console.log("任务失败", luDo)
                }
                await this.wait(3000)
            }
        }
        await this.algo.set({version: '4.7'})
        let wheelsHome = await this.wget({
            url: `http://api.m.jd.com/client.action`,
            fn: 'wheelsHome',
            appid: "activities_platform",
            body: {"linkId": "VssYBUKJOen7HZXpC8dRFA", "inviteActId": "", "inviterEncryptPin": ""},
            algo: {'appId': 'c06b7',},
            cookie
        })
        let lotteryChances = this.haskey(wheelsHome, 'data.lotteryChances') || 0;
        if (!wheelsHome) {
            console.log("没有获取到wheelsHome数据")
        }
        console.log("当前可以抽奖次数:", lotteryChances)
        for (let i of Array(lotteryChances)) {
            let wheelsLottery = await this.wget({
                fn: 'wheelsLottery',
                appid: "activities_platform",
                body: {"linkId": "VssYBUKJOen7HZXpC8dRFA"},
                algo: {'appId': 'bd6c8'},
                cookie
            })
            if (this.haskey(wheelsLottery, 'data.prizeCode')) {
                console.log("抽奖获得:", wheelsLottery.data.prizeCode)
                error = 0
            }
            else {
                if (this.haskey(wheelsLottery, 'code', 4000)) {
                    console.log('没有抽奖次数')
                    break
                }
                if (!wheelsLottery) {
                    error++
                    console.log('可能黑ip了,啥都没有抽到')
                }
                else {
                    console.log('啥都没有抽到')
                }
            }
            if (error>2) {
                break
            }
            await this.wait(6000)
        }
        await this.algo.set({referer: 'https://h5.m.jd.com/pb/015686010/Bc9WX7MpCW7nW9QjZ5N3fFeJXMH/index.html'})
        let signIn = await this.wget({
            fn: 'dongDongFarmSignIn', appid: "activities_platform",
            body: {"linkId": "LCH-fV7hSnChB-6i5f4ayw"},
            algo: {'appId': '65f9d'},
            cookie
        })
        if (this.haskey(signIn, 'success')) {
            console.log('签到成功')
        }
        else {
            console.log(this.haskey(signIn, 'errMsg') || '签到失败')
        }
        await this.algo.set({version: '4.2'})
        let taskList = await this.wget({
            fn: 'farm_task_list',
            body: {"version": 3, "channel": 0},
            algo: {},
            cookie
        })
        let waterConut = 0
        for (let i of this.haskey(taskList, 'data.result.taskList')) {
            if (i.mainTitle.includes("浇水10次")) {
            }
            else if (i.mainTitle.includes("下单")) {
            }
            else if (i.taskDoTimes != i.taskLimitTimes) {
                console.log("正在运行:", i.mainTitle)
                let itemId = i.taskSourceUrl
                let taskDetaiList = []
                if (itemId) {
                    taskDetaiList.push({'itemId': itemId})
                }
                else {
                    let detail = await this.wget({
                        fn: 'farm_task_detail',
                        body: {"version": 3, "taskType": i.taskType, "taskId": i.taskId, "channel": 0},
                        algo: {},
                        cookie
                    })
                    if (this.haskey(detail, 'data.result.taskDetaiList')) {
                        taskDetaiList = detail.data.result.taskDetaiList
                    }
                }
                for (let kk of taskDetaiList.reverse()) {
                    await this.wait(4000)
                    let doWork = await this.wget({
                        fn: 'farm_do_task',
                        body: {
                            "version": 3,
                            "taskType": i.taskType,
                            "taskId": i.taskId,
                            "taskInsert": kk.taskInsert || false,
                            "itemId": new Buffer.from(kk.itemId).toString('base64'),
                            "channel": 0
                        },
                        algo: {'appId': '28981'},
                        cookie
                    })
                    if (this.haskey(doWork, 'data.success')) {
                        let award = await this.wget({
                            fn: 'farm_task_receive_award',
                            body: {"version": 3, "taskType": i.taskType, "taskId": i.taskId, "channel": 0},
                            algo: {'appId': '33e0f'},
                            cookie
                        })
                        if (this.haskey(award, 'data.result.taskAward')) {
                            console.log("获得奖励:", award.data.result.taskAward)
                            for (let kk of award.data.result.taskAward) {
                                if (this.haskey(kk, 'awardType', 1)) {
                                    bottleWater += kk.awardValue
                                }
                            }
                            if (bottleWater>stock) {
                                let water = await this.wget({
                                    fn: 'farm_water',
                                    body: {"version": 3, "waterType": 1, "babelChannel": "ttt7", "lbsSwitch": false},
                                    algo: {'appId': '28981'},
                                    cookie
                                })
                                let bottleWater2 = this.haskey(water, 'data.result.bottleWater')
                                if (bottleWater2) {
                                    bottleWater = bottleWater2
                                    console.log("浇水中,剩余水滴:", bottleWater)
                                }
                                else {
                                    console.log('浇水失败:', this.haskey(water, 'data.bizMsg'))
                                }
                                await this.wait(3000)
                            }
                        }
                        else {
                            console.log("获取失败:", this.haskey(award, 'data.bizMsg'))
                        }
                    }
                    else {
                        console.log("任务失败:", this.haskey(doWork, 'data.bizMsg'))
                    }
                }
            }
            else if (i.taskStatus == 2) {
                await this.wait(4000)
                console.log("获取任务奖励:", i.mainTitle)
                let award = await this.wget({
                    fn: 'farm_task_receive_award',
                    body: {"version": 3, "taskType": i.taskType, "taskId": i.taskId, "channel": 0},
                    algo: {'appId': '33e0f'},
                    cookie
                })
                if (this.haskey(award, 'data.result.taskAward')) {
                    console.log("获得奖励:", award.data.result.taskAward)
                    for (let kk of award.data.result.taskAward) {
                        if (this.haskey(kk, 'awardType', 1)) {
                            bottleWater += kk.awardValue
                        }
                    }
                    if (bottleWater>stock) {
                        let water = await this.wget({
                            fn: 'farm_water',
                            body: {"version": 3, "waterType": 1, "babelChannel": "ttt7", "lbsSwitch": false},
                            algo: {'appId': '28981'},
                            cookie
                        })
                        let bottleWater2 = this.haskey(water, 'data.result.bottleWater')
                        if (bottleWater2) {
                            bottleWater = bottleWater2
                            console.log("浇水中,剩余水滴:", bottleWater)
                        }
                        else {
                            console.log('浇水失败:', this.haskey(water, 'data.bizMsg'))
                        }
                        await this.wait(3000)
                    }
                }
                else {
                    console.log("获取失败:", this.haskey(award, 'data.bizMsg'))
                }
            }
            else {
                console.log("任务已完成:", i.mainTitle)
            }
        }
        // 等运行完其他任务再浇水10次,获取的水滴数才是正确的
        for (let i of this.haskey(taskList, 'data.result.taskList')) {
            if (i.mainTitle.includes("浇水10次")) {
                if (i.taskDoTimes != i.taskLimitTimes) {
                    console.log("正在运行:", i.mainTitle)
                    for (let _ of Array(i.taskLimitTimes - i.taskDoTimes)) {
                        let water = await this.wget({
                            fn: 'farm_water',
                            body: {"version": 3, "waterType": 1, "babelChannel": "ttt7", "lbsSwitch": false},
                            algo: {'appId': '28981'},
                            cookie
                        })
                        let bottleWater2 = this.haskey(water, 'data.result.bottleWater')
                        if (bottleWater2) {
                            bottleWater = bottleWater2
                            console.log("浇水中,剩余水滴:", bottleWater)
                            waterConut++
                            if (bottleWater<10) {
                                break
                            }
                        }
                        else {
                            console.log('浇水失败:', this.haskey(water, 'data.bizMsg'))
                            break
                        }
                        await this.wait(4000)
                    }
                    let award = await this.wget({
                        fn: 'farm_task_receive_award',
                        body: {"version": 3, "taskType": i.taskType, "taskId": i.taskId, "channel": 0},
                        algo: {'appId': '33e0f'},
                        cookie
                    })
                    if (this.haskey(award, 'data.result.taskAward')) {
                        console.log("获得奖励:", award.data.result.taskAward)
                        for (let kk of award.data.result.taskAward) {
                            if (this.haskey(kk, 'awardType', 1)) {
                                bottleWater += kk.awardValue
                            }
                        }
                        if (bottleWater>stock) {
                            let water = await this.wget({
                                fn: 'farm_water',
                                body: {"version": 3, "waterType": 1, "babelChannel": "ttt7", "lbsSwitch": false},
                                algo: {'appId': '28981'},
                                cookie
                            })
                            let bottleWater2 = this.haskey(water, 'data.result.bottleWater')
                            if (bottleWater2) {
                                bottleWater = bottleWater2
                                console.log("浇水中,剩余水滴:", bottleWater)
                            }
                            else {
                                console.log('浇水失败:', this.haskey(water, 'data.bizMsg'))
                            }
                            await this.wait(3000)
                        }
                    }
                    else {
                        console.log("获取失败:", this.haskey(award, 'data.bizMsg'))
                    }
                }
            }
        }
        if (this.profile.tenWater) {
            console.log("跳过浇水: 检测到配置了tenWater参数,跳过浇水")
        }
        else {
            if (stock && stock>=bottleWater) {
                console.log("跳过浇水: 检测到配置了stock参数,剩余水滴小于保留水滴数")
            }
            else {
                console.log("剩余水滴:", bottleWater, '保留水滴数:', stock)
                let count = parseInt((bottleWater - stock) / 10)
                console.log("剩余可浇水次数:", count)
                let waterError = 0
                for (let _ of Array(count)) {
                    let water = await this.wget({
                        fn: 'farm_water',
                        body: {"version": 3, "waterType": 1, "babelChannel": "ttt7", "lbsSwitch": false},
                        algo: {'appId': '28981'},
                        cookie
                    })
                    if (this.haskey(water, 'data.result.bottleWater')) {
                        bottleWater = this.haskey(water, 'data.result.bottleWater')
                        console.log("浇水中,剩余水滴:", bottleWater)
                        waterError = waterError - 2
                        if (waterError<0) {
                            waterError = 0
                        }
                    }
                    else {
                        console.log('浇水失败:', this.haskey(water, 'data.bizMsg'))
                        if (this.profile.tree && this.haskey(water, 'data.bizCode', 3)) {
                            try {
                                let board = await this.wget({
                                    fn: 'farm_tree_board',
                                    body: {"version": 3},
                                    algo: {},
                                    cookie
                                })
                                let skus = board.data.result.farmTreeLevels[0].farmLevelTrees[0]
                                console.log("正在种树,选择商品:", skus.skuName)
                                let tree = await this.wget({
                                    fn: 'farm_plant_tree',
                                    body: {"version": 3, "uid": skus.uid},
                                    algo: {},
                                    cookie
                                })
                                console.log(tree)
                                if (this.haskey(tree, 'data.success')) {
                                    farmHome = await this.wget({
                                        'fn': 'farm_home',
                                        'body': {"version": 3},
                                        algo: {appId: 'c57f6'},
                                        cookie,
                                    })
                                    home = this.haskey(farmHome, 'data.result') || {}
                                }
                                else {
                                    console.log("种树失败")
                                    return
                                }
                            } catch (e) {
                                console.log("种树失败")
                                return
                            }
                        }
                        waterError++
                        if (waterError>3) {
                            break
                        }
                    }
                    await this.wait(4000)
                }
            }
        }
    }

    async wget(p) {
        let headers = p.headers
        let url = p.url || `https://api.m.jd.com/client.action`
        return await this.algo.curl({
                url,
                'form': `appid=${p.appid || "signed_wh5"}&client=apple&clientVersion=12.3.1&screen=375*0&wqDefault=false&t=1698502026732&body=${typeof (p.body) == 'object' ? this.dumps(p.body) : p.body}&functionId=${p.fn}`,
                cookie: p.cookie,
                algo: p.algo || {},
                headers: {
                    referer: p.referer || 'https://h5.m.jd.com/',
                    'x-referer-page': 'https://h5.m.jd.com/pb/015686010/Bc9WX7MpCW7nW9QjZ5N3fFeJXMH/index.html'
                }
            }
        )
    }

    async extra() {
        console.log(`此次运行助力码:`)
        console.log(this.dumps((this.dict)))
        if (!this.profile.cache || !this._cc) {
            let dict = {}
            for (let cookie of this.cookies.help) {
                let user = this.userName(cookie)
                if (this.dict[user]) {
                    delete this.dict[user].finish
                    dict[user] = this.dict[user]
                }
            }
            for (let pin in this.dict) {
                if (!dict[pin]) {
                    delete this.dict[pin].finish
                    dict[pin] = this.dict[pin]
                }
            }
            await this.modules.fs.writeFile(`${this.dirname}/invite/jd_task_farmNew.json`, this.dumps(dict), (error) => {
                if (error) return console.log("写入化失败" + error.message);
                console.log("新东东农场助力列表写入成功");
            })
        }
        else {
            console.log("跳过写入: 检测到配置了cache参数,已有缓存:/invite/jd_task_farmNew.json")
        }
    }
}

module.exports = Main;
