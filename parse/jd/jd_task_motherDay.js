const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东母亲节活动"
        this.cron = "33 2,21 * * *"
        this.task = 'local'
        this.header = {
            'App-Key': 'JVy4efS8',
            'Origin': 'https://xinruimz-dz.isvjcloud.com',
            'Referer': 'https://xinruimz-dz.isvjcloud.com/mother_day/logined_jd/',
        }
        this.turn = 3
    }

    async prepare() {
        // 短语来自度娘,凑合着用
        this.code = [
            '母亲节来到，愿母亲永远健康，一生幸福!',
            '母亲节到了，愿妈妈身体健康，青春永驻!',
            '祝愿妈妈健康长寿，笑颜常在脸上。',
            '母爱相伴走天涯，母亲节至祝福妈。',
            '妈妈，谢谢您，是您给了我生命。',
            '祝您健康乐观到百岁，母亲节快乐!',
            '母亲节，愿您健康快乐，笑口常开!',
            '愿妈妈健康长寿，生活开心幸福!',
            '母亲节到啦，祝亲爱的妈妈，节日快乐。',
            '祝愿母亲安康，快乐!笑口常开!',
            '母亲节，祝福送给你：愿你幸福安康!',
            '亲爱的母亲，你才是我最大的安全感。',
            '妈妈，相信我，女儿自有女儿的报答。',
            '妈妈，我永远爱您!祝您健康快乐!',
            '母亲节将至，儿女知感恩，请您多保重!',
        ]
    }

    async main(p) {
        let cookie = p.cookie;
        if (this.turnCount == 0) {
            let authorization = await this.access(p)
            let info = await this.curl({
                    'url': `https://xinruimz-dz.isvjcloud.com/mother-day-api/get_user_info?source=share`,
                    authorization,
                }
            )
            let openid = info.openid
            this.dict[p.user] = {
                authorization, openid,
            }
            let state = await this.curl({
                    'url': `https://xinruimz-dz.isvjcloud.com/mother-day-api/state`,
                    authorization,
                }
            )
            console.log(state)
            if (!state.sign_in) {
                let signin = await this.curl({
                        'url': `https://xinruimz-dz.isvjcloud.com/mother-day-api/sign`,
                        authorization,
                        form: ''
                    }
                )
                if (this.haskey(signin, 'add_coins')) {
                    console.log(`签到成功,抽奖次数+${signin.add_coins}`)
                }
            }
            if (!state.story) {
                let text = this.random(this.code, 1)[0]
                let content = await this.curl({
                        'url': `https://xinruimz-dz.isvjcloud.com/mother-day-api/upload_content`,
                        authorization,
                        json: {
                            "image": [],
                            text
                        }
                    }
                )
                if (this.haskey(content, 'add_coins')) {
                    console.log(`发布内容成功,抽奖次数+${content.add_coins}`)
                }
            }
            if (state.view_story != 3) {
                let ids =
                    [
                        2826, 2846, 2608, 3091, 2579, 2576, 2614, 2870, 3096, 2833,
                    ]
                for (let id of this.random(ids, 3)) {
                    console.log(`正在浏览内容: ${id}`)
                    let detail = await this.curl({
                            'url': `https://xinruimz-dz.isvjcloud.com/mother-day-api/get_content_detail?id=${id}`,
                            authorization,
                        }
                    )
                    if (this.haskey(detail, 'add_coins')) {
                        console.log(`浏览内容成功,抽奖次数+${detail.add_coins}`)
                        break
                    }
                }
            }
            let task = await this.curl({
                    'url': `https://xinruimz-dz.isvjcloud.com/mother-day-api/task_info`,
                    authorization,
                }
            )
            let dict = {
                view_meetingplaces: {
                    path: "view_meeting",
                    num: 4,
                    index: 'meetingplaces',
                },
                view_shop: {
                    path: "view_shop",
                    num: 4,
                    index: 'shops',
                },
                view_product: {
                    path: "view_product",
                    num: 8,
                    index: 'products',
                }
            }
            for (let d in dict) {
                let data = dict[d]
                if (state[d].length<data.num) {
                    for (let i of task[data.index]) {
                        console.log(`正在浏览:`, i.name)
                        let s = await this.curl({
                                'url': `https://xinruimz-dz.isvjcloud.com/mother-day-api/${data.path}`,
                                'json': {id: i.id},
                                authorization,
                            }
                        )
                        if (this.haskey(s, 'add_coins')) {
                            console.log(`抽奖次数+${s.add_coins}`)
                            break
                        }
                    }
                }
            }
            if (state.invite.length == 5) {
                this.dict[p.user].complete = 1
            }
        }
        else if (this.turnCount == 1) {
            let authorization = this.dict[p.user].authorization
            if (!authorization) {
                authorization = await this.access(p)
            }
            for (let i in this.dict) {
                try {
                    let data = this.dict[i]
                    if (i == p.user) {
                        console.log(i, `不能给自己助力`)
                    }
                    else if (data.complete) {
                        console.log(i, "该助力已经完成了")
                    }
                    else {
                        let invite = await this.curl({
                                'url': `https://xinruimz-dz.isvjcloud.com/mother-day-api/invite`,
                                json: {
                                    "inviter_openid": this.dict[i].openid,
                                    "channel": 2,
                                    "source": "share"
                                },
                                authorization,
                            }
                        )
                        console.log(i, invite)
                        if (this.haskey(invite, 'message', '好友今日被助力次数已达上限')) {
                            data.complete = 1
                        }
                        else if (this.haskey(invite, 'message', '您今日助力次数已达上限')) {
                            console.log('您今日助力次数已达上限')
                            break
                        }
                    }
                } catch (e) {
                }
            }
        }
        else {
            let authorization = this.dict[p.user].authorization
            if (!authorization) {
                authorization = await this.access(p)
            }
            let gifts = []
            for (let j = 0; j<2; j++) {
                for (let i = 0; i<50; i++) {
                    let draw = await this.curl({
                            'url': `https://xinruimz-dz.isvjcloud.com/mother-day-api/draw_prize`,
                            authorization,
                            form: ''
                        }
                    )
                    if (this.haskey(draw, 'draw_result.prize')) {
                        console.log(draw.draw_result.prize.name)
                        gifts.push(draw.draw_result.prize.name)
                    }
                    else {
                        console.log(`什么也没有抽到`)
                    }
                    if (!draw.coins) {
                        break
                    }
                    await this.wait(200)
                }
            }
            console.log(gifts)
            if (gifts.length>0) {
                this.notices(gifts.join('\n'), p.user)
            }
        }
    }

    async access(p) {
        let cookie = p.cookie
        let isvObfuscator = await this.curl({
            url: 'https://api.m.jd.com/client.action',
            form: 'functionId=isvObfuscator&body=%7B%22id%22%3A%22%22%2C%22url%22%3A%22https%3A%2F%2Fddsj-dz.isvjcloud.com%22%7D&uuid=5162ca82aed35fc52e8&client=apple&clientVersion=10.0.10&st=1631884203742&sv=112&sign=fd40dc1c65d20881d92afe96c4aec3d0',
            cookie: p.cookie,
            headers: {
                'user-agent': 'JD4iPhone/168074%20(iPhone;%20iOS;%20Scale/3.00)',
                'referer': '',
            }
        })
        let info = await this.curl({
            'url': 'https://xinruimz-dz.isvjcloud.com/auth/jos',
            'form': `token=${isvObfuscator.token}&jd_source=01&source=`,
        })
        this.assert(this.haskey(info, 'body.access_token'), 'token获取失败')
        return `Bearer ${info.body.access_token}`
    }
}

module.exports = Main;
