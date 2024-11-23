const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "框架测试"
        this.cron = "6 6 6 6 6"
        this.readme = "这里是测试信息"
        this.work = '0'
        this.import = ['jdAlgo', 'logBill', 'https']
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: 'latest',
            // type: 'wechat'
        })
    }

    async main(p) {
        console.log(this.algo.fv)
        // return
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        let cookie = p.cookie;
        const {execSync} = require('child_process');
        try {
            for (let ciphers of "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256".split(":")) {
                let sign = await this.algo.h5st({
                        'url': `https://api.m.jd.com/api`,
                        form: `appid=h5-sep&body=${this.dumps(await this.cmd5x())}&client=m&clientVersion=6.0.0&functionId=DATAWALLET_USER_SIGN`,
                        cookie,
                        algo: {
                            appId: '60d0e'
                        },
                        referer: 'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html',
                        httpsAgent: new this.modules.https.Agent({
                            // ciphers,
                            secureProtocol: "TLSv1_2_method",
                            http2: true,
                            // maxVersion: 'TLSv1.2',
                            ciphers: ciphers,
                            honorCipherOrder: true,
                            minVersion: "TLSv1.2",
                        })
                        // agentOptions: {
                        //     http2: true,
                        // }
                    }
                )
                let kk = await this.curl(sign)
                console.log(ciphers, kk)
                await this.wait(2000)
                var exec = `curl -H 'Accept: application/json, text/plain, */*' -H 'referer: ${sign.headers.referer}' -H 'user-agent: ${sign.headers['user-agent']}' -H 'cookie: ${cookie}' -H 'host: api.m.jd.com' --data "${sign.form}" --compressed 'https://api.m.jd.com/api'`
            }
            // console.log(sign)
            // let output = execSync(exec);
            // console.log('shell', output.toString());
            let s2 = await this.algo.curl({
                    'url': `https://api.m.jd.com/api`,
                    form: `appid=h5-sep&body=${this.dumps(await this.cmd5x())}&client=m&clientVersion=6.0.0&functionId=DATAWALLET_USER_SIGN`,
                    cookie,
                    algo: {
                        appId: '60d0e'
                    },
                    referer: 'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html',
                    httpsAgent: new this.modules.https.Agent({
                        ciphers: [
                            "TLS_CHACHA20_POLY1305_SHA256",
                            "TLS_AES_128_GCM_SHA256",
                            "TLS_AES_256_GCM_SHA384",
                            "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
                        ].join(":"),
                        honorCipherOrder: true,
                        minVersion: "TLSv1.2",
                    })
                }
            )
            console.log(s2)
        } catch (error) {
            console.error(`执行的错误: ${error}`);
        }
    }

    async cmd5x(params = {}) {
        let p = Object.assign(params, {
            t: new Date().getTime()
        })
        let str = p.id || ''
        if (p.taskType) {
            str = `${str}${p.taskType}`
        }
        p.encStr = this.md5(`${str}${p.t}e9c398ffcb2d4824b4d0a703e38yffdd`)
        return p
    }
}

module.exports = Main;
