const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东元宵助力"
        // this.cron = "12 0,20 * * *"
        this.help = 'main'
        this.task = 'own'
        this.import = ['jdAlgo']
        this.verify = 1
        // this.model='user'
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            type: 'lite', 'appId': '47ab8', 'fp': '6070588757234151', 'version': '3.1',
            headers: {
                'user-agent': 'jdapp;iPhone;10.3.4;;;M/5.0;appBuild/167945;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DNC0ZJq1EQU3DJVtEWSnZWC2ZJZuDwPsYzKzDNruEWS2ZNu4DJCmCK%3D%3D%22%2C%22sv%22%3A%22CJOkDK%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1643599078%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79;supportJDSHWK/1;',
                'referer': 'https://sfgala.jd.com/spring/eve/index.html'
            }
        })
        for (let cookie of this.cookies['help']) {
            let s = await this.curl({
                    'url': `https://api-x.m.jd.com/`,
                    'form': `functionId=party_yx_inviteWindow&body={"showAssistorsSwitch":true}&client=wh5&clientVersion=1.0.0&appid=spring_h5`,
                    cookie
                }
            )
            try {
                this.shareCode.push({inviteCode: s.data.result.inviteCode})
            } catch (e) {
            }
        }
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                'url': `https://api-x.m.jd.com/`,
                'form': `functionId=party_yx_assistWindow&body={"inviteCode":"${p.inviter.inviteCode}"}&client=wh5&clientVersion=1.0.0&appid=spring_h5`,
                cookie
            }
        )
        let z = await this.algo.curl({
                'url': `https://api-x.m.jd.com/`,
                form: `functionId=party_yx_assist&body={"inviteCode":"${p.inviter.inviteCode}","uuid":"sX88mRXGZ63KidZr","sv":"${this.sha256(p.user)}"}&client=wh5&clientVersion=1.0.0&appid=spring_h5`,
                // 'form':``,
                cookie
            }
        )
        console.log(z)
        if (z.data.bizMsg.includes('不需要') || z.data.bizMsg.includes('已满')) {
            this.finish.push(p.number)
        }
        this.n = this.n + 1
    }
}

module.exports = Main;
