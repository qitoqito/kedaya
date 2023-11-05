const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东1111视频红包"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 21)} 1-22 11 *`
        this.import = ['jdAlgo', 'jdUrl']
        this.interval = 3000
        this.readme = '只有白号能跑,黑号会火爆或者提款不了'
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: '4.1',
            type: 'main',
            appId: '7f9c4'
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
        let info = await this.algo.curl({
                'url': `https://api.m.jd.com/videoRedPacketHomePage_info`,
                'form': `functionId=videoRedPacketHomePage_info&appid=video-redbag-h5&body=${this.dumps(this.code)}&client=wh5&t=1699156906324&clientVersion=12.2.2`,
                cookie,
                algo: {appId: 'd51cc'}
            }
        )
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
                        'form': `functionId=videoRedPacketHomePage_accept&appid=video-redbag-h5&body={"type":"20","assignmentId":"${i.assignmentId}","itemId":"${i.itemId}"}&client=wh5&t=1699157368652&clientVersion=12.2.2`,
                        cookie,
                        algo: {appId: '57a9c'}
                    }
                )
                if (this.haskey(accept, 'success')) {
                    if (i.waitDuration) {
                        console.log("等待中:", i.waitDuration)
                        await this.wait(parseInt(i.waitDuration) * 1000)
                    }
                    let done = await this.algo.curl({
                            'url': `https://api.m.jd.com/videoRedPacketHomePage_done`,
                            'form': `functionId=videoRedPacketHomePage_done&appid=video-redbag-h5&body={"type":"20","assignmentId":"${i.assignmentId}","itemId":"${i.itemId}"}&client=wh5&t=1699157368652&clientVersion=12.2.2`,
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
        let exchange = await this.curl({
                'url': `https://api.m.jd.com/videoRedPacketHomePage_exchangeCash`,
                'form': `functionId=videoRedPacketHomePage_exchangeCash&appid=video-redbag-h5&body={}&client=wh5&t=1699157963924&clientVersion=12.2.2`,
                cookie,
                algo: {appId: "8c80c"}
            }
        )
        if (this.haskey(exchange, 'success')) {
            console.log('金币兑换成功')
        }
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/videoHbCw_homePage`,
                'form': `functionId=videoHbCw_homePage&appid=video-redbag-h5&body=%7B%7D&client=wh5&t=1699156595761&clientVersion=12.2.2`,
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
                if (i.cwStatus == 0 && amount>=i.amount) {
                    console.log("正在提款至京东余额:", i.amount)
                    let cash = await this.algo.curl({
                            'url': `https://api.m.jd.com/videoHbCw_doCw`,
                            'form': `functionId=videoHbCw_doCw&appid=video-redbag-h5&body={"bizTraceId":"${i.bizTraceId}","amount":${i.amount}}&client=wh5&t=1699156604242&clientVersion=12.2.2`,
                            cookie,
                            algo: {appId: 'c5b74'}
                        }
                    )
                    if (this.haskey(cash, 'success')) {
                        this.print(`提款成功: ${i.amount}`, p.user)
                    }
                    else {
                        console.log(cash)
                    }
                }
            }
        }
        else {
            console.log(home)
        }
    }
}

module.exports = Main;
