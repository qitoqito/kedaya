const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东充值金"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.interval = 20000
        this.import = ['jdAlgo']
        this.hint = {
            shell: '1 # 部分用户使用青龙环境无法签到,请在脚本节点添加shell=1'
        }
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: 'latest'
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let list = await this.curl({
                'url': `https://api.m.jd.com/api?functionId=dwapp_task_dwList`,
                'form': `appid=h5-sep&body=${this.dumps(await this.cmd5x())}&client=m&clientVersion=6.0.0`,
                cookie
            }
        )
        let cash = 0
        for (let i of this.haskey(list, 'data') || []) {
            if (i.viewStatus == 3 || i.viewStatus == 1) {
                console.log("任务完成:", i.name)
            }
            else {
                console.log("正在运行:", i.name)
                let record = await this.curl({
                        'url': `https://dwapp.jd.com/user/task/dwRecord`,
                        'json': await this.cmd5x({
                            "id": i.id,
                            "taskType": i.taskType,
                            "agentNum": "m",
                            "followChannelStatus": "",
                            taskFlowChannelId: i.taskFlowChannelId
                        }),
                        cookie
                    }
                )
                // console.log(record)
                await this.wait(2000)
                let receive = await this.curl({
                        'url': `https://dwapp.jd.com/user/task/dwReceive`,
                        'json': await this.cmd5x({
                            "id": i.id,
                        }),
                        cookie
                    }
                )
                if (this.haskey(receive, 'data.giveScoreNum')) {
                    console.log("获得充值金:", receive.data.giveScoreNum)
                    cash += receive.data.giveScoreNum
                }
                else {
                    console.log(receive)
                }
                await this.wait(1000)
            }
        }
        if (this.profile.shell) {
            let {execSync} = require('child_process');
            let proxy = this.proxy || this.options.proxy
            let proxyText = proxy ? ` -x ${proxy} ` : ''
            let s2 = await this.algo.h5st({
                    'url': `https://api.m.jd.com/api`,
                    form: `appid=h5-sep&body=${this.dumps(await this.cmd5x())}&client=m&clientVersion=6.0.0&functionId=DATAWALLET_USER_SIGN`,
                    cookie,
                    algo: {
                        appId: '60d0e'
                    },
                    referer: 'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html',
                }
            )
            var exec = `curl -s ${proxyText}-H 'Accept: application/json, text/plain, */*' -H 'referer: ${s2.headers.referer}' -H 'user-agent: ${s2.headers['user-agent']}' -H 'cookie: ${cookie}' -H 'host: api.m.jd.com' --data "${s2.form}" --compressed 'https://api.m.jd.com/api'`
            let output = execSync(exec);
            var sign = this.jsonParse(output.toString())
        }
        else {
            var sign = await this.algo.curl({
                    'url': `https://api.m.jd.com/api`,
                    form: `appid=h5-sep&body=${this.dumps(await this.cmd5x())}&client=m&clientVersion=6.0.0&functionId=DATAWALLET_USER_SIGN`,
                    cookie,
                    algo: {
                        appId: '60d0e'
                    },
                    referer: 'https://mypoint.jd.com/'
                }
            )
        }
        console.log(sign)
        let totalNum = 0
        if (this.haskey(sign, 'data.signInfo.signNum')) {
            cash += sign.data.signInfo.signNum
            totalNum = sign.data.totalNum
        }
        else {
            if (sign) {
                if (sign.code == 302) {
                    console.log('签到过了...')
                }
                else {
                    console.log(sign)
                }
            }
            else {
                console.log("没有获取到数据...")
            }
        }
        if (cash>0) {
            if (totalNum) {
                this.print(`现有: ${totalNum} 获得: ${cash.toFixed(2)}`, p.user)
            }
            else {
                this.print(`获得充值金: ${cash.toFixed(2)}`, p.user)
            }
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
