const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东健康器械618"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.delay = 1500
        this.import = ['jdAlgo', 'fileCache', 'jdSign', 'jdObf']
        this.hint = {
            openCard: '1,开卡'
        }
        this.readme = "无线类型,只有小部分白号可以跑"
    }

    async prepare() {
        this.sign = new this.modules.jdSign()
        this.fileExpire = this.haskey(this.fileCache, 'isvObfuscator_expire') || 1800
        this.fileSalt = this.haskey(this.fileCache, 'isvObfuscator_salt') || "abcdefg"
        this.cache = this.modules["fileCache"]
        await this.cache.connect({file: `${this.dirname}/temp/isvToken.json`})
        this.algo = new this.modules.jdAlgo({
            verison: '4.7'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let isvObfuscator = await this.isvToken(p)
        this.assert(isvObfuscator.token, "没有获取到isvToken")
        if (this.haskey(isvObfuscator, 'message', '参数异常，请退出重试')) {
            console.log(`用户过期或者异常`)
            return
        }
        let token = isvObfuscator.token
        let headers = {
            authorization: 'Bearer undefined',
            referer: 'https://xinruidddj-isv.isvjcloud.com/medical-618/',
            'user-agent': 'jdapp;iPad;12.4.3;;;M/5.0;appBuild/169370;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DtK4DJPvYtSyENu3DzLsYWDrCQDsCzUyDWVwCJvsDQGyZNUnZNY2Dq%3D%3D%22%2C%22sv%22%3A%22CJYkDq%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1718252450%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
            'App-Key': 'zg3hlp6H'
        }
        let auth = await this.curl({
                'url': `https://xinruidddj-isv.isvjcloud.com/auth/jos?token=${token}&jd_source=01&channel=`,
                'form': ``,
                headers
            }
        )
        let accessToken = this.haskey(auth, 'body.access_token')
        if (!accessToken) {
            console.log("没有获取到accessToken")
            return
        }
        headers.authorization = `Bearer ${accessToken}`
        for (let box of [1, 2, 3, 4]) {
            let list = await this.curl({
                    'url': `https://xinruidddj-isv.isvjcloud.com/medical-api/get_task?box=${box}&source=%E6%B8%A0%E9%81%93&channel=2`,
                    // 'form': ``,
                    headers
                }
            )
            if (!this.haskey(list, 'data')) {
                console.log("没有获取到数据")
                return
            }
            for (let i of this.haskey(list, 'data')) {
                if (i.title == '签到') {
                    if (i.today_sign_in) {
                        console.log("本日已签到")
                    }
                    else {
                        let sign = await this.curl({
                                'url': `https://xinruidddj-isv.isvjcloud.com/medical-api/do_task?source=%E6%B8%A0%E9%81%93&channel=2`,
                                json: {
                                    "token": i.token,
                                    box
                                },
                                headers
                            }
                        )
                        console.log(this.haskey(sign, 'task_info') || sign)
                    }
                }
                else if (i.item_list) {
                    console.log("正在运行:", i.title)
                    for (let j of i.item_list) {
                        if (i.title.includes("开卡")) {
                            if (this.profile.openCard) {
                                let jo = await this.algo.curl({
                                        'url': `https://api.m.jd.com/client.action`,
                                        'form': `functionId=bindWithVender&body={"venderId":"${j.jd_shop_vender_id}","shopId":"${j.jd_shop_id}","bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0,"channel":4202,"appid":"27004","needSecurity":true,"bizId":"shopmember_m_jd_com"}&t=1715046616857&appid=shopmember_m_jd_com&clientVersion=12.4.3&client=H5&&x-api-eid-token=jdd03C3HUEKC6G2V5WV6SOXJV5E4J2ILKIIHLPARTU7DKUSMS72ICFUVMMF7ZVZXDON6VLTUCVU2GNZ2RZRMVIDXGF2FBMUAAAAMPKC6XVGYAAAAACHGDUSO4UHYMGEX`,
                                        cookie,
                                        algo: {
                                            appId: '27004'
                                        }
                                    }
                                )
                                console.log("正在开卡:", j.name, this.haskey(jo, 'message') || jo)
                                // await this.wait(12122)
                            }
                            else {
                                j.done = 1
                            }
                        }
                        if (!j.done) {
                            console.log("正在浏览:", j.name)
                            let doTask = await this.curl({
                                    'url': `https://xinruidddj-isv.isvjcloud.com/medical-api/do_task?source=%E6%B8%A0%E9%81%93&channel=2`,
                                    json: {
                                        "token": j.token,
                                        box
                                    },
                                    headers
                                }
                            )
                            console.log(this.haskey(doTask, 'task_info.coins') || doTask)
                        }
                    }
                }
            }
            console.log("抽奖中....")
            for (let i of Array(20)) {
                let open = await this.curl({
                        'url': `https://xinruidddj-isv.isvjcloud.com/medical-api/open_box?box=${box}&source=%E6%B8%A0%E9%81%93&channel=2`,
                        'form': ``,
                        headers
                    }
                )
                if (!this.haskey(open, 'prize')) {
                    break
                }
                console.log(this.haskey(open, 'prize') || open)
                if (this.haskey(open, 'prize.prize_info.quota')) {
                    this.print(`京豆: ${open.prize.prize_info.quota}`, p.user)
                }
            }
        }
    }

    async isvToken(p) {
        let cacheKey = this.md5(`${this.fileSalt}_isvObfuscator_${this.userName(p.cookie)}`)
        try {
            var isvObfuscator = await this.cache.get(cacheKey)
        } catch (e) {
        }
        if (!isvObfuscator) {
            var isvObfuscator = await this.sign.jdCurl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `body=${this.dumps({
                        "url": `https://lzdz1-isv.isvjcloud.com`,
                        "id": ""
                    })}&build=169063&client=apple&clientVersion=12.3.4&functionId=isvObfuscator`,
                    cookie: p.cookie
                }
            )
            if (!this.haskey(isvObfuscator, 'token')) {
                isvObfuscator = await this.curl(this.modules.jdObf.app('isvObfuscator', {
                    "url": `https://lzdz1-isv.isvjcloud.com`,
                    "id": ""
                }, 'post', p.cookie))
            }
            if (this.haskey(isvObfuscator, 'token') && this.cache.set) {
                await this.cache.set(cacheKey, isvObfuscator, parseInt(this.fileExpire))
                console.log("写入isvToken缓存成功...")
            }
        }
        else {
            console.log("读取isvToken缓存成功...")
        }
        console.log(`isvToken: ${this.haskey(isvObfuscator, 'token') || "没有获取到isvToken"}`)
        return isvObfuscator
    }

    async extra() {
        if (this.cache.set) {
            console.log(`关闭缓存....`)
            await this.cache.close()
        }
    }
}

module.exports = Main;
