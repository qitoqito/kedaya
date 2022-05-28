let fs = require("fs")
const path = require("path")
let dirname = process.mainModule.path
let dir = fs.readdirSync(`${dirname}/parse`);
let dicts = {}
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
        } catch (e3) {}
    }
}
if (env) {
    for (let i in env) {
        if (i.includes('QITOQITO')) {
            console.log(i, ":", env[i])
        } else if (i == 'env') {
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
var map = env.QITOQITO_MAP || process.env.QITOQITO_MAP || ''
dir.forEach(function(item, index) {
    let stat = fs.lstatSync(`${dirname}/parse/` + item)
    if (stat.isDirectory() === true) {
        dicts[item] = fs.readdirSync(`${dirname}/parse/${item}`)
    }
})
let pathFile = fs.readdirSync(dirname)
let change = {}
if (map) {
    if (typeof map == 'object') {
        for (let i in map) {
            change[i] = {
                map: map[i],
                type: map[i].split("_")[0]
            }
        }
    } else {
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
dicts['extra'] = Object.keys(change)
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

`
for (let i in dicts) {
    for (let j of dicts[i]) {
        let filename = `${prefix}${j}`
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
        } else {
            fs.writeFile(`${dirname}/${filename}`, content, function(err, data) {
                if (err) {
                    throw err;
                }
                console.log(`🐯‍❄️ 写入成功: ${filename} 写入目录成功`)
            })
        }
    }
}
