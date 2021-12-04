let filename;
let params = {}
let length = process.argv.length
if (length>2) {
    filename = process.argv[2].split('.')[0]
    if (length>3) {
        for (let i = 3; i<length; i++) {
            let key = process.argv[i].match(/^-\w+$/)
            if (key) {
                params[key[0].substr(1)] = process.argv[i + 1]
            }
        }
    }
}
else {
    filename = 'jd_task_test'
}
let dirname = path = process.mainModule.path
let type = filename.split('_')[0]
switch (type) {
    case "js":
    case "jx":
    case "jr":
    case 'jw':
        type = 'jd'
        break
}
!(async () => {
        let main = require(`${dirname}/parse/${type}/${filename}`)
        let a = new main()
        await a.init(params)
    }
)().catch((e) => {
    console.log(e.message)
}).finally(() => {
});
