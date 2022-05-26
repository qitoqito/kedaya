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
        let wrap = parseInt(this.profile.wrap || 233)
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
                let path = require('path');
                let rootPath = path.resolve(this.dirname, '../..');
                var file = `${rootPath}/config/${this.type}.ini`
                var ini = this.parseIni(file);
            }
        }
        if (file) {
            let pp = {...{env: {}}, ...this.parseIni(file)}
            if (this.dumps(this.params) != '{}') {
                let reg = new RegExp(this.keywords.map(d => `\\w+_\\w+_${d}`).join("|"))
                let type = ''
                if (this.params.add) {
                    type = 'expand'
                }
                else if (this.params.deldet) {
                    type = 'delete'
                }
                for (let i in this.params) {
                    if (i == 'add') {
                    }
                    else if (i == 'delete') {
                        let fn, kw
                        if (this.match(/\w+_\w+_\w+/, this.params[i])) {
                            [fn, kw] = this.match(/(\w+)_(\w+)$/, this.params[i])
                            delete pp[this.params[i]]
                            if (pp[fn]) {
                                delete pp[fn][kw]
                            }
                        }
                        else {
                            delete pp[this.params[i]]
                        }
                    }
                    else if (type == 'expand') {
                        if (this.match(reg, i)) {
                            let fn, kw
                            [fn, kw] = this.match(/(\w+)_(\w+)$/, i)
                            if (pp[fn]) {
                                if (pp[fn][kw]) {
                                    var a = (typeof pp[fn][kw] == 'object' ? pp[fn][kw] : pp[fn][kw].split("|"))
                                    var b = this.unique([...a, ...this.params[i].split("|")]).join("|")
                                }
                                else {
                                    b = this.params[i]
                                }
                                pp[fn][kw] = b
                            }
                            else {
                                if (pp[i]) {
                                    var a = (typeof pp[i] == 'object' ? pp[i] : pp[i].split("|"))
                                    var b = this.unique([...a, ...this.params[i].split("|")]).join("|")
                                }
                                else {
                                    var b = this.params[i]
                                }
                                pp[i] = b
                            }
                        }
                        else {
                            if (pp[i] && typeof pp[i] == 'object') {
                                console.log("错误录入")
                            }
                            else {
                                pp[i] = this.params[i]
                            }
                        }
                    }
                    else {
                        if (this.match(reg, i)) {
                            let fn, kw
                            [fn, kw] = this.match(/(\w+)_(\w+)$/, i)
                            if (pp[fn]) {
                                pp[fn][kw] = this.params[i]
                            }
                            else {
                                pp[i] = this.params[i]
                            }
                        }
                        else {
                            if (pp[i] && typeof pp[i] == 'object') {
                                console.log("错误录入")
                            }
                            else {
                                pp[i] = this.params[i]
                            }
                        }
                    }
                }
            }
            for (let i in pp) {
                if (typeof pp[i] == 'object') {
                    // 处理字典或数组
                    if (!Array.isArray(pp[i])) {
                        // 处理数据是字典
                        for (let k in pp) {
                            let keyword = this.match(new RegExp(`${i}_(\\w+)`), k)
                            if (keyword) {
                                // 处理存在filename和filename_expand,filename_custom
                                if (!pp[i][keyword]) {
                                    if (Array.isArray(pp[k])) {
                                        pp[i][keyword] = this.unique(pp[k]).join("|")
                                    }
                                    else {
                                        pp[i][keyword] = pp[k]
                                    }
                                }
                                delete pp[k]
                            }
                            else {
                                // filenema.expand去重处理
                                // filenema.custom去重处理
                                if (typeof pp[k] == 'object') {
                                    if (pp[k].expand && pp[k].expand.includes("|")) {
                                        pp[k].expand = this.unique(pp[k].expand.split("|")).join("|")
                                    }
                                    if (pp[k].custom && pp[k].custom.includes("|")) {
                                        pp[k].custom = this.unique(pp[k].custom.split("|")).join("|")
                                    }
                                }
                            }
                            // if (pp[k]['expand'] || pp[k]['custom']) {
                            //     if (pp[k].expand && pp[k].expand.length>12345 && pp[k].expand.includes("|")) {
                            //         let expand = pp[k].expand.split("|")
                            //         console.log(expand)
                            //         delete pp[k].expand
                            //         pp[`${k}_expand`] = expand
                            //     }
                            // }
                        }
                    }
                    else {
                        // 处理数据是数组的
                        let keyword = this.match(new RegExp(this.keywords.map(d => `\\w+_\\w+_${d}`).join('|')), i)
                        if (keyword) {
                            let d = 1
                            let fn, kw
                            [fn, kw] = this.match(/(\w+)_(\w+)$/, i)
                            if (!pp[fn]) {
                                pp[fn] = {}
                            }
                            else if (this.dumps(pp[fn]) == '[]') {
                                pp[fn] = {}
                            }
                            if (!pp[fn][kw]) {
                                // filename_expand去重处理
                                // filename_custom去重处理
                                if (['custom', 'expand'].includes(kw)) {
                                    if (typeof pp[i] == 'object') {
                                        if (Array.isArray(pp[i])) {
                                            pp[i] = this.unique(pp[i])
                                        }
                                        if (pp[i].join("|").length<wrap) {
                                            pp[fn][kw] = this.unique(pp[i]).join("|")
                                        }
                                        else {
                                            d = 0
                                        }
                                    }
                                    else {
                                        pp[fn][kw] = pp[i]
                                    }
                                }
                                else {
                                    pp[fn][kw] = pp[i]
                                }
                            }
                            if (d) {
                                delete pp[i]
                            }
                        }
                    }
                }
                else {
                    // 处理字符串
                    let keyword = this.match(new RegExp(this.keywords.map(d => `\\w+_\\w+_${d}`).join('|')), i)
                    if (keyword) {
                        let fn, kw
                        [fn, kw] = this.match(/(\w+)_(\w+)$/, i)
                        if (!pp[fn]) {
                            pp[fn] = {}
                        }
                        else if (this.dumps(pp[fn]) == '[]') {
                            pp[fn] = {}
                        }
                        if (!pp[fn][kw]) {
                            if (['custom', 'expand'].includes(kw)) {
                                pp[fn][kw] = pp[i]
                            }
                            else {
                                pp[fn][kw] = pp[i]
                            }
                        }
                        delete pp[i]
                    }
                }
            }
            for (let i in pp) {
                if (typeof pp[i] != 'object') {
                    pp.env[i] = pp[i]
                    delete pp[i]
                }
            }
            let content = []
            let dicts = {}
            for (let k of Object.keys(pp).sort()) {
                if (["{}", "[]"].includes(this.dumps(pp[k]))) {
                    continue
                }
                dicts[k] = pp[k]
                if (pp[k]['expand'] || pp[k]['custom']) {
                    // 如果id太长,超出wrap限制
                    // 将filename.custom转为filename_custom
                    // 将filename.expand转为filename_expand
                    if (pp[k].expand && pp[k].expand.length>wrap && pp[k].expand.includes("|")) {
                        let expand = this.unique(pp[k].expand.split("|"))
                        delete dicts[k].expand
                        dicts[`${k}_expand`] = expand
                    }
                    if (pp[k].custom && pp[k].custom.length>wrap && pp[k].custom.includes("|")) {
                        let custom = this.unique(pp[k].custom.split("|"))
                        delete dicts[k].custom
                        dicts[`${k}_custom`] = custom
                    }
                }
            }
            for (let i in dicts) {
                // console.log(dicts[i])
                if (i == 'iniCookie') {
                    for (let j in ini.iniCookie) {
                        content.push("", `[cookie_${j}]`, ...ini.iniCookie[j])
                    }
                }
                else {
                    content.push("", `[${i}]`)
                    if (Array.isArray(dicts[i])) {
                        for (let j of dicts[i]) {
                            content.push(j)
                        }
                    }
                    else {
                        for (let k in dicts[i]) {
                            if (!dicts[i][k]) {
                                content.push(`${k}=""`)
                            }
                            else if (typeof dicts[i][k] == "boolean") {
                                content.push(k)
                            }
                            else {
                                content.push(`${k}=${dicts[i][k]}`)
                            }
                        }
                    }
                }
            }
            // console.log(content)
            console.log(content.join("\n"))
            this.modules.fs.writeFile(file, content.join("\n"), function(err, data) {
                if (err) {
                    throw err;
                }
                console.log("ini写入成功")
            })
        }
    }
}

module.exports = Main;
