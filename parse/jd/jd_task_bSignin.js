const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东签到领钱"
        this.cron = "6 6,18 * * *"
        this.task = 'local'
        this.import = ['jdAlgo', 'jdUrl']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            'appId': '61e2b',
            version: '3.1',
            type: 'main'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        console.log("执行签到...")
        let sn = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=bSignInDo&body={"linkId":"FIz2zkvbepstVFm3uqLOUA"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=11.6.6&cthr=1&build=168631&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=13.7&partner=&eid=eidId5508121e3s7GcdDwrCSSOe%2FGLUsbjKY3hnHRUmWgBYNr6CNLIg40msRpxIBuiZ5VFk052xiCOSHOJwtB58n6OBzhJWXl6CPdj4J7hjJxn6UuHNp`,
                cookie,
                algo: {
                    'appId': '61e2b',
                    version: '3.1',
                    type: 'main'
                }
            }
        )
        if (this.haskey(sn, 'data.signInCoin')) {
            console.log('获得签到:', sn.data.signInCoin)
        }
        else {
            console.log(this.haskey(sn, 'errMsg') || sn)
        }
        let list = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=apTaskList&body={"linkId":"FIz2zkvbepstVFm3uqLOUA"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=11.6.3&build=168528&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=13.7&partner=&eid=eidIb24b812115s9jUHzkyfNSICH4T313nxTSY1B9QqDr0IUV8vdzISUvNGSXxO%2BeCNY01V69ImKsiy4ptOddRzE0E%2F950ionHyQBWNiEguhXNM%2B%2BD5v`,
                cookie
            }
        )
        for (let i of this.haskey(list, 'data')) {
            if (i.taskDoTimes != i.taskLimitTimes) {
                let ok = 0
                for (let j = 0; j<i.taskLimitTimes - i.taskDoTimes; j++) {
                    if (ok) {
                        break
                    }
                    console.log(`正在做:`, i.taskTitle)
                    switch (i.taskType) {
                        case 'ORDER_MARK':
                            break
                        case 'SHARE_INVITE':
                            break
                        case 'SIGN':
                            break
                        case 'BROWSE_CHANNEL':
                        case 'BROWSE_PRODUCT':
                            let detail = await this.algo.curl({
                                    'url': `https://api.m.jd.com/`,
                                    'form': `functionId=apTaskDetail&body={"taskType":"${i.taskType}","taskId":${i.id},"channel":4,"checkVersion":true,"cityId":"","provinceId":"","countyId":"","linkId":"FIz2zkvbepstVFm3uqLOUA"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=11.6.3&cthr=1&build=168563&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidId7f9812189s4Ywiz164KTQqoeSyoW1uZwmMItV216n8pCJ26eJPEqZb5n8VkyLjW71hRQ6fhLku8USG3jg%2BHtZ7ecv%2BJ2CWEYpUd99P1GvH7bppT`,
                                    cookie
                                }
                            )
                            if (this.haskey(detail, 'data.taskItemList')) {
                                let itemId = (detail.data.taskItemList[j] || detail.data.taskItemList[0]).itemId
                                let s = await this.algo.curl({
                                        'url': `https://api.m.jd.com/`,
                                        form: `functionId=apsDoTask&body={"taskType":"${i.taskType}","taskId":${i.id},"channel":4,"checkVersion":true,"cityId":"","provinceId":"","countyId":"","linkId":"FIz2zkvbepstVFm3uqLOUA","taskInsert":false,"itemId":"${encodeURIComponent(itemId)}"}&t=1680593355070&appid=activities_platform&client=ios&clientVersion=11.6.3&cthr=1&build=168563&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidId7f9812189s4Ywiz164KTQqoeSyoW1uZwmMItV216n8pCJ26eJPEqZb5n8VkyLjW71hRQ6fhLku8USG3jg%2BHtZ7ecv%2BJ2CWEYpUd99P1GvH7bppT`,
                                        cookie,
                                        algo: {
                                            'appId': '54ed7',
                                            version: '3.1',
                                            type: 'main'
                                        }
                                    }
                                )
                                let d = await this.algo.curl({
                                        'url': `https://api.m.jd.com/`,
                                        'form': `functionId=apTaskDrawAward&body={"taskType":"${i.taskType}","taskId":${i.id},"channel":4,"checkVersion":true,"cityId":"","provinceId":"","countyId":"","linkId":"FIz2zkvbepstVFm3uqLOUA"}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=11.6.3&cthr=1&build=168563&screen=390*844&networkType=wifi&d_brand=iPhone&d_model=iPhone13,3&lang=zh_CN&osVersion=15.1.1&partner=&eid=eidId7f9812189s4Ywiz164KTQqoeSyoW1uZwmMItV216n8pCJ26eJPEqZb5n8VkyLjW71hRQ6fhLku8USG3jg%2BHtZ7ecv%2BJ2CWEYpUd99P1GvH7bppT`,
                                        cookie
                                    }
                                )
                                console.log('任务完成:', d.success)
                            }
                            break
                    }
                }
            }
            else {
                console.log(`任务完成`, i.taskTitle)
            }
        }
        let home = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=bSignInHome&body={"linkId":"FIz2zkvbepstVFm3uqLOUA"}&t=1680596305517&appid=activities_platform&client=ios&clientVersion=11.6.6&build=168631&screen=375*667&networkType=wifi&d_brand=iPhone&d_model=iPhone8,1&lang=zh_CN&osVersion=13.7&partner=&eid=eidId5508121e3s7GcdDwrCSSOe%2FGLUsbjKY3hnHRUmWgBYNr6CNLIg40msRpxIBuiZ5VFk052xiCOSHOJwtB58n6OBzhJWXl6CPdj4J7hjJxn6UuHNp`,
                cookie,
                algo: {
                    'appId': '76674',
                    version: '3.1',
                    type: 'main'
                }
            }
        )
        if (this.haskey(home, 'data.signInCoin')) {
            console.log('现金:', home.data.signInCoin)
        }
    }
}

module.exports = Main;
