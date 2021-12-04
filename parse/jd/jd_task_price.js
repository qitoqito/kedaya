const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东保价"
        this.cron = "38 */10 * * *"
        this.import = ['jsdom']
        // this.thread = 6
        this.task = 'local'
    }

    async main(p) {
        await this.jstoken()
        let params = {
            'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_skuOnceApply&forcebot=&t=${this.timestamp}`,
            "form": {
                "body": JSON.stringify({
                    sid: "",
                    type: "25",
                    forcebot: "",
                    token: this.token,
                    feSt: 's'
                })
            },
            cookie: p.cookie,
        };
        await this.curl(params)
        console.log(this.source);
        console.log("等待25s,获取保价订单中");
        await this.wait(25000)
        let p2 = {
            'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_appliedSuccAmount&forcebot=&t=${this.timestamp}`,
            'form': 'body={"sid":"","type":"25","forcebot":"","num":15}',
            cookie: p.cookie
        }
        let s2 = await this.curl(p2)
        console.log(s2)
        let text
        if (s2.flag) {
            text = `本次保价金额: ${s2.succAmount}`
        }
        else {
            text = "本次无保价订单"
        }
        console.log(text)
        this.notices(text, p.user)
    }

    async extra() {
        this.dom.window.close()
    }

    async jstoken() {
        let {
            JSDOM
        } = this.modules.jsdom;
        let resourceLoader = new this.modules.jsdom.ResourceLoader({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
            referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
        });
        let virtualConsole = new this.modules.jsdom.VirtualConsole();
        var options = {
            url: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
            referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
            runScripts: "dangerously",
            resources: resourceLoader,
            //  cookieJar,
            includeNodeLocations: true,
            storageQuota: 10000000,
            pretendToBeVisual: true,
            virtualConsole
        };
        this.dom = new JSDOM(`<body><script src="https://js-nocaptcha.jd.com/statics/js/main.min.js"></script></body>`, options);
        await this.wait(2000)
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

    async jstoken234() {
        const {JSDOM} = this.modules.jsdom;
        let resourceLoader = new this.modules.jsdom.ResourceLoader({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
            referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu"
        });
        let virtualConsole = new this.modules.jsdom.VirtualConsole();
        let options = {
            url: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
            referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
            runScripts: "dangerously",
            resources: resourceLoader,
            includeNodeLocations: true,
            storageQuota: 10000000,
            pretendToBeVisual: true,
            virtualConsole
        };
        const {window} = new JSDOM(``, options);
        const jdPriceJs = await this.curl("https://js-nocaptcha.jd.com/statics/js/main.min.js")
        try {
            window.eval(jdPriceJs)
            window.HTMLCanvasElement.prototype.getContext = () => {
                return {};
            };
            this.jab = new window.JAB({
                bizId: 'jdjiabao',
                initCaptcha: false
            })
            this.token = this.jab.getToken()
        } catch (e) {
        }
    }
}

module.exports = Main;
