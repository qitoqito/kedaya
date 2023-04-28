const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东天天领红包"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.import = ['jdAlgo']
        this.delay = 500
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: "3.1",
            type: "main"
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let list = await this.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=apTaskList&body={"linkId":"l-yLvQMhLwCqYy6_nXUBgg"}&t=1682682140687&appid=activities_platform&client=ios&clientVersion=11.8.0&cthr=1&uuid=0721076da75ec3ea8e5f481e6d68bb4b7420c38d&build=168646&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidId7f9812189s4Ywiz164KTQqoeSyoW1uZwmMItV216n8pCJ26eJPEqZb5n8VkyLjW71hRQ6fhLku8USG3jg%2BHtZ7ecv%2BJ2CWEYpUd99P1GvH7bppT`,
                cookie
            }
        )
        for (let i of this.haskey(list, 'data')) {
            if (i.taskLimitTimes == i.taskDoTimes) {
                console.log("任务已完成:", i.taskTitle)
            }
            else {
                let doTask = await this.algo.curl({
                        'url': `https://api.m.jd.com/`,
                        'form': `functionId=apsDoTask&body={"linkId":"l-yLvQMhLwCqYy6_nXUBgg","taskType":"${i.taskType}","taskId":${i.id},"channel":4,"checkVersion":true,"cityId":"","provinceId":"","countyId":"","itemId":"${encodeURIComponent(i.taskSourceUrl)}"}&t=1682682139176&appid=activities_platform&client=ios&clientVersion=11.8.0&cthr=1&uuid=0721076da75ec3ea8e5f481e6d68bb4b7420c38d&build=168646&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidId7f9812189s4Ywiz164KTQqoeSyoW1uZwmMItV216n8pCJ26eJPEqZb5n8VkyLjW71hRQ6fhLku8USG3jg%2BHtZ7ecv%2BJ2CWEYpUd99P1GvH7bppT`,
                        cookie,
                        algo: {
                            appId: "54ed7",
                        }
                    }
                )
                console.log("正在运行:", i.taskTitle, this.haskey(doTask, 'success'))
            }
        }
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=lhb4b_home&body={"linkId":"l-yLvQMhLwCqYy6_nXUBgg","inviter":""}&t=1682681546825&appid=activities_platform&client=ios&clientVersion=11.8.4&cthr=1&uuid=102e084dd630eb7a4cb6e8651ed23deac1a2e067&build=168667&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=13.7&partner=&eid=eidId5508121e3s7GcdDwrCSSOe%2FGLUsbjKY3hnHRUmWgBYNr6CNLIg40msRpxIBuiZ5VFk052xiCOSHOJwtB58n6OBzhJWXl6CPdj4J7hjJxn6UuHNp`,
                cookie,
                algo: {
                    appId: "d5a39",
                }
            }
        )
        let count = this.haskey(home, 'data.remainChance')
        console.log("当前可抽奖次数:", count)
        for (let i of Array(count)) {
            let draw = await this.algo.curl({
                    'url': `https://api.m.jd.com/`,
                    form: `functionId=lhb4b_open&body={"linkId":"l-yLvQMhLwCqYy6_nXUBgg","openMode":0}&t=1682682041844&appid=activities_platform&client=ios&clientVersion=11.8.0&cthr=1&uuid=0721076da75ec3ea8e5f481e6d68bb4b7420c38d&build=168646&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidId7f9812189s4Ywiz164KTQqoeSyoW1uZwmMItV216n8pCJ26eJPEqZb5n8VkyLjW71hRQ6fhLku8USG3jg%2BHtZ7ecv%2BJ2CWEYpUd99P1GvH7bppT`,
                    // 'form':``,
                    cookie,
                    algo: {
                        appId: '7af4f'
                    }
                }
            )
            let prizeType = this.haskey(draw, 'data.received.prizeType')
            console.log("抽中类型:", prizeType, '抽中面额:', this.haskey(draw, 'data.received.prizeValue'))
            await this.wait(2000)
        }
    }
}

module.exports = Main;
