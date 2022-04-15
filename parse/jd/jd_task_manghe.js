const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东盲盒"
        this.cron = "50 6,17 * * *"
        this.task = 'local'
        // this.thread = 1
        this.verify = 1
        this.readme = `自定义盲盒: filename_custom='id1|id2'\n追加盲盒: filename_expand='id1|id2'`
    }

    async prepare() {
        this.code = [
            "https://anmp.jd.com/babelDiy/Zeus/3z12ngsd27UR1KfRqdMrMSSg3uxg/index.html"
        ]
        let custom = this.getValue('custom')
        let expand = this.getValue('expand')
        if (expand.length) {
            for (let i of expand) {
                this.code.unshift(i)
            }
        }
        if (custom.length) {
            this.code = []
            for (let i of custom) {
                this.code.push(i)
            }
        }
        let urls = []
        for (let i of this.code) {
            let url = i.substring(0, 4) == 'http' ? i : `https://anmp.jd.com/babelDiy/Zeus/${i}/index.html`
            if (!urls.includes(url)) {
                urls.push(url)
            }
        }
        if (urls.length) {
            this.shareCode.push(
                {
                    url: urls
                }
            )
        }
    }

    async main(p) {
        let cookie = p.cookie
        let gifts = []
        for (let url of p.inviter.url) {
            let h = await this.curl({
                    url,
                    cookie
                }
            )
            let r = this.match(/snsConfig\s*=\s*(.*)/, h)
            if (!r) {
                console.log(`没有获取到数据: ${url}`)
                continue
            }
            else {
                console.log(`获取数据中: ${url}`)
            }
            let l = this.loads(r)
            let activeId = l.activeId
            let actToken = l.actToken
            let prize = l.prize ? this.loads(l.prize) : []
            let q = await this.curl({
                    'url': `https://wq.jd.com/activet2/piggybank/query?activeid=${activeId}&token=${actToken}&sceneval=2&t=${this.timestamp}&shareid=&callback=queryV&_=1635772867936`,
                    cookie
                }
            )
            let complete = this.haskey(q, 'data.complete_task_list') || []
            let bless = this.haskey(q, 'data.bless')
            for (let i of this.haskey(l, 'config.tasks')) {
                if (complete.includes(i['_id'])) {
                    console.log(`${i['_id']} 已经运行过`)
                }
                else {
                    let a = await this.curl({
                            'url': `https://wq.jd.com/activet2/piggybank/completeTask?activeid=${activeId}&token=${actToken}&sceneval=2&t=${this.timestamp}&task_bless=10&taskid=${i._id}&callback=completeTaskU&_=${this.timestamp}`,
                            // 'form':``,
                            cookie
                        }
                    )
                    if (this.haskey(a, 'data.curbless')) {
                        bless = a.data.curbless
                        console.log(`${i['_id']}完成,幸运值: ${bless}`)
                    }
                    if (this.haskey(a, 'data.complete_task_list')) {
                        complete = a.data.complete_task_list
                    }
                }
            }
            console.log(`当前有幸运值: ${bless}`)
            for (let i = 0; i<bless / 30; i++) {
                let data = await this.curl({
                        'url': `https://wq.jd.com/activet2/piggybank/draw?activeid=${activeId}&token=${actToken}&sceneval=2&t=${this.timestamp}&callback=drawN&_=1635772883019`,
                        // 'form':``,
                        cookie
                    }
                )
                if (data.data && data.data.drawflag) {
                    if (prize.filter(val => val.prizeLevel == data.data.level).length) {
                        let name = prize.filter(val => val.prizeLevel == data.data.level)[0].prizename
                        console.log(`获得: ${name}`)
                        gifts.push(name)
                    }
                    else {
                        console.log(`什么也没有抽到`)
                    }
                }
            }
            if (gifts.length) {
                gifts.unshift("获得盲盒奖励")
                console.log(gifts)
                this.notices(gifts.join("\n"), p.user)
            }
        }
    }
}

module.exports = Main;
