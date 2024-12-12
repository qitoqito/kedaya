const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东WSKEY转换"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.import = ['jdUrl', 'fs']
        this.readme = "使用前需先在config/jdUser配置用户wskey,以及将verify字段设置为1或2,脚本才能正常转换cookie,当verify设置为2时,即使当前cookie没有过期,也会强制转换更新\n慎重使用wskey相关脚本,此脚本没有用到外部服务器计算genToken"
    }

    async main(p) {
        let cookie = p.cookie
        let pin = this.userPin(cookie)
        let dict = this.userDict[pin]
        if (cookie.includes("wskey=")) {
            let q = this.query(cookie, ';', 1)
            if (q.pt_pin && !q.pin) {
                q.pin = q.pt_pin
            }
            delete q.pt_pin
            delete q.pt_key
            cookie = this.query(q, ';')
            dict = {
                wskey: cookie,
                verify: 1
            }
            if (this.userDict[pin]) {
                this.userDict[pin].wskey = q.wskey
            }
            else {
                this.userDict[pin] = {
                    pin,
                    userName: pin,
                    index: this.rand(10000, 20000),
                    wskey: cookie,
                    verify: 1
                }
            }
        }
        if (dict.wskey && (dict.verify || this.profile.pass)) {
            let s = await this.curl({
                    'url': `https://plogin.m.jd.com/cgi-bin/ml/islogin`,
                    cookie
                }
            )
            if (s.islogin == '0' || parseInt(dict.verify) == 2 || cookie.includes("wskey=") || this.profile.change) {
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
                var openKey
                for (let i of Array(2)) {
                    let toUrl = "https:\/\/bean.m.jd.com\/beanDetail\/index.action"
                    console.log("使用App算法生成")
                    let ua = "Mozilla/5.0 (iPad; CPU OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1"
                    var params = this.modules.jdUrl.app('genToken', {
                        "to": toUrl,
                        "action": "to"
                    }, 'post', wskey)
                    var x = await this.curl({
                            'url': `http://api.m.jd.com/client.action?functionId=genToken`,
                            'form': params.form,
                            cookie: wskey,
                            response: 'all',
                            headers: {
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
                                'user-agent': 'JD4iPhone/169635%20(iPhone;%20iOS;%20Scale/3.00);jdmall;iphone;version/13.8.1;build/169635;network/wifi;screen/1170x2532;os/15.1.1',
                                'x-rp-client': 'ios_4.0.0',
                                'x-referer-page': 'com.jingdong.app.mall.WebActivity',
                                'x-referer-package': 'com.jingdong.app.mall',
                                'charset': 'UTF-8',
                                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                            }
                        }
                    )
                    let y = await this.curl({
                            'url': `https://un.m.jd.com/cgi-bin/app/appjmp?tokenKey=${x.content.tokenKey}&&lbs={"cityId":"","districtId":"","provinceId":"","districtName":"","lng":"0.000000","provinceName":"","lat":"0.000000","cityName":""}&to=${encodeURIComponent(toUrl)}`,
                            'form': ``,
                            cookie,
                            response: "all",
                            maxRedirects: 0,
                            scheme: 'http',
                        }
                    )
                    openKey = y.cookie || ''
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
                    console.log(openKey)
                    if (openKey.includes('app_open')) {
                        break
                    }
                }
                if (openKey.includes('app_open')) {
                    console.log('openKey生成成功', p.user)
                    this.n++
                    let q1 = this.query(openKey, ';', 'split')
                    let q2 = this.query(cookie, ';', 'split')
                    let q3 = {...q2, ...q1}
                    let newCookie = this.query(this.compact(q3, ['pt_key', 'pt_pin', 'pt_phone']), ';')
                    this.dict[pin] = newCookie + ';'
                }
                else {
                    this.print(`openKey生成失败--${this.userPin(p.cookie)}`, p.user)
                }
            }
            else {
                console.log(p.user, '账户未过期')
            }
        }
        else {
            console.log(p.user, '没有wskey或者没设置verify字段')
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
