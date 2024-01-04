const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东视频红包"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 21)} * * *`
        this.import = ['jdAlgo', 'jdUrl']
        this.interval = 3000
        this.readme = '只有白号能跑,黑号会火爆或者提款不了'
        this.turn = 2
        this.clientVersion = '12.3.1'
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: '4.2',
            type: 'main',
            appId: '7f9c4',
        })
        let html = await this.curl({
                'url': `https://pro.m.jd.com/mall/active/8WYa8CGWvkB5b3EC9TcyAbAobeo/index.html?tttparams=i2c4MeyJnTGF0IjoiMjMuOTM5MTkyIiwidW5fYXJlYSI6IjE2XzEzNDFfMTM0N180NDc1MCIsImRMYXQiOiIiLCJwcnN0YXRlIjoiMCIsImFkZHJlc3NJZCI6Ijc2NTc3NTQ4ODIiLCJsYXQiOiIiLCJwb3NMYXQiOiIyMy45MzkxOTIiLCJwb3NMbmciOiIxMTcuNjExMjMiLCJncHNfYXJlYSI6IjBfMF8wXzAiLCJsbmciOiIiLCJ1ZW1wcyI6IjAtMC0yIiwiZ0xuZyI6IjExNy42MTEyMyIsIm1vZGVsIjoiaVBob25lMTMsMyIsImRMbmciOiIifQ5%3D%3D`,
            }
        )
        let code = (this.matchAll(/"scanTaskCode(?:_\d+)*"\s*:\s*"(\w+)"/g, html))
        if (code) {
            for (let i of this.unique(code)) {
                this.code.push({"type": "20", "assignmentId": i})
            }
        }
        else {
            this.code = [{"type": "20", "assignmentId": "3pqBgSLxZYRuXYqHB3Mqt491gdW7"}, {
                "type": "20",
                "assignmentId": "42Nh2x5EzX6pdbtDhuSjCn5vbsvG"
            }, {"type": "20", "assignmentId": "3QNFKrBjMdhLAo3cLM9Ybn9A2pMK"}, {
                "type": "20",
                "assignmentId": "3vdcpRcRQYwA9gtaQwXCwz8ajLm"
            }, {"type": "20", "assignmentId": "2352pNzjbjkZmx42QWVeMQBsmVPf"}, {
                "type": "20",
                "assignmentId": "2sRpWMCxxwVPT1i5Z52iBiKe1ec9"
            }]
        }
    }

    async main(p) {
        let cookie = p.cookie;
        // console.log(home)
        let info = await this.algo.curl({
                'url': `https://api.m.jd.com/videoRedPacketHomePage_info`,
                'form': `functionId=videoRedPacketHomePage_info&appid=video-redbag-h5&body=${this.dumps(this.code)}&client=wh5&t=1699156906324&clientVersion=12.3.1`,
                cookie,
                algo: {appId: 'd51cc'}
            }
        )
        if (this.haskey(info, 'busiCode', '3')) {
            console.log('用户未登录')
            return
        }
        else if (this.haskey(info, 'busiCode', '8015')) {
            console.log('活动太火爆')
            return
        }
        if (this.turnCount == 0) {
            let sign = await this.algo.curl({
                    'url': `https://api.m.jd.com/videoHb_sign`,
                    'form': `functionId=videoHb_sign&appid=video-redbag-h5&body={}&client=wh5&t=1704344655057&clientVersion=12.3.1`,
                    cookie,
                    algo: {appId: '2023f'}
                }
            )
            this.dict[p.user] = [];
            for (let i of this.haskey(info, 'data')) {
                if (i.status == 2) {
                    console.log("已完成:", i.assignmentName)
                }
                else {
                    console.log("正在运行:", i.assignmentName)
                    if (!i.login) {
                        return
                    }
                    let accept = await this.algo.curl({
                            'url': `https://api.m.jd.com/videoRedPacketHomePage_accept`,
                            'form': `functionId=videoRedPacketHomePage_accept&appid=video-redbag-h5&body={"type":"20","assignmentId":"${i.assignmentId}","itemId":"${i.itemId}"}&client=wh5&t=1699157368652&clientVersion=12.3.1`,
                            cookie,
                            algo: {appId: '57a9c'}
                        }
                    )
                    if (this.haskey(accept, 'success')) {
                        if (i.waitDuration) {
                            console.log("预等待:", i.waitDuration)
                            // await this.wait(parseInt(i.waitDuration) * 1000)
                        }
                        this.dict[p.user].push({
                            "assignmentId": i.assignmentId, "itemId": i.itemId,
                            'time': new Date().getTime() / 1000 + parseInt(i.waitDuration),
                            'title': i.assignmentName
                        })
                        await this.wait(1000)
                    }
                    else {
                        if (this.haskey(accept, 'busiCode', '8014')) {
                            console.log('活动太火爆，等会再来吧~')
                            return
                        }
                        console.log(accept)
                    }
                }
            }
        }
        else {
            for (let i of this.dict[p.user]) {
                let wait = i.time - new Date().getTime() / 1000
                console.log("正在获取:", i.title)
                if (wait>0) {
                    console.log("正在等待:", wait)
                    await this.wait(wait * 1000)
                }
                let done = await this.algo.curl({
                        'url': `https://api.m.jd.com/videoRedPacketHomePage_done`,
                        'form': `functionId=videoRedPacketHomePage_done&appid=video-redbag-h5&body={"type":"20","assignmentId":"${i.assignmentId}","itemId":"${i.itemId}"}&client=wh5&t=1699157368652&clientVersion=12.3.1`,
                        cookie,
                        algo: {appId: '12bf2'}
                    }
                )
                if (this.haskey(done, 'success')) {
                    console.log(done.data.rewardMsg)
                }
                else {
                    console.log(done)
                }
                await this.wait(1000)
            }
        }
        // for (let i of Array(2)) {
        //     let coin = await this.curl(this.modules.jdUrl.app('videoHbGoldCoin_done', {
        //             "contentId": "414303219",
        //             "jsLabel": "\/DM3FV\/PEde9BKNudk4NEQ7LYwslHVatolqZKq0h\/nbpuOtrMZKpsSx6AY1fvblB0Dp+W9WGxfkrD\/y8BAJ3iO5UO\/CKNmGetDYZHD+x2E7ElUM0I3rMHO2XhEv5A+ihHfZ9zCMVtC2h+SmLy042QK2NPMlS2busoZYVVI1go5I=",
        //             "playType": "126"
        //         }, 'post', cookie)
        //     )
        //     if (this.haskey(coin, 'success')) {
        //         console.log('获得金币:', coin.data.rewardValue)
        //     }
        //     else {
        //         console.log(coin)
        //     }
        //     await this.wait(5000)
        // }
        let exchange = await this.curl({
                'url': `https://api.m.jd.com/videoRedPacketHomePage_exchangeCash`,
                'form': `functionId=videoRedPacketHomePage_exchangeCash&appid=video-redbag-h5&body={}&client=wh5&t=1699157963924&clientVersion=12.3.1`,
                cookie,
                algo: {appId: "8c80c"}
            }
        )
        if (this.haskey(exchange, 'success')) {
            console.log('金币兑换成功')
        }
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/videoHbCw_homePage`,
                'form': `functionId=videoHbCw_homePage&appid=video-redbag-h5&body=%7B%7D&client=wh5&t=1699156595761&clientVersion=12.3.1`,
                cookie,
                algo: {appId: '7f9c4'}
            }
        )
        if (this.haskey(home, 'success')) {
            let data = this.haskey(home, 'data')
            let amount = data.cashBalanceFloor.amount
            console.log('现有奖金:', amount)

            for (let i of data.cwCardFloor.cards.reverse()) {
                if (i.topDesc == '已连续来访0天' && i.amount == 0.88) {
                    let init = await this.curl(this.modules.jdUrl.app('videoHb_newCustomerHbLayer', {}, 'post', cookie)
                    )
                    console.log(init)
                    if (this.haskey(init, 'data.popAlertInfo.hbAmount')) {
                        console.log("初始化成功,获得:", init.data.popAlertInfo.hbAmount)
                    }
                }
                if (i.cwStatus == 0 ) {
                    console.log("正在提款至京东余额:", i.amountStr)
                    let cash = await this.algo.curl({
                            'url': `https://api.m.jd.com/videoHbCw_doCw`,
                            'form': `functionId=videoHbCw_doCw&appid=video-redbag-h5&body={"bizTraceId":"${i.bizTraceId}","amount":${i.amountStr}}&client=wh5&t=1699156604242&clientVersion=12.3.1`,
                            cookie,
                            algo: {appId: 'c5b74'}
                        }
                    )
                    if (this.haskey(cash, 'success')) {
                        this.print(`提款成功: ${i.amountStr}`, p.user)
                    }
                    else {
                        console.log(cash)
                    }
                    await this.wait(5000)
                }
            }
        }
        else {
            console.log(home)
        }
    }
}

module.exports = Main;
