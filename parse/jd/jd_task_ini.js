const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东配置文件写入"
        // this.cron = "12 0,13 * * *"
        this.help = 2
        this.task = 'test'
        this.jump = 1
        this.import = ['fs']
    }

    async prepare() {
        delete this.params.filename
        delete this.params.custom
        try {
            var file = `${this.dirname}/config/${this.type}.ini`
            var ini = this.parseIni(file);
        } catch (e) {
            try {
                let path = require('path');
                let rootPath = path.resolve(this.dirname, '..');
                var file = `${rootPath}/config/${this.type}.ini`
                var ini = this.parseIni(file);
            } catch (ee) {
                let file = `${this.dirname}/config/${this.type}.ini`
                var ini = {}
            }
        }
        if (this.params.delete) {
            delete ini[this.params.delete]
            delete this.params.delete
        }
        else if (this.params.add) {
            delete this.params.add
            for (let j in this.params) {
                if (ini[j]) {
                    let data = typeof ini[j] == 'object' ? ini[j] : ini[j].includes('|') ? ini[j].split("|") : [ini[j]]
                    data.push(...this.params[j].split("|"))
                    ini[j] = this.unique(data)
                }
                else {
                    ini[j] = this.params[j]
                }
            }
        }
        else {
            ini = {...ini, ...this.params}
        }
        let env = [
            '[env]'
        ]
        let text = []
        let cookie = []
        for (let i in ini) {
            if (i == 'iniCookie') {
                for (let j in ini.iniCookie) {
                    cookie.push('', `[cookie_${j}]`, ...ini.iniCookie[j])
                }
            }
            else if (this.match(/\w+(custom|expand)$/, i)) {
                if (typeof ini[i] == 'object') {
                    if (ini[i].length == 1) {
                        env.push(`${i}=${ini[i][0]}`)
                    }
                    else {
                        text.push('', `[${i}]`, ...ini[i])
                    }
                }
                else {
                    if (ini[i].includes('|')) {
                        text.push('', `[${i}]`, ...ini[i].split("|"))
                    }
                    else {
                        env.push(`${i}=${ini[i]}`)
                    }
                }
            }
            else {
                env.push(`${i}=${ini[i]}`)
            }
        }
        let newData = [...cookie, ...env, ...text]
        console.log(newData.join("\n"))
        this.modules.fs.writeFile(file, newData.join("\n"), function(err, data) {
            if (err) {
                throw err;
            }
            console.log("ini写入成功")
        })
    }
}

module.exports = Main;
