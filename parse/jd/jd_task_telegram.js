const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "telegram监控"
        this.import = ['fs', 'node-telegram-bot-api']
        this.jump = 1
    }

    async prepare() {
        if (this.custom) {
            await this.tg()
        }
        else {
            await this.tgMsg()
        }
    }

    async tgMsg() {
        let dir = this.modules.fs.readdirSync(`${this.dirname}/parse/jd`);
        let scripts = []
        dir.forEach(function(v, k) {
            let a = v.match(/jd_task_(\w+)/)
            if (a) {
                scripts.push(a[1])
            }
        })
        if (this['QITOQITO_MAP']) {
            let change = {}
            if (typeof this['QITOQITO_MAP'] == 'object') {
                for (let i in this['QITOQITO_MAP']) {
                    change[i] = {
                        map: this['QITOQITO_MAP'][i],
                        type: this['QITOQITO_MAP'][i].split("_")[0]
                    }
                }
            }
            else {
                for (let k of this['QITOQITO_MAP'].replace(/\&/g, "\|").split("|")) {
                    let a = k.split("=")
                    for (let i of a[0].split(',')) {
                        change[i] = {
                            map: a[1],
                            type: a[1].split("_")[0]
                        }
                    }
                }
            }
            this.dict.map = change
        }
        this.TelegramBot = this.modules['node-telegram-bot-api']
        let request = {}
        if (this.profile.BOT_PROXY) {
            if (this.profile.BOT_PROXY.toLowerCase().includes("socks")) {
                var SocksProxyAgent = require('socks-proxy-agent');
                var agent = new SocksProxyAgent(this.profile.BOT_PROXY.toLowerCase());
                request.agent = agent
            }
            else {
                request.proxy = this.profile.BOT_PROXY
            }
        }
        this.bot = new this.TelegramBot(this.profile.BOT_TOKEN, {
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
            let admin = this.profile.BOT_ROOT.includes(id.toString())
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
                let custom = this.profile.TASK_CUSTOM.split(',').join("|")
                let script = this.profile.TASK_SCRIPT.split(',').join("|")
                // let map = Object.keys(this.profile.TASK_MAP)
                let taskMap = {}
                for (let kk in this.profile) {
                    if (kk.includes('TASK_MAP_')) {
                        taskMap[kk.replace('TASK_MAP_', '')] = this.profile[kk]
                    }
                }
                let map = Object.keys(taskMap)
                if (this.match(new RegExp(`(^${map.join("|")})`), text)) {
                    for (let i of map) {
                        if (this.match(new RegExp(`(^${i})`), text)) {
                            let k = text.split(i)
                            text = `task ${taskMap[i]} -custom ${k[1]}`
                            break
                        }
                    }
                }
                if (this.match(new RegExp(`(^${custom})`), text) && !this.match(/task\s*\w+/, text)) {
                    let command = this.match(new RegExp(`(^${custom})`), text)
                    // if (text.split(0, command.length) == command) {
                        text = `task jd_task_${command} -custom ${reText || text.replace(command, '')}`
                    // }
                }
                else if (this.match(new RegExp(`(^${script}$)`), text) && !this.match(/task\s*\w+/, text)) {
                    let command = this.match(new RegExp(`(^${script})`), text)
                    // if (text.split(0, command.length) == command) {
                        text = `task jd_task_${command}`
                    // }
                }
                else if (this.match(new RegExp(`(^${scripts.join("|")}$)`), text) && !this.match(/task\s*\w+/, text)) {
                    let command = this.match(new RegExp(`(^${scripts.join("|")})`), text)
                    // if (text.split(0, command.length) == command) {
                        text = `task jd_task_${command} -custom ${reText || text.replace(command, '')}`
                    // }
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
                        console.log(`即将执行:`, filename)
                        let argv = text.split(filename)
                        try {
                            let type = filename.split('_')[0]
                            switch (type) {
                                case "js":
                                case "jx":
                                case "jr":
                                case 'jw':
                                    type = 'jd'
                                    break
                            }
                            let yaya = require(`${this.dirname}/parse/${type}/${filename}`)
                            let kedaya = new yaya()
                            let echo = `执行命令: ${kedaya.title}\n执行脚本: ${filename}\n执行参数: ${argv[1]}`
                            this.sendMessage(chatId, echo, '', 6666)
                            let params = this.query(argv[1].replace(/\s*-(\w+)\s+/g, `&$1=`), '&', 1)
                            let pp = {
                                filename
                            }
                            for (let i in params) {
                                if (params[i]) {
                                    pp[i] = params[i]
                                }
                            }
                            await kedaya.init(pp)
                        } catch (e) {
                        }
                    } catch (e) {
                    }
                }
            }
        })
    }

    async tg() {
        this.locationId = {}
        this.ban = 0
        for (let i of this.getValue('custom')) {
            let k = this.match(/(\w+)\s*=\s*([^\s]+)/, i)
            if (k.length) {
                if (k[1].includes(',')) {
                    this.dict[k[0]] = k[1].split(',').map(d => d.trim())
                }
                else {
                    this.dict[k[0]] = k[1]
                }
            }
        }
        this.assert(this.dict.token, "请先添加机器人TOKEN")
        this.TelegramBot = this.modules['node-telegram-bot-api']
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
        let request = {}
        if (this.proxy) {
            if (this.proxy.toLowerCase().includes("socks")) {
                var SocksProxyAgent = require('socks-proxy-agent');
                var agent = new SocksProxyAgent(this.proxy.toLowerCase());
                request.agent = agent
            }
            else {
                request.proxy = this.proxy
            }
        }
        this.bot = new this.TelegramBot(this.dict.token, {
            polling: true, request,
        });
        let isActive = 0
        this.bot.on('text', async (msg) => {
            // console.log(msg)
            let timestamp = parseInt(new Date().getTime() / 1000)
            let chat = msg.chat
            let from = msg.from
            let messageId = msg.message_id
            let chatId = chat.id
            let text = msg.text
            let group = ['group', 'supergroup'].includes(msg.chat.type)
            let id = from.id
            let admin = this.dict.root.includes(id.toString())
            let ban = 0  // 禁言
            let groupTask = 0 // 是否允许群组成员运行
            var reText
            if (this.haskey(msg, 'reply_to_message')) {
                reText = msg.reply_to_message.text
            }
            // 群组禁言设置
            if (group) {
                this.dict[chatId] = this.dict[chatId] || {}
                console.log(this.dict[chatId])
                if (this.dict[chatId].ban && timestamp<this.dict[chatId].ban) {
                    ban = 1
                    console.log(`禁言中: ${this.dict[chatId].ban - timestamp}秒后解封`)
                }
            }
            if (this.match(/^ban \d+$/, text) && admin && group) {
                let banTime = this.match(/\d+/, text)
                console.log(`禁言了,之后的信息不做处理`)
                this.sendMessage(chat.id, `我先去小黑屋${banTime}秒,等我回来`, '', 16666);
                this.dict[chatId].ban = timestamp + parseInt(banTime)
            }
            else if (this.match(/^unban$/, text) && admin && group) {
                let st = this.dict[chatId].ban ? "我从小黑屋回来了哦" : "我没在小黑屋哦"
                this.dict[chatId].ban = 0
                ban = 0
                this.sendMessage(chat.id, st, '', 16666);
            }
            if (!ban) {
                if (this.match(new RegExp(`(^${this.dict.custom.join("|")})`), text) && !this.match(/task\s*\w+/, text)) {
                    let command = this.match(new RegExp(`(^${this.dict.custom.join("|")})`), text)
                    text = `task jd_task_${command} -custom ${reText || text.replace(command, '')}`
                }
                else if (this.match(new RegExp(`(^${this.dict.scripts.join("|")}$)`), text) && !this.match(/task\s*\w+/, text)) {
                    let command = this.match(new RegExp(`(^${this.dict.scripts.join("|")})`), text)
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
                if (filename && admin) {
                    console.log(filename)
                    try {
                        let split = text.split(filename)
                        let params = {}
                        if (split.length == 2) {
                            params = this.query(split[1].replace(/\s*-(\w+)\s+/g, `&$1=`), '&', 1)
                        }
                        if (filename == 'config') {
                            filename = "cp_task_config"
                        }
                        let type = filename.split('_')[0]
                        switch (type) {
                            case "js":
                            case "jx":
                            case "jr":
                            case 'jw':
                                type = 'jd'
                                break
                        }
                        if (type == 'jd') {
                            params.filename = filename
                        }
                        let yaya = require(`${this.dirname}/parse/${type}/${filename}`)
                        let kedaya = new yaya()
                        let echo = `执行命令: ${kedaya.title}\n执行脚本: ${filename}\n执行参数: ${split[1]}`
                        this.sendMessage(chatId, echo, '', 16666)
                        await kedaya.init(params)
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
}

module.exports = Main;
