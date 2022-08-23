const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东精选任务"
        this.cron = "3 0,14 * * *"
        this.import = ['jdUrl']
    }

    async prepare() {
    }

    async main(p) {
        let cookie = p.cookie
        let s = await this.curl(this.modules.jdUrl.app('pg_load_floor_data', {
                "v": "14.1",
                "floorToken": "1dc61f46-81c0-45a8-8a3c-57f42995958f"
            }, 'post', cookie)
        )
        if (this.haskey(s, 'data.floorData.pgTaskListVO.taskInfoList')) {
            for (let i of s.data.floorData.pgTaskListVO.taskInfoList) {
                if (i.taskStatus == 3) {
                    console.log(`任务已经完成: ${this.haskey(i, 'extAttribute.title')}`)
                }
                else {
                    console.log(`正在浏览: ${this.haskey(i, 'extAttribute.title')}`)
                    let a = await this.curl(this.modules.jdUrl.app('pg_interact_interface_invoke', {
                            "floorToken": "1dc61f46-81c0-45a8-8a3c-57f42995958f",
                            "dataSourceCode": "taskReceive",
                            "v": "14.1",
                            "argMap": {"taskEncId": i.taskEncId}
                        }, 'post', cookie)
                    )
                    let b = await this.curl(this.modules.jdUrl.app('pg_interact_interface_invoke', {
                            "floorToken": "1dc61f46-81c0-45a8-8a3c-57f42995958f",
                            "dataSourceCode": "taskFinish",
                            "v": "14.1",
                            "argMap": {"extParamsStr": {"browseTrxId": 5}, "taskEncId": i.taskEncId}
                        }, 'post', cookie)
                    )
                    let c = await this.curl(this.modules.jdUrl.app('pg_interact_interface_invoke', {
                            "floorToken": "1dc61f46-81c0-45a8-8a3c-57f42995958f",
                            "dataSourceCode": "taskReward",
                            "v": "14.1",
                            "argMap": {"taskEncId": i.taskEncId}
                        }, 'post', cookie)
                    )
                    if (this.haskey(c, 'data.beanInfo')) {
                        this.print(`获得: ${c.data.beanInfo.beanNum}京豆`, p.user)
                    }
                }
            }
        }
        else {
            console.log("没有获取到数据")
        }
    }
}

module.exports = Main;
