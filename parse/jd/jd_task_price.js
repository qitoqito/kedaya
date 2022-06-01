const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东保价"
        this.cron = "38 */10 * * *"
        this.import = ['jsdom', 'jdAlgo']
        // this.thread = 1
        this.task = 'local'
    }

    async prepare() {
        // this.algo = new this.modules.jdAlgo()
        // this.algo.set({
        //     'appId': '3adb2',
        //     // 'type': 'app',
        //     'fp': '7052439682005356',
        // })
        await this.waap()
    }

    async main(p) {
        let cookie = p.cookie
        let body = {
            sid: "",
            type: "25",
            forcebot: "",
        }
        let s = {}
        for (let i = 0; i<3; i++) {
            let t = new Date().getTime()
            let h5st = await this.signWaap('d2f64', {
                appid: 'siteppM',
                functionId: 'siteppM_skuOnceApply',
                t,
                body: {sid: '', type: '25', forcebot: ''}
            })
            s = await this.curl({
                    'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_skuOnceApply&forcebot=&t=${t}`,
                    "form": `body=${this.dumps({
                        sid: "",
                        type: "25",
                        forcebot: "",
                    })}&h5st=${encodeURIComponent(h5st)}`,
                    cookie,
                    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0',
                    "referer": "https://msitepp-fm.jd.com/",
                }
            )
            if (s.flag == true) {
                break
            }
            else if (s.responseMessage == '10分钟内只能申请一次' || s.responseMessage == '不要频繁点我，稍等一下再试吧') {
                console.log(s.responseMessage)
                return
            }
        }
        console.log("等待25s,获取保价订单中");
        await this.wait(25000)
        let p2 = {
            'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_appliedSuccAmount&forcebot=&t=${this.timestamp}`,
            'form': 'body={"sid":"","type":"25","forcebot":"","num":15}',
            cookie: p.cookie
        }
        let s2 = await this.curl(p2)
        console.log(p.user, s2)
        let text
        if (s2.flag) {
            text = `本次保价金额: ${s2.succAmount}`
            this.notices(text, p.user)
        }
        else {
            text = "本次无保价订单"
        }
        console.log(p.user, text)
    }

    async extra() {
        this.dom.window.close()
    }

    async waap() {
        let {
            JSDOM
        } = this.modules.jsdom;
        let resourceLoader = new this.modules.jsdom.ResourceLoader({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0',
            referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
        });
        let options = {
            url: "http://127.0.0.1/h5st/h5st.html",
            runScripts: "dangerously",
            resources: resourceLoader,
        }
        this.dom = new JSDOM(`<body>
         <script type="text/javascript" src="https://static.360buyimg.com/siteppStatic/script/mescroll/map.js"></script>
  <script type="text/javascript" src="https://storage.360buyimg.com/webcontainer/js_security_v3_0.1.0.js"></script>
  <script type="text/javascript" src="https://static.360buyimg.com/siteppStatic/script/utils.js"></script>
  <script type="text/javascript" src="https://js-nocaptcha.jd.com/statics/js/main.min.js"></script>
</body>`, options);
        await this.wait(3000)
        this.signWaap = this.dom.window.signWaap
    }

    async jstoken() {
        let {
            JSDOM
        } = this.modules.jsdom;
        let resourceLoader = new this.modules.jsdom.ResourceLoader({
            userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100${this.rand(100, 999)} Firefox/91.0`,
            referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
        });
        let virtualConsole = new this.modules.jsdom.VirtualConsole();
        var options = {
            url: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
            referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
            userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100${this.rand(100, 999)} Firefox/91.0`,
            runScripts: "dangerously",
            resources: resourceLoader,
            //  cookieJar,
            includeNodeLocations: true,
            storageQuota: 10000000,
            pretendToBeVisual: true,
            virtualConsole
        };
        this.dom = new JSDOM(`<body><script src="https://js-nocaptcha.jd.com/statics/js/main.min.js"></script></body>`, options);
        await this.wait(5000)
        try {
            let feSt = 's'
            let jab = new this.dom.window.JAB({
                bizId: 'jdjiabao',
                initCaptcha: false
            })
            this.token = jab.getToken()
        } catch (e) {
        }
    }
}

module.exports = Main;
