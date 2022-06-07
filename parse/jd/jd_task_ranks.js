const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东宝藏榜"
        this.cron = "29 7 * * *"
        this.task = 'local'
        this.import = ['jdUrl']
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie;
        let t = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=getTreasureRanks&body={"queryType":"1","rankType":18,"ids":["1"]}&joycious=116&rfs=0000&appid=newrank_action`,
                cookie
            }
        )
        this.assert(this.haskey(t, 'result.data'), '没有获取到数据')
        for (let i of t.result.data.slice(0, 7)) {
            console.log(`正在浏览:`, i.storeName)
            let a = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=doTreasureInteractive&body={"type":"2","itemId":"${i.storeId}"}&appid=newrank_action&clientVersion=11.0.4&client=wh5&d_model=iPhone13%2C3&build=168106&ext=%7B%22prstate%22%3A%220%22%7D&joycious=116&rfs=0000`,
                    cookie
                }
            )
            await this.wait(3000)
            let c = await this.curl(this.modules.jdUrl.app('qryViewkitCallbackResult', {
                    "dataSource": "babelInteractive",
                    "method": "customDoInteractiveAssignmentForBabel",
                    "reqParams": this.dumps(a.result.taskParam)
                }, 'post', cookie)
            )
            let b = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=doTreasureInteractive&body={"type":"1","itemId":""}&appid=newrank_action&clientVersion=11.0.4&client=wh5&d_model=iPhone13%2C3&build=168106&ext=%7B%22prstate%22%3A%220%22%7D&joycious=116&rfs=0000`,
                    cookie
                }
            )
            // console.log(b.result)
            if (this.haskey(b, 'result.browseTaskMaxCnt') == this.haskey(b, 'result.browseTaskCompletionCnt')) {
                console.log(`浏览已经完成...`)
                break
            }
        }
        console.log(`正在抽奖...`)
        let r = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=doTreasureInteractive&body={"type":"3","itemId":""}&appid=newrank_action&clientVersion=11.0.4&client=wh5&d_model=iPhone13%2C3&build=168106&ext=%7B%22prstate%22%3A%220%22%7D&joycious=116&rfs=0000`,
                cookie
            }
        )
        console.log(r)
        if (this.haskey(r, 'result.discount')) {
            this.print(`${r.result.rewardTitle}: ${r.result.discount}`, p.user)
        }
        else {
            console.log('什么也没有')
        }
    }
}

module.exports = Main;
