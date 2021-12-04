const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东验证码获取"
        // this.cron = ["58 7,15,23 * * *"]
        this.import = ['fs', 'jdValidate']
        this.thread = -1
    }

    async prepare() {
        await this.modules.fs.writeFile(this.dirname + '/temp/jdvalidate.txt', '', (error) => {
            if (error) return console.log("文件初始化失败" + error.message);
            console.log("文件初始化成功");
        })
    }

    async main(id) {
        let validator = new this.modules.jdValidate();
        for (let i = 0; i<2; i++) {
            try {
                let veri = await validator.run();
                if (veri.validate) {
                    this.code.push(veri.validate)
                    this.modules.fs.appendFile(this.dirname + '/temp/jdvalidate.txt', veri.validate + "\n", (error) => {
                        if (error) return console.log("追加文件失败" + error.message);
                        console.log("验证码", veri.validate)
                    })
                }
            } catch (e) {
            }
        }
    }
}

module.exports = Main;
