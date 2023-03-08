const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东音乐会"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.import = ['jdAlgo']
        this.delay = 500
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo()
    }

    async main(p) {
        let cookie = p.cookie;
        let gifts = []
        for (let i of Array(50)) {
            let s = await this.curl({
                    'url': `https://api.m.jd.com/?functionId=wheelsLottery&body={"linkId":"7m_tf2OArtOndOSDV7IWeQ"}&t=1678281038150&appid=activities_platform&client=ios&clientVersion=11.6.3&build=168563&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidId7f9812189s4Ywiz164KTQqoeSyoW1uZwmMItV216n8pCJ26eJPEqZb5n8VkyLjW71hRQ6fhLku8USG3jg%2BHtZ7ecv%2BJ2CWEYpUd99P1GvH7bppT`,
                    // 'form':``,
                    cookie,
                    algo: {
                        type: "app",
                        version: '3.1',
                        appId: 'bd6c8'
                    }
                }
            )
            if (this.haskey(s, 'errMsg', '没有抽奖次数')) {
                console.log('没有抽奖次数')
                break
            }
            if (this.haskey(s, 'errMsg', '未登录')) {
                console.log('未登录')
                break
            }
            console.log(this.haskey(s, 'data.rewardValue') || this.haskey(s, 'data'))
            if (this.haskey(s, 'data.rewardValue')) {
                gifts.push(s.data.rewardValue)
            }
        }
        if (gifts.length>0) {
            this.print(`获得: ${this.sum(gifts, 2)}`, p.user)
        }
    }
}

module.exports = Main;
