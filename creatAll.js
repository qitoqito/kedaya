let fs = require("fs")
let dirname = process.mainModule.path
let dir = fs.readdirSync(`${dirname}/parse`);
let dicts = {}
let prefix = process.env.QITOQITO_PREFIX || ''
dir.forEach(function(item, index) {
    let stat = fs.lstatSync(`${dirname}/parse/` + item)
    if (stat.isDirectory() === true) {
        dicts[item] = fs.readdirSync(`${dirname}/parse/${item}`)
    }
})
let pathFile = fs.readdirSync(dirname)
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
        fs.writeFile(`${dirname}/${filename}`, content, function(err, data) {
            if (err) {
                throw err;
            }
            console.log(`${filename}写入成功`)
        })
    }
}
