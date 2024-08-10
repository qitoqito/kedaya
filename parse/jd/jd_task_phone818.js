const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东818手机节"
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
            referer: 'https://prodev.m.jd.com/mall/active/2UPzB1rxUBnBtmTrwnqjUaHMdLdQ/index.html?',
            'user-agent': 'jdapp;iPad;12.4.3;;;M/5.0;appBuild/169370;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DtK4DJPvYtSyENu3DzLsYWDrCQDsCzUyDWVwCJvsDQGyZNUnZNY2Dq%3D%3D%22%2C%22sv%22%3A%22CJYkDq%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1718252450%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
            'App-Key': 'NYbKyuYV'
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
        let list = await this.curl({
                'url': `https://xinrui-isv.isvjcloud.com/phone-b1b-api/task_state?channel=2`,
                headers
            }
        )
        if (!this.haskey(list, 'task_vos')) {
            console.log("没有获取到数据")
            return
        }
        for (let i of this.haskey(list, 'task_vos')) {
            if (i.title == '签到') {
                if (i.today_sign_in) {
                    console.log("本日已签到")
                }
                else {
                    let sign = await this.curl({
                            'url': `https://xinrui-isv.isvjcloud.com/phone-b1b-api/do_task?channel=2`,
                            json: {
                                "token": i.token,
                            },
                            headers
                        }
                    )
                    console.log(this.haskey(sign, ['task_info.coins', 'user_task_log.coins']) || sign)
                }
            }
            else if (i.item_list) {
                if (i.done_count != i.max_count) {
                    console.log("正在运行:", i.title)
                    if (i.title.includes("开卡") && !this.profile.openCard) {
                        continue
                    }
                    for (let j of i.item_list) {
                        console.log("正在浏览:", j.name)
                        if (i.title.includes("加购")) {
                            let caT = await this.curl({
                                    'url': `https://xinrui-isv.isvjcloud.com/phone-b1b-api/catch_task`,
                                    'form': `token=${j.token}`,
                                    headers
                                }
                            )
                            if (i.timer) {
                                await this.wait(i.timer * 1000)
                            }
                        }
                        else if (i.title.includes("开卡")) {
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
                        }
                        let doTask = await this.curl({
                                'url': `https://xinrui-isv.isvjcloud.com/phone-b1b-api/do_task?token=${j.token}`,
                                'form': ``,
                                headers
                            }
                        )
                        console.log(this.haskey(doTask, ['task_info.coins', 'user_task_log.coins']) || doTask)
                    }
                }
            }
        }
        let info = await this.curl({
                'url': `https://xinrui-isv.isvjcloud.com/phone-b1b-api/get_user_info?`,
                headers
            }
        )
        let count = this.haskey(info, 'coins') || 0
        console.log("可抽奖次数", count)
        let beans = 0
        for (let i of Array(count)) {
            console.log("抽奖中...")
            let start = await this.curl({
                    'url': `https://xinrui-isv.isvjcloud.com/phone-b1b-api/start_game?channel=2`,
                    'form': ``,
                    headers
                }
            )
            let end = await this.curl({
                    'url': `https://xinrui-isv.isvjcloud.com/phone-b1b-api/to_b1b?token=${start.token}&b1b_type=2&channel=2`,
                    'form': ``,
                    headers
                }
            )
            if (this.haskey(end, 'prize.user_prize.prize_info.quota')) {
                if (end.prize.user_prize.prize_type == '1') {
                    beans += end.prize.user_prize.prize_info.quota
                    console.log(`${end.prize.user_prize.prize_name}: ${end.prize.user_prize.prize_info.quota}`)
                }
                else {
                    this.print(`${end.prize.user_prize.prize_name}: ${end.prize.user_prize.prize_info.quota}`, p.user)
                }
            }
            else {
                console.log(this.haskey(end, 'prize.user_prize') || end)
            }
            await this.wait(1000)
        }
        if (beans>0) {
            this.print(`京豆: ${beans}`,p.user)
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
