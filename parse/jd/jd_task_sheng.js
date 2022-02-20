const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东省省卡签到红包"
        // this.cron = "3 0,14 * * *"
        this.task = 'local'
    }

    async main(p) {
        let cookie = p.cookie
        let currSignCursor = 1
        let s = await this.curl({
                'url': `https://api.m.jd.com/client.action?functionId=pg_channel_page_data&body={"paramData":{"clientType":1,"token":"95ae5468-fceb-4c17-adcb-acddb2e1403d"},"v":"2.6"}&uuid=&appid=packetSign&t=1645194105376&ext=&jsonp=jsonp_1645194105376_82371`,
                cookie
            }
        )
        for (let i of this.haskey(s, 'data.floorInfoList')) {
            if (i.floorData.signActInfo) {
                currSignCursor = parseInt(i.floorData.signActInfo.currSignCursor)
            }
        }
        let array = [
            'https://api.m.jd.com/client.action?functionId=pg_interact_interface_invoke&body=%7B%22argMap%22%3A%7B%22currSignCursor%22%3A1%7D%2C%22floorToken%22%3A%2277a6fb42-b6be-477b-b23a-8e111c7ee874%22%2C%22dataSourceCode%22%3A%22signIn%22%7D&uuid=ad69397293e185a1ce6665&client=apple&clientVersion=10.0.10&st=1645357468768&sv=121&sign=3784dfb7d2f94d7b12d9f99a30226efb',
            'https://api.m.jd.com/client.action?functionId=pg_interact_interface_invoke&body=%7B%22argMap%22%3A%7B%22currSignCursor%22%3A2%7D%2C%22floorToken%22%3A%2277a6fb42-b6be-477b-b23a-8e111c7ee874%22%2C%22dataSourceCode%22%3A%22signIn%22%7D&uuid=e2cb95fe37b38ec608459c&client=apple&clientVersion=10.0.10&st=1645357468770&sv=120&sign=6eccbd0f2351e0ba01cdd125efdff20a',
            'https://api.m.jd.com/client.action?functionId=pg_interact_interface_invoke&body=%7B%22argMap%22%3A%7B%22currSignCursor%22%3A3%7D%2C%22floorToken%22%3A%2277a6fb42-b6be-477b-b23a-8e111c7ee874%22%2C%22dataSourceCode%22%3A%22signIn%22%7D&uuid=c8d9a80a5d9400064e9967&client=apple&clientVersion=10.0.10&st=1645357468771&sv=100&sign=c1cf0406a77c3e634ffc7b1e11c2df40',
            'https://api.m.jd.com/client.action?functionId=pg_interact_interface_invoke&body=%7B%22argMap%22%3A%7B%22currSignCursor%22%3A4%7D%2C%22floorToken%22%3A%2277a6fb42-b6be-477b-b23a-8e111c7ee874%22%2C%22dataSourceCode%22%3A%22signIn%22%7D&uuid=88e2b217b7259b26e20cb5&client=apple&clientVersion=10.0.10&st=1645357468772&sv=111&sign=55f53c96ee19fdbca3ba55704ea2bd99',
            'https://api.m.jd.com/client.action?functionId=pg_interact_interface_invoke&body=%7B%22argMap%22%3A%7B%22currSignCursor%22%3A5%7D%2C%22floorToken%22%3A%2277a6fb42-b6be-477b-b23a-8e111c7ee874%22%2C%22dataSourceCode%22%3A%22signIn%22%7D&uuid=88e2b217b7259b26e20cb5&client=apple&clientVersion=10.0.10&st=1645357468773&sv=102&sign=19b01497a45cc22cb5873c52d32075b0',
            'https://api.m.jd.com/client.action?functionId=pg_interact_interface_invoke&body=%7B%22argMap%22%3A%7B%22currSignCursor%22%3A6%7D%2C%22floorToken%22%3A%2277a6fb42-b6be-477b-b23a-8e111c7ee874%22%2C%22dataSourceCode%22%3A%22signIn%22%7D&uuid=f35f5ed3bafee1c366c723&client=apple&clientVersion=10.0.10&st=1645357468774&sv=102&sign=f7c4e694a788d3edf182f198151e723d',
            'https://api.m.jd.com/client.action?functionId=pg_interact_interface_invoke&body=%7B%22argMap%22%3A%7B%22currSignCursor%22%3A7%7D%2C%22floorToken%22%3A%2277a6fb42-b6be-477b-b23a-8e111c7ee874%22%2C%22dataSourceCode%22%3A%22signIn%22%7D&uuid=99cf5991dc5765cb49905a&client=apple&clientVersion=10.0.10&st=1645357468775&sv=120&sign=7415e224d2d8b5210b977b618a8fa194'
        ]
        let ss = await this.curl({
                'url': array[currSignCursor - 1],
                cookie
            }
        )
        if (!ss.data) {
            console.log(p.user, ss.message)
        }
        else {
            try {
                let redpacket = 0
                for (let i of ss.data.rewardVos) {
                    if (this.haskey(i, 'hongBaoVo.discount')) {
                        redpacket += i.hongBaoVo.discount
                        console.log(p.user, `获得红包: ${i.hongBaoVo.discount}`)
                    }
                }
                if (redpacket) {
                    this.notices(`签到: ${currSignCursor}天, 获得红包: ${redpacket}元`, p.user)
                }
            } catch (e) {
            }
        }
    }
}

module.exports = Main;
