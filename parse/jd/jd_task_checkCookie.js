const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东cookie检测"
        this.cron = "*/20 * * * *"
        // this.thread = 6
        this.task = 'all'
        this.import = ['jdUrl', 'fs']
        this.readme = `[jd_task_checkCookie]\nchange=1 #过期后,使用wskey生成ptkey`
    }

    async main(p) {
        let cookie = p.cookie
        let pin = this.userPin(cookie)
        let dict = this.userDict[pin]
        let s = await this.curl1({
                'url': `https://plogin.m.jd.com/cgi-bin/ml/islogin`,
                // 'form':``,
                cookie
            }
        )
        if ((s.islogin == '0')) {
            console.log(p.user, "账号过期了呀🐶")
            if (this.profile.change) {
                let ua = "Mozilla/5.0 (iPad; CPU OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1"
                let wskey = ''
                if (dict.wskey.includes("wskey")) {
                    wskey = dict.wskey
                    if (!wskey.includes('pin=')) {
                        wskey = `${wskey};pin=${encodeURIComponent(pin)};`
                    }
                }
                else {
                    wskey = `pin=${encodeURIComponent(pin)};wskey=${dict.wskey};`
                }
                let toUrl = "https:\/\/bean.m.jd.com\/beanDetail\/index.action"
                console.log("使用App算法生成")
                var params = {}
                var x = await this.response({
                    url: `https://api.m.jd.com/client.action?functionId=genToken`,
                    form: this.random(this.code, 1)[0],
                    cookie: wskey
                })
                var params = this.modules.jdUrl.app('genToken', {
                    "to": toUrl,
                    "action": "to"
                }, 'post', wskey)
                params.ua = 'JD4iPhone/168095%20(iPhone;%20iOS;%20Scale/3.00)'
                var x = await this.response(params)
                if (this.haskey(x, 'content.tokenKey', 'xxx') || this.haskey(x, 'content.tokenKey').includes("@")) {
                    ua = 'okhttp/3.12.1;jdmall;android;version/12.0.0;build/98771;screen/1080x1920;os/6.0.1;'
                    let headers = {
                        'j-e-c': encodeURIComponent(this.dumps({
                            "hdid": "JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw=",
                            "ts": new Date().getTime(),
                            "ridx": -1,
                            "cipher": {"pin": this.eip(this.userPin(cookie), 'b64encode')},
                            "ciphertype": 5,
                            "version": "1.2.0",
                            "appname": "com.jingdong.app.mall"
                        })),
                        'j-e-h': encodeURIComponent(this.dumps({
                            "hdid": "JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw=",
                            "ts": new Date().getTime(),
                            "ridx": -1,
                            "cipher": {"User-Agent": this.eip(ua, 'b64encode')},
                            "ciphertype": 5,
                            "version": "1.2.0",
                            "appname": "com.jingdong.app.mall"
                        })),
                        'user-agent': ua,
                        'x-rp-client': 'android_2.0.0',
                        'x-referer-page': 'com.jingdong.app.mall.WebActivity',
                        'x-referer-package': 'com.jingdong.app.mall',
                        'charset': 'UTF-8',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }
                    var x = await this.response({
                            'url': `https://api.m.jd.com/client.action?functionId=genToken&lmt=0&clientVersion=12.0.0&build=98771&client=android&partner=au_jdbzlqj021&sdkVersion=23&lang=zh_CN&harmonyOs=0&networkType=wifi&uts=0f31TVRjBSsqndu4%2FjgUPz6uymy50MQJHLsrbzfFCJ3X4YwUMQU1aab%2Fu6I0Yb6H2lv5IwA8gfUtXIhwB%2FBDqaLFMxlR7%2FcDVln3Yo9V5XGZS5eiE%2FFR%2Fsu1VSyPNvXRRYb49tUpirBDvCWgDFhoFZDjmE24j15onqZaC7mJHzcQDVS1GbcYxJSPs%2FXElDVrves0DKxmDyYxweRJ%2BudCxg%3D%3D&uemps=2-0-2&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%2C%22cfgExt%22%3A%22%7B%5C%22privacyOffline%5C%22%3A%5C%220%5C%22%7D%22%7D&eid=eidA8ce481209bsa54Y%2Fp9A0RWWUDFBefT9wfeeGQS%2FLjxwIWCgR41Suz71f2hHQOf9E4GVFG4DFGmYyt52T4VnvRytnpAxFQES4AqvJdta%2FQ%2B87J2ZR&ef=1&ep=%7B%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22ts%22%3A1685720565577%2C%22ridx%22%3A-1%2C%22cipher%22%3A%7B%22d_brand%22%3A%22JWVfoxU%3D%22%2C%22openudid%22%3A%22DwUnZNHrZWG4ZtG4CJcnCq%3D%3D%22%2C%22screen%22%3A%22CJuyCMenCNqm%22%2C%22uuid%22%3A%22DwUnZNHrZWG4ZtG4CJcnCq%3D%3D%22%2C%22osVersion%22%3A%22Ds4mBtO%3D%22%2C%22wifiBssid%22%3A%22dW5hbw93bq%3D%3D%22%2C%22d_model%22%3A%22JJTP%22%2C%22aid%22%3A%22DwUnZNHrZWG4ZtG4CJcnCq%3D%3D%22%7D%2C%22ciphertype%22%3A5%2C%22version%22%3A%221.2.0%22%2C%22appname%22%3A%22com.jingdong.app.mall%22%7D&st=1685720803810&sign=c5fb839ce5a6664fc00c1b2a9fb78a2e&sv=122`,
                            'form': `body=%7B%22action%22%3A%22to%22%2C%22to%22%3A%22https%253A%252F%252Fh5.m.jd.com%252Fpb%252F014685890%252F41rjX1vmJntJWv7zqmjYNtr4AARQ%252Findex.html%253FbabelChannel%253Dwojing%2523%252Fpages%252Findex%252Findex%22%7D&lmt=0&`,
                            cookie: wskey,
                            headers
                        }
                    )
                }
                console.log(x)
                let y = await this.response({
                    url: `https://un.m.jd.com/cgi-bin/app/appjmp?tokenKey=${x.content.tokenKey}&lbs={"cityId":"","districtId":"","provinceId":"","districtName":"","lng":"0.000000","provinceName":"","lat":"0.000000","cityName":""}&to=${encodeURIComponent(toUrl)}`,
                    'form': '',
                })
                let openKey = y.cookie || ''
                if (!openKey.includes('app_open')) {
                    console.log("使用Lite算法生成")
                    toUrl = "https:\/\/tuihuan.jd.com\/afs\/orders?sourceType=160"
                    let params = this.modules.jdUrl.lite('lite_genToken', {
                        "to": toUrl,
                        "action": "to"
                    }, 'post', wskey)
                    params.ua = 'JDMobileLite/3.8.20 (iPhone; iOS 15.1.1; Scale/3.00)'
                    x = await this.response(params)
                    y = await this.response({
                        url: `https://un.m.jd.com/cgi-bin/app/appjmp?tokenKey=${x.content.tokenKey}&lbs={"cityId":"","districtId":"","provinceId":"","districtName":"","lng":"0.000000","provinceName":"","lat":"0.000000","cityName":""}&to=${encodeURIComponent(toUrl)}`,
                        'form': '',
                    })
                    openKey = y.cookie || ''
                }
                if (openKey.includes('app_open')) {
                    console.log(p.user, 'openKey生成成功🍀')
                    // this.notices('openKey生成成功', p.user)
                    this.n++
                    let q1 = this.query(openKey, ';', 'split')
                    let q2 = this.query(cookie, ';', 'split')
                    let q3 = {...q2, ...q1}
                    let newCookie = this.query(this.compact(q3, ['pt_key', 'pt_pin', 'pt_phone']), ';')
                    this.dict[pin] = newCookie + ';'
                }
                else {
                    // this.notices('openKey生成失败', p.user)
                    this.print(`openKey生成失败 -- ${this.userPin(p.cookie)}`, p.user)
                }
            }
            else {
                this.notices("账号过期了呀🐶", p.user)
            }
        }
        else {
            console.log(p.user, "账号还没过期呢🍀")
        }
    }

    async extra() {
        if (this.dumps(this.dict) != '{}') {
            try {
                let command = this['QITOQITO_PLATFORM'] || ''
                let platform = command
                if (command.includes('http')) {
                    platform = 'qinglong'
                }
                switch (platform) {
                    case "qinglong":
                        if (command == 'qinglong') {
                            command = 'http://127.0.0.1:5700'
                        }
                        try {
                            var json = this.modules.fs.readFileSync('../config/auth.json', "utf-8");
                        } catch (ea) {
                            var json = this.modules.fs.readFileSync('../../config/auth.json', "utf-8");
                        }
                        let auth = JSON.parse(json)
                        let authorization = `Bearer ${auth.token}`
                        let url = command;
                        let c = await this.curl1({
                            url: `${url}/api/envs?searchValue=JD_COOKIE&t=1643903429215`,
                            authorization,
                            'headers': {
                                'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                            }
                        })
                        if (c.code == 401) {
                            let login = await this.curl1({
                                'url': `${url}/api/user/login?t=1639363615601`,
                                json: {
                                    "username": auth.username,
                                    "password": auth.password
                                },
                                'headers': {
                                    'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                                }
                            })
                            if (login.code == 200) {
                                let token = login.data.token
                                authorization = `Bearer ${login.data.token}`
                                c = await this.curl1({
                                    url: `${url}/api/envs?searchValue=JD_COOKIE&t=1643903429215`,
                                    authorization,
                                    'headers': {
                                        'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                                    }
                                })
                            }
                        }
                        let dict = this.column(c.data, 'value', '_id')
                        let id = '_id'
                        if (this.dumps(dict) == '{}') {
                            id = 'id'
                            dict = this.column(c.data, 'value', 'id')
                        }
                        for (let i in dict) {
                            let cookie = dict[i]
                            let pin = this.userPin(cookie)
                            if (this.dict[pin]) {
                                let body = (id == 'id') ? {
                                    "name": "JD_COOKIE",
                                    "value": this.dict[pin],
                                    'id': i,
                                } : {
                                    "name": "JD_COOKIE",
                                    "value": this.dict[pin],
                                    '_id': i,
                                }
                                let u = await this.curl1({
                                    url: `${url}/api/envs?t=1643903429215`,
                                    authorization,
                                    json: body,
                                    method: 'put',
                                    'headers': {
                                        'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                                    }
                                })
                                if (u.code == 200) {
                                    this.notices(`更新: ${pin} 成功`)
                                    console.log(`更新: ${pin} 成功`)
                                }
                                else {
                                    this.notices(`更新: ${pin} 失败`)
                                    console.log(`更新: ${pin} 失败`)
                                }
                            }
                        }
                        break
                    case 'jtask':
                    case 'jd':
                        let file = this.modules.fs.readFileSync('../config/config.sh', "utf-8");
                        let cs = this.matchAll(/Cookie\d+\s*=\s*"([^\"]+)"/g, file)
                        let c1 = {}
                        let isChange = 0
                        for (let cookie of cs) {
                            let pin = this.userPin(cookie)
                            if (this.dict[pin]) {
                                this.notices(`更新: ${pin} 成功`)
                                file = file.replace(cookie, this.dict[pin])
                                console.log(`更新: ${pin} 成功`)
                                isChange = 1
                            }
                        }
                        if (isChange) {
                            this.modules.fs.writeFile('../config/config.sh', file, function(err, data) {
                                if (err) {
                                    throw err;
                                }
                                console.log("config.sh写入成功")
                            })
                        }
                        else {
                            console.log("没有数据可以写入")
                        }
                        break
                    case 'list':
                        let lf = this.modules.fs.readFileSync(`${this.dirname}/logs/cookies.list`, "utf-8");
                        let isChange2 = 0
                        for (let cookie of lf.split("\n").map(d => d)) {
                            let pin = this.userName(cookie)
                            if (this.dict[pin]) {
                                lf = lf.replace(cookie, this.dict[pin])
                                console.log(`更新: ${pin} 成功`)
                                isChange2 = 1
                            }
                        }
                        if (isChange2) {
                            this.modules.fs.writeFile(`${this.dirname}/logs/cookies.list`, lf, function(err, data) {
                                if (err) {
                                    throw err;
                                }
                                console.log("cookies.list写入成功")
                            })
                        }
                        else {
                            console.log("没有数据可以写入")
                        }
                        break
                    default:
                        delete require.cache[this.dirname + "/cookie/jd.js"];     // 删除require缓存
                        let cc = require(this.dirname + "/cookie/jd")
                        let change = 0
                        for (let i in cc) {
                            for (let j in cc[i]) {
                                let cookie = cc[i][j]
                                let pin = this.userPin(cookie)
                                if (this.dict[pin]) {
                                    change = 1
                                    this.notices(`更新: ${pin} 成功`)
                                    cc[i][j] = this.dict[pin]
                                }
                            }
                        }
                        if (change) {
                            let data = `module.exports = ${JSON.stringify(cc, null, 4)}`
                            this.modules.fs.writeFile(this.dirname + "/cookie/jd.js", data, function(err, data) {
                                if (err) {
                                    throw err;
                                }
                                console.log("Cookie写入成功")
                            })
                        }
                        else {
                            console.log("没有数据可以写入")
                        }
                        break
                }
                let userData = `module.exports = ${JSON.stringify(this.userDict, null, 4)}`
                this.modules.fs.writeFile(this.dirname + "/config/jdUser.js", userData, function(err, data) {
                    if (err) {
                        throw err;
                    }
                    console.log("user写入成功")
                })
            } catch (e) {
            }
        }
        else {
            console.log('没有可执行数据')
        }
        if (this.n) {
            this.print(`此次共有${this.n}个账户生成新cookie`)
        }
    }

    eip(str, type = "") {
        let dict = this.query('A=K&B=L&C=M&D=N&E=O&F=P&G=Q&H=R&I=S&J=T&K=A&L=B&M=C&N=D&O=E&P=F&Q=G&R=H&S=I&T=J&e=o&f=p&g=q&h=r&i=s&j=t&k=u&l=v&m=w&n=x&o=e&p=f&q=g&r=h&s=i&t=j&u=k&v=l&w=m&x=n', '&', 'split')
        if (type == 'b64encode') {
            return new Buffer.from(typeof str == "object" ? this.dumps(str) : str).toString('base64').split("").map(d => dict[d] || d).join("")
        }
        else {
            let a = str.split("").map(d => dict[d] || d).join("")
            return this.jsonParse(new Buffer.from(a, 'base64').toString())
        }
    }
}

module.exports = Main;
