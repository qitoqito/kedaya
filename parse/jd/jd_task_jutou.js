const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东惊喜红包"
        this.cron = "6 6 6 6 6"
        this.task = 'local'
        this.interval = 2000
        this.import = ['jdAlgo']
        this.readme = "一次性脚本"
    }

    async prepare() {
        this.algo = new this.modules.jdAlgo({
            version: "latest",
            type: "main",
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.algo.curl({
                'url': `https://api.m.jd.com/`,
                'form': `functionId=jutouDisplayIndex&appid=pages-factory&body={"channelId":"12498","lid":"MoIOQdTTwYxNCANy+PtpgKuTTLLFbZZT","popupContentKey":"","adSkuId":"","ext":{"babelActivityId":"01713230"}}&client=wh5&loginWQBiz=618aa&loginType=2`,
                cookie,
                algo: {
                    appId: '35fa0'
                }
            }
        )
        let n = 0
        for (let i of this.haskey(s, 'data.componentDisplayList')) {
            for (let j of i.materialInfo) {
                if (this.haskey(j, 'materialDetail.discount')) {
                    n++
                    if (j.materialType == 6) {
                        this.print(`红包: ${j.materialDetail.discount}`, p.user)
                    }
                    else if (j.materialType == 2) {
                        console.log("优惠券:", j.materialDetail.discount)
                    }
                    else {
                        console.log(j.materialDetail)
                    }
                }
                else {
                    console.log(j.materialDetail)
                }
            }
        }
        if (!n) {
            console.log("本次执行没有获得红包")
        }
        await this.wait(100)
    }
}

module.exports = Main;
