const fs = require("fs")
const request = require("request")
const path = require("path")
console.log(`

请先设置环境变量,支持变量QITOQITO相关变量放在jd.ini

QITOQITO_PLATFORM=按照所使用面板正确填写 qinglong|jtask|jd 其中一个

QITOQITO_SYNC=1 当有此变量时,本地脚本的定时任务跟随仓库同步启用

QITOQITO_DISABLE=1 当有此变量时,本地脚本的定时任务跟随仓库同步禁用

QITOQITO_COVER=1 当有此变量时候,qitoCreat会强制覆盖之前生成的入口文件
        `)
!(async () => {
    var env = {}
    try {
        var parseIni = require("./util/parseIni")
        var file = `${__dirname}/config/jd.ini`
        env = parseIni.parse(file)
    } catch (e1) {
        try {
            let rootPath = path.resolve(__dirname, '..');
            var file = `${rootPath}/config/jd.ini`
            env = parseIni.parse(file)
        } catch (e2) {
            try {
                let rootPath = path.resolve(__dirname, '../..');
                var file = `${rootPath}/config/jd.ini`
                env = parseIni.parse(file)
            } catch (e3) {
            }
        }
    }
    if (env) {
        for (let i in env) {
            if (i.includes('QITOQITO')) {
                console.log(i, ":", env[i])
            }
            else if (i == 'env') {
                for (let j in env.env) {
                    if (j.includes('QITOQITO')) {
                        console.log(j, ":", env.env[j])
                        env[j] = env.env[j]
                    }
                }
            }
        }
    }
    var prefix = env.QITOQITO_PREFIX || process.env.QITOQITO_PREFIX || ''
    var command = env.QITOQITO_PLATFORM || process.env.QITOQITO_PLATFORM || 'qinglong'
    var sync = env.QITOQITO_SYNC || process.env.QITOQITO_SYNC
    var disable = env.QITOQITO_DISABLE || process.env.QITOQITO_DISABLE
    var label = env.QITOQITO_LABEL || process.env.QITOQITO_LABEL || 'kedaya_'
    var map = env.QITOQITO_MAP || process.env.QITOQITO_MAP || ''
    var cover = env.QITOQITO_COVER || process.env.QITOQITO_COVER || ''
    if (!command) {
        return
    }
    let change = {}
    if (map) {
        if (typeof map=='object') {
            for (let i in map){
                change[i]={
                    map:map[i],
                    type:map[i].split("_")[0]
                }
            }
        }else{
            for (let k of map.replace(/\&/g, "\|").split("|")) {
            let a = k.split("=")
            for (let i of a[0].split(',')) {
                change[i] = {
                    map: a[1],
                    type: a[1].split("_")[0]
                }
            }
        }
        }

        console.log(change)
    }
    let content = `
!(async () => {
        let prefix = process.env.QITOQITO_PREFIX ||''
        let filename = process.mainModule.filename.replace(prefix,'').match(/(\\w+)\\.js/)[1]
        let dirname = process.mainModule.path
        let type = filename.split('_')[0]
        if (['js', 'jx', 'jr', 'jw'].includes(type)) {
            type = 'jd'
        }
        let qitoqito = require(\`\${dirname}/parse/\${type}/\${filename}\`)
        let kedaya = new qitoqito()
        await kedaya.init({})
    }
)().catch((e) => {
    console.log(e.message)
})
`;
    let dicts = {};
    let dirname = process.mainModule.path
    let pathFile = fs.readdirSync(dirname);
    let common
    try {
        common = require(`${dirname}/util/common`)
    } catch (e) {
    }
    let msg = []
    let dir = fs.readdirSync(`${dirname}/parse`);
    dir.forEach(function(item, index) {
        let stat = fs.lstatSync(`${dirname}/parse/` + item)
        if (stat.isDirectory() === true) {
            dicts[item] = fs.readdirSync(`${dirname}/parse/${item}`)
        }
    })
    dicts['extra'] = Object.keys(change)
    console.log(`🦊 如需强制覆盖,请设置QITOQITO_COVER\n`)
    let message = []
    for (let i in dicts) {
        console.log("🐹  正在生成入口文件")
        for (let j of dicts[i]) {
            let filename = `${prefix}${j}`
            if (pathFile.includes(filename) && !cover) {
                // console.log(`🐹 跳过写入: ${filename} 已经在目录了`)
            }
            else {
                if (i == 'extra') {
                    let exc = `
!(async () => {
        let prefix = process.env.QITOQITO_PREFIX ||''
        let filename = process.mainModule.filename.replace(prefix,'').match(/(\\w+)\\.js/)[1]
        let dirname = process.mainModule.path
        let type = filename.split('_')[0]
        if (['js', 'jx', 'jr', 'jw'].includes(type)) {
            type = 'jd'
        }
        let qitoqito = require(\`\${dirname}/parse/${change[j].type}/${change[j].map}\`)
        let kedaya = new qitoqito()
        await kedaya.init({"filename":"${j}"})
    }
)().catch((e) => {
    console.log(e.message)
})
`;
                    fs.writeFile(`${dirname}/${filename}.js`, exc, function(err, data) {
                        if (err) {
                            throw err;
                        }
                        console.log(`🐯‍❄️ 写入成功: ${filename}.js 写入目录成功`)
                    })
                }
                else {
                    fs.writeFile(`${dirname}/${filename}`, content, function(err, data) {
                        if (err) {
                            throw err;
                        }
                        console.log(`🐯‍❄️ 写入成功: ${filename} 写入目录成功`)
                    })
                }
            }
        }
    }
    console.log(`\n🦊 正在处理定时任务\n`)
    await new Promise(e => setTimeout(e, 3000))
    if (command == 'qinglong') {
        command = 'http://127.0.0.1:5700'
    }
    if (command.includes('http')) {
        try{
            var json = fs.readFileSync('../config/auth.json', "utf-8");
        }catch(ea){
            var json = fs.readFileSync('../../config/auth.json', "utf-8");
        }
        let auth = JSON.parse(json)
        let authorization = `Bearer ${auth.token}`
        let url = command;
        let cron = await curl({
            url: `${url}/api/crons?searchValue=&t=1638982538292`,
            authorization,
            'headers': {
                'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
            }
        })
        if (cron.code == 401) {
            let login = await curl({
                'url': `${url}/api/user/login?t=1639363615601`,
                json: {
                    "username": auth.username,
                    "password": auth.password
                },
            })
            if (login.code == 200) {
                let token = login.data.token
                authorization = `Bearer ${login.data.token}`
                cron = await curl({
                    url: `${url}/api/crons?searchValue=&t=1638982538292`,
                    authorization,
                    'headers': {
                        'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                    }
                })
            }
        }
        if (cron.data) {
            let crontab = column(cron.data, 'command')
            for (let i in dicts) {
                for (let j of dicts[i]) {
                    if (j.includes('.js')) {
                        try {
                            let filename = `${prefix}${j}`
                            let type = j.split('_')[0]
                            if (['js', 'jx', 'jr', 'jw'].includes(type)) {
                                type = 'jd'
                            }
                            let main = require(`${dirname}/parse/${type}/${j}`)
                            let kedaya = new main()
                            if (crontab.includes(`task ${filename}`)) {
                                if (!kedaya.cron) {
                                    if (!kedaya.manual) {
                                        for (let z of cron.data) {
                                            try {
                                                if (z.name.includes(label) && z.command.includes(`task ${filename}`)) {
                                                    if (z.isDisabled) {
                                                        message.push(`🦊 禁用失败: ${filename} 已经是禁用的`)
                                                    }
                                                    else {
                                                        if (disable) {
                                                            let disable = await curl({
                                                                'url': `${url}/api/crons/disable?t=1639371766925`,
                                                                json: [z._id || z.id],
                                                                authorization,
                                                                'headers': {
                                                                    'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                                                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                                                                },
                                                                method: 'put'
                                                            })
                                                            msg.push(`🐼 禁用成功: ${filename}`)
                                                            message.push(`🐼 禁用成功: ${filename} 已经成功禁用`)
                                                        }
                                                        else {
                                                            message.push(`🦊 禁用失败: ${filename} 禁用脚本失败`)
                                                        }
                                                        break
                                                    }
                                                }
                                            } catch (eee) {
                                            }
                                        }
                                    }
                                    else {
                                        message.push(`🐹 跳过操作: ${filename} 操作脚本失败,请手动运行该脚本`)
                                    }
                                }
                                else {
                                    for (let z of cron.data) {
                                        try {
                                            if (z.name.includes(label) && z.command.includes(`task ${filename}`)) {
                                                if (z.isDisabled) {
                                                    if (sync) {
                                                        let disable = await curl({
                                                            'url': `${url}/api/crons/enable?t=1639371766925`,
                                                            json: [z._id || z.id],
                                                            authorization,
                                                            'headers': {
                                                                'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                                                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                                                            },
                                                            method: 'put'
                                                        })
                                                        msg.push(`🐽 开启成功: ${filename}`)
                                                        message.push(`🐽 开启成功: ${filename} 启用脚本成功`)
                                                    }
                                                    else {
                                                        message.push(`🐽 开启失败: ${filename} 启用脚本失败`)
                                                    }
                                                }
                                                break
                                            }
                                        } catch (eee) {
                                            console.log(eee)
                                        }
                                    }
                                    message.push(`🐶 导入失败: ${filename} 已经添加过了`)
                                }
                            }
                            else {
                                if (kedaya.cron) {
                                    let crons = typeof (kedaya.cron) == 'object' ? kedaya.cron : [kedaya.cron]
                                    for (let c of crons) {
                                        msg.push(`🦁 导入成功: ${filename}`)
                                        message.push(`🦁 导入成功: ${filename} 加入定时成功`)
                                        let add = await curl({
                                            'url': `${url}/api/crons?t=1638983187740`,
                                            json: {
                                                "command": `task ${filename}`,
                                                "name": `${label}${kedaya.title}`,
                                                "schedule": c
                                            },
                                            authorization,
                                            'headers': {
                                                'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                                            }
                                        })
                                    }
                                }
                                else {
                                    message.push(`🐯 导入跳过: ${filename} 如需运行请手动添加定时`)
                                }
                            }
                        } catch (ee) {
                            console.log(ee)
                        }
                    }
                }
            }
        }
        else {
            console.log("🐶 账号未登录")
        }
    }
    else {
        try{
            var crontab = fs.readFileSync('../config/crontab.list', "utf-8");
            var file='../config/crontab.list'
        }catch(eb){
            var crontab = fs.readFileSync('../../config/crontab.list', "utf-8");
            var file='../../config/crontab.list'
        }

        let add = []
        let del = []
        var spl = crontab.split("\n");
        let cronDict = {}
        for (let i in dicts) {
            for (let j of dicts[i]) {
                try {
                    let script = `${prefix}${j.replace('.js', '')}`
                    let main = require(`${dirname}/parse/${i}/${j}`)
                    let kedaya = new main()
                    if (kedaya.cron) {
                        add.push(script)
                    }
                    else {
                        del.push(script)
                    }
                    cronDict[script] = {
                        cron: kedaya.cron,
                        title: kedaya.title,
                        manual: kedaya.manual
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }
        for (let i in cronDict) {
            let yaya = cronDict[i]
            if (yaya.cron) {
                if (match(new RegExp(`(${command}\\s*${i})`), crontab)) {
                    for (let j in spl) {
                        if (match(new RegExp(`(${command}\\s*${i})`), spl[j])) {
                            if (spl[j][0] == '#') {
                                if (sync) {
                                    spl[j] = spl[j].replace('#', '')
                                    msg.push(`🐽 开启成功: ${i}`)
                                    message.push(`🐽 开启成功: ${i} 启用脚本成功`)
                                }
                                else {
                                    spl[j] = spl[j]
                                    message.push(`🐽 开启失败: ${i} 启用脚本失败`)
                                }
                            }
                        }
                    }
                    message.push(`🐶 导入失败: ${i} 已经添加过了`)
                }
                else {
                    let crons = typeof (yaya.cron) == 'object' ? yaya.cron : [yaya.cron]
                    for (let j of crons) {
                        let b = (command == 'jtask') ? command : `bash ${command}`
                        let c = `${j} ${b} ${i}`
                        let a = (`${c}${new Array(64 - c.length).join(' ')}#${label}${yaya.title}`)
                        spl.push(a)
                        msg.push(`🦁 导入成功: ${i}`)
                        message.push(`🦁 导入成功: ${i} 加入定时成功`)
                    }
                }
            }
            else {
                if (!yaya.manual) {
                    for (let j in spl) {
                        if (match(new RegExp(`(${command}\\s*${i})\\s*#${label}`), spl[j])) {
                            // spl[j] = ''
                            if (spl[j][0] == '#') {
                                message.push(`🦊 禁用失败: ${i} 已经是禁用的`)
                            }
                            else {
                                if (disable) {
                                    spl[j] = `#${spl[j]}`
                                    msg.push(`🐼 禁用成功: ${i}`)
                                    message.push(`🐼 禁用成功: ${i} 已经成功禁用`)
                                }
                                else {
                                    message.push(`🦊 禁用失败: ${i} 禁用脚本失败`)
                                }
                            }
                        }
                    }
                    if (!crontab.includes(i)) {
                        message.push(`🐯 导入跳过: ${i} 如需运行请手动添加定时`)
                    }
                }
                else {
                    message.push(`🐹 跳过操作: ${i} 操作脚本失败,请手动运行该脚本`)
                }
            }
        }
        spl = spl.filter(d => d)
        fs.writeFileSync(file, spl.filter(d => d).push("").join("\n"))
    }
    console.log(message.sort().join("\n"))
    if (command && msg.length) {
        console.log(msg)
        let c = new common()
        for (let i in process.env) {
            c[i] = process.env[i]
        }
        c.title = `QITOQITO 任务变更`
        for (let i of msg) {
            c.notices(i)
        }
        await c.notify()
    }
})().catch((e) => {
    console.log(e)
})

function match(pattern, string) {
    pattern = (pattern instanceof Array) ? pattern : [pattern];
    for (let pat of pattern) {
        var match = pat.exec(string)
        if (match) {
            var len = match.length;
            if (len == 1) {
                return match;
            }
            else if (len == 2) {
                return match[1];
            }
            else {
                var r = [];
                for (let i = 1; i<len; i++) {
                    r.push(match[i])
                }
                return r;
            }
            break;
        }
    }
    return '';
}

function curl(params) {
    if (typeof (params) != 'object') {
        params = {
            'url': params
        }
    }
    let method = params.method || ''
    if (params.hasOwnProperty('authorization')) {
        params.headers.authorization = params.authorization
    }
    if (params.hasOwnProperty('form')) {
        params.method = 'POST'
    }
    if (params.hasOwnProperty('json')) {
        params.method = 'POST'
    }
    if (params.hasOwnProperty('body')) {
        if (typeof (params.body) == 'object') {
            params.body = JSON.stringify(params.body)
        }
        params.method = 'POST'
    }
    if (method) {
        params.method = method.toUpperCase()
    }
    return new Promise(resolve => {
        request(params, async (err, resp, data) => {
            try {
                data = JSON.parse(data)
            } catch (e) {
                // console.log(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function column(lists, value, key) {
    key = typeof key !== 'undefined' ? key : '';
    if (lists instanceof Array) {
        var temp = lists;
    }
    else {
        var temp = [];
        for (var i in lists) {
            temp.push(lists[i])
        }
    }
    if (key) {
        var data = {};
        for (var v of temp) {
            if (v[key]) {
                if (value && v.hasOwnProperty(value)) {
                    data[v[key]] = v[value]
                }
                else {
                    data[v[key]] = v
                }
            }
        }
        return data;
    }
    else {
        var data = [];
        for (var i of temp) {
            if (i[value]) {
                data.push(i[value])
            }
        }
        return data;
    }
}
