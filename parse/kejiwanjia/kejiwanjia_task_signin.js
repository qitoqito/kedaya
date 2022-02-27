const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "科技玩家签到"
        // this.cron = "23 0,13 * * *"
        this.task = 'local'
    }

    async main(p) {
        let cookie = p.cookie;
        let dict = this.query(cookie.replace(/\&/g, ';'), ";", 1)
        let access = await this.curl({
                'url': `https://www.kejiwanjia.com/wp-json/jwt-auth/v1/token`,
                'json': {username: dict.username, password: dict.password}
            }
        )
        let token = access.token
        let authorization = `Bearer ${token}`
        let g = await this.curl({
                'url': `https://www.kejiwanjia.com/wp-json/b2/v1/getUserMission`,
                'form': `count=10&paged=1`,
                authorization
            }
        )
        let q = await this.curl({
                'url': `https://www.kejiwanjia.com/wp-json/b2/v1/userMission`,
                form: ``,
                authorization
            }
        )
        if (typeof q == 'string') {
            console.log(`今日已经签到,获得积分: ${q}`)
        }
        else {
            if (this.haskey(q, 'credit')) {
                console.log(`今日签到积分: ${q}`)
                this.notices(`今日已经签到,获得积分: ${q}`, p.user)
            }
            else {
                console.log('签到错误')
            }
        }
    }
}

module.exports = Main;
