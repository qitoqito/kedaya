const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东抽京豆"
        // this.cron = "50 0,13 * * *"
        this.task = 'local'
    }

    async main(p) {
        let cookie = p.cookie;
        let s = await this.curl({
                url: 'https://api.m.jd.com/client.action',
                form: 'functionId=babelGetLottery&body=%7B%22authType%22%3A%222%22%2C%22enAwardK%22%3A%22ltvTJ%2FWYFPZcuWIWHCAjR7DoXZpRQqQOdWaXG5FzSG4kmc5JPMT5JcYfG1BjIXSwG8gLnspAJLUu%5CnCrrKTE6JOw42Fn998W5DLgq6ykxOiTsuzhkfo9ETrolylhHJUDzk3CgtFRkgvjwEkgyVMwbzej%2BG%5CnTG5ptdaite8cEq7Jxtcu%2Bkwm15WkyicToEyS%2FPVZI2GoMSvYfq%2B4tMsnnkKGTgykmQsJkE%2Fvu7UO%5Cncj56bpuYOeWewI7KO93u73iZzWUs%2FyNWR16kSJiEHxA9PloMwZ2WuEqSHfiqGf6MuJxQmMIL9MHS%5Cnjbs%2BQhEKOhJAQs2PaHvanKkkE8TU7ESujM2a18EuQglPvG631lmsI%2FE7VHO0O1bPsTPtW5l2et5A%5CneQ0y_babel%22%2C%22awardSource%22%3A%221%22%2C%22encryptProjectId%22%3A%223u4fVy1c75fAdDN6XRYDzAbkXz1E%22%2C%22riskParam%22%3A%7B%22eid%22%3A%22GF7INGZOD5C6KGLBABZQG2FHIUYPOZEBGOQQQBKPQBOVJWOB6UIUICMDAXPYIVPSXAC676GCGUD2TZ4KNBK7ZR7XI635MXNAUMKC3NBUZVEGLNDEW42Q%22%2C%22shshshfpb%22%3A%22JD0111d47dznTjV7Huwp164490137988702gJW0Ni0IAL0_poZAanl72v-B9XLq-ZkKqYhTqJlJanIixw5oOjnIU61JTgGfXKp_D1y9-Hhb9UZTu9ll_-WA6LYhuVHWUODrS-1NNBYAt-A1239c91~rPFnj7a2c3%2F9Yab8ShRgu3115gce5XN91%2BWXi%2BLnK9GpbX%2Frd0%2BJsm4lVqXtWTkrpIaBgXyBjKWnPTUV2vR6ufA%3D%3D%22%2C%22pageClickKey%22%3A%22Babel_WheelSurf%22%2C%22childActivityUrl%22%3A%22https%3A%2F%2Fpro.m.jd.com%2Fmall%2Factive%2F2xoBJwC5D1Q3okksMUFHcJQhFq8j%2Findex.html%22%7D%2C%22encryptAssignmentId%22%3A%222x5WEhFsDhmf8JohWQJFYfURTh9w%22%2C%22srv%22%3A%22%7B%5C%22bord%5C%22%3A%5C%220%5C%22%2C%5C%22fno%5C%22%3A%5C%220-0-2%5C%22%2C%5C%22mid%5C%22%3A%5C%2270952802%5C%22%2C%5C%22bi2%5C%22%3A%5C%222%5C%22%2C%5C%22bid%5C%22%3A%5C%220%5C%22%2C%5C%22aid%5C%22%3A%5C%2201155413%5C%22%7D%22%2C%22lotteryCode%22%3A%22336014%22%7D&uuid=bdceb3c7561cc2266371e46b7&client=apple&clientVersion=10.0.10&st=1644901941165&sv=121&sign=7c94b8ec03a3bfdd06e81c0871853083',
                cookie
            }
        )
        console.log(s.promptMsg)
        if (s.prizeName) {
            this.notices(`抽京豆获得: ${s.prizeName}`, p.user)
        }
    }
}

module.exports = Main;
