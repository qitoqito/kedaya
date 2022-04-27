const Template = require('./template');

class Bot extends Template {
    constructor() {
        super()
        this.type = 'bot'
        this.import = ['fs', 'node-telegram-bot-api']
    }

    async telegram() {
        await this.include()
        await this.configuration()
        await this.qlAuth()
        await this.tgMsg()
    }

    async tgMsg() {
        if (this['QITOQITO_MAP']) {
            let change = {}
            for (let k of this['QITOQITO_MAP'].replace(/\&/g, "\|").split("|")) {
                let a = k.split("=")
                for (let i of a[0].split(',')) {
                    change[i] = {
                        map: a[1],
                        type: a[1].split("_")[0]
                    }
                }
            }
            this.dict.map = change
        }

        this.TelegramBot = this.modules['node-telegram-bot-api']
        let request = {}
        if (this.BOT_PROXY) {
            if (this.BOT_PROXY.toLowerCase().includes("socks")) {
                var SocksProxyAgent = require('socks-proxy-agent');
                var agent = new SocksProxyAgent(this.BOT_PROXY.toLowerCase());
                request.agent = agent
            }
            else {
                request.proxy = this.BOT_PROXY
            }
        }
        this.bot = new this.TelegramBot(this.BOT_TOKEN, {
            polling: true, request,
        });
        this.bot.on('text', async (msg) => {
            let timestamp = parseInt(new Date().getTime() / 1000)
            let chat = msg.chat
            let from = msg.from
            let messageId = msg.message_id
            let chatId = chat.id
            let text = msg.text
            let group = ['group', 'supergroup'].includes(msg.chat.type)
            let id = from.id
            let admin = this.BOT_ROOT.includes(id.toString())
            let ban = 0
            let groupTask = 0
            var reText
            if (this.haskey(msg, 'reply_to_message')) {
                reText = msg.reply_to_message.text
            }
            if (this.n == 0) {
                this.sendMessage(chat.id, `我出来溜达了哦`, '', 23333);
                this.n++
            }
            if (admin) {
                if (text == "上线") {
                    console.log(`我还在呢`)
                    this.sendMessage(chatId, `我还在呢`, '', 23333)
                }
                if (text == "下线") {
                    console.log(`不要捣乱哦,小心铁锅炖你`)
                    this.sendMessage(chatId, `不要捣乱哦,小心铁锅炖你`, '', 23333)
                }
                let custom = this.TASK_CUSTOM.split(',').join("|")
                let script = this.TASK_SCRIPT.split(',').join("|")
                let map = Object.keys(this.TASK_MAP)
                if (this.match(new RegExp(`(^${map.join("|")})`), text)) {
                    for (let i of map) {
                        if (this.match(new RegExp(`(^${i})`), text)) {
                            let k = text.split(i)
                            text = `task ${this.TASK_MAP[i]} -custom ${k[1]}`
                            break
                        }
                    }
                }
                if (this.match(new RegExp(`(^${custom})`), text) && !this.match(/task\s*\w+/, text)) {
                    let command = this.match(new RegExp(`(^${custom})`), text)
                    text = `task jd_task_${command} -custom ${reText || text.replace(command, '')}`
                }
                else if (this.match(new RegExp(`(^${script}$)`), text) && !this.match(/task\s*\w+/, text)) {
                    let command = this.match(new RegExp(`(^${script})`), text)
                    text = `task jd_task_${command}`
                }
                else if (this.dict.map && this.match(new RegExp(`(^${Object.keys(this.dict.map).join("|")})`), text) && !this.match(/task\s*\w+/, text)) {
                    let command = this.match(new RegExp(`(^${Object.keys(this.dict.map).join("|")})`), text)
                    text = `task ${this.dict.map[command].map} -custom ${reText || text.replace(command, '')}`
                }
                else if (this.match(/^ini\s*-\w+/, text)) {
                    text = text.replace("ini", 'task jd_task_ini')
                }
                let filename = this.match(/task\s*(\w+)\s*/, text)
                if (filename) {
                    try {
                        console.log(text)
                        console.log(`即将执行:`, filename)
                        let argv = text.split(filename)
                        let echo = `执行脚本: ${filename}\n执行参数: ${argv[1]}`
                        this.sendMessage(chatId, echo, '', 6666)
                        let task = await this.curl({
                                'url': `${this.QINGLONG_URL}/open/scripts/run?t=1651046809445`,
                                method: 'put',
                                json: {
                                    filename: `main.js ${filename} ${argv[1]}`,
                                    path: "",
                                }
                            }
                        )
                        console.log(task)
                    } catch (e) {
                    }
                }
            }
        })
    }

    async sendMessage(id, echo, params = {}, timeout = 0) {
        this.bot.sendMessage(id, echo, params || {}).then(async (res) => {
            if (timeout) {
                await this.wait(6666)
                console.log(`删除消息: ${echo}`)
                this.bot.deleteMessage(res.chat.id, res.message_id)
            }
        });
    }

    async qlAuth() {
        let s = await this.curl({
                'url': `${this.QINGLONG_URL}/open/auth/token?client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_SECRET}`,
            }
        )
        this.assert(this.haskey(s, 'data.token'), '青龙认证错误')
        this.options.headers = {
            Authorization: `Bearer ${s.data.token}`
        }
    }
}

!(async () => {
    let bot = new Bot()
    bot.telegram()
})().catch((e) => {
    console.log(e)
}).finally(() => {
});
