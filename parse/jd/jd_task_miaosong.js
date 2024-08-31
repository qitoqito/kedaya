const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东秒送"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 21)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.interval = 2000
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: '4.7',
            referer: 'https://jgc.jd.com/game/zone/pages/gameZone/index?jumpFrom=1&source=1'
        })
        this.taskCode = 'TKEK13580273966'
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=dj_interact_games_lobby&appid=game-fun-zone`,
                'form': `body={"refreshType":1,"source":"1"}&clientVersion=13.2.6&client=iOS&d_model=iPhone8%2C1&d_brand=iPhone&osVersion=15.7.5&build=169490&uuid=713528612071b94e23fcd28144db476f856f9fc5&appId=game-fun-zone`,
                cookie: this.cookies.local[0]
            }
        )
        if (this.haskey(s, 'task.signList.0.taskEncryptionCode')) {
            let dec = this.jsonParse(this.b64decode(this.haskey(s, 'task.signList.0.taskEncryptionCode')))
            this.taskCode = dec.taskCode
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let reward = await this.algo.curl({
                'url': `https://api.m.jd.com/client.action?functionId=dj_interact_grab_reward&appid=game-fun-zone`,
                'form': `body={"taskEncryptionCode":"${this.b64encode(this.dumps({
                    "date": new Date().getTime(),
                    "taskCode": this.taskCode
                }))}"}&clientVersion=13.2.6&client=iOS&d_model=iPhone8%2C1&d_brand=iPhone&osVersion=15.7.5&build=169490&appId=game-fun-zone&functionId=dj_interact_grab_reward&method=POST&signBusinessId=4dea1&t=1725111845727&appid=game-fun-zone`,
                cookie,
                algo: {
                    appId: '4dea1'
                }
            }
        )
        console.log(this.haskey(reward, 'result.message') || '失败了')
        let lobby = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=dj_interact_games_lobby&appid=game-fun-zone`,
                'form': `body=%7B%22refreshType%22%3A2%2C%22source%22%3A%221%22%7D&clientVersion=13.2.6&client=iOS&d_model=iPhone8%2C1&d_brand=iPhone&osVersion=15.7.5&build=169490&uuid=713528612071b94e23fcd28144db476f856f9fc5&appId=game-fun-zone`,
                cookie
            }
        )
        let text = []
        for (let i of this.haskey(lobby, 'userAsset') || []) {
            if (i.assetType == 1) {
                text.push(`京豆: ${i.dailyEarns}`)
            }
            else {
                text.push(`秒送金: ${i.dailyEarns}`)
            }
        }
        if (text.length>0) {
            this.print(text.join(" "), p.user)
        }
    }
}

module.exports = Main;
