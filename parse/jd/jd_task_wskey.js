const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东WSKEY转换"
        // this.cron = "20,50 * * * *"
        this.task = 'local'
        this.import = ['jdUrl', 'fs']
        this.readme = "使用前需先在config/jdUser配置用户wskey,以及将verify字段设置为1或2,脚本才能正常转换cookie,当verify设置为2时,即使当前cookie没有过期,也会强制转换更新\n慎重使用wskey相关脚本,此脚本没有用到外部服务器计算genToken"
    }

    async prepare() {
        this.code = [
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000255654%22%2C%22action%22%3A%22to%22%7D&uuid=19962584e3b870f3ac51855b&client=apple&clientVersion=10.0.10&st=1647526498823&sv=102&sign=461118eaf6dc8cf55af9e02d74d3a51c',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000310453%22%2C%22action%22%3A%22to%22%7D&uuid=de2b3126b513c9a200f4037f&client=apple&clientVersion=10.0.10&st=1647526498825&sv=111&sign=2ab857389e232e4f8efdc72d168f6eba',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000277030%22%2C%22action%22%3A%22to%22%7D&uuid=70593f41b3201d424bae7c83&client=apple&clientVersion=10.0.10&st=1647526498826&sv=112&sign=c9436e9661634dbb7ed793d323410d70',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000297401%22%2C%22action%22%3A%22to%22%7D&uuid=daf223df3d35a8f3c5193d86&client=apple&clientVersion=10.0.10&st=1647526498827&sv=111&sign=4e32309674b214c6976aef8c954fedea',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000328234%22%2C%22action%22%3A%22to%22%7D&uuid=51605e8ca9c878c5f94f1486&client=apple&clientVersion=10.0.10&st=1647526498828&sv=112&sign=2c4c63564146a67a05e7019cb402327b',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000269032%22%2C%22action%22%3A%22to%22%7D&uuid=f1863574e7c6148779d3be0d&client=apple&clientVersion=10.0.10&st=1647526498829&sv=112&sign=e3957e50ec2bf2133a72a824bd7a7f53',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000339079%22%2C%22action%22%3A%22to%22%7D&uuid=fd78236e5dd4dbefbd1cffba&client=apple&clientVersion=10.0.10&st=1647526498830&sv=120&sign=d7f3d74992874da7644c4af3fe819e32',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000291450%22%2C%22action%22%3A%22to%22%7D&uuid=bf95c0ea5d5c8d7cb56be82b&client=apple&clientVersion=10.0.10&st=1647526498831&sv=111&sign=d6ece3b45aaa5aa33290cc9cf5771150',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000258366%22%2C%22action%22%3A%22to%22%7D&uuid=bf95c0ea5d5c8d7cb56be82b&client=apple&clientVersion=10.0.10&st=1647526498831&sv=120&sign=11ba6263d75b44e3f1864e73f4a5af44',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000313634%22%2C%22action%22%3A%22to%22%7D&uuid=35192329a5d452545b993f4c&client=apple&clientVersion=10.0.10&st=1647526498832&sv=112&sign=306df7870adffb317c117a1aaf8857b6',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000330782%22%2C%22action%22%3A%22to%22%7D&uuid=5ba3e7034e66db1bdabccc59&client=apple&clientVersion=10.0.10&st=1647526498833&sv=121&sign=6676fde4a15e21a27f50aa6102916806',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000256006%22%2C%22action%22%3A%22to%22%7D&uuid=5a3645243f56b8c94a19924c&client=apple&clientVersion=10.0.10&st=1647526498836&sv=120&sign=d92d25a92a3a03ec8e6e643322b5f922',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000304202%22%2C%22action%22%3A%22to%22%7D&uuid=71fb3b62c8baebff4da6a909&client=apple&clientVersion=10.0.10&st=1647526498841&sv=120&sign=b73619006c5720844772e453ef930f9c',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000295666%22%2C%22action%22%3A%22to%22%7D&uuid=bd38184261369d31d3a65cc1&client=apple&clientVersion=10.0.10&st=1647526498842&sv=111&sign=849720c98d89045f1831214843c0272d',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000281032%22%2C%22action%22%3A%22to%22%7D&uuid=bd38184261369d31d3a65cc1&client=apple&clientVersion=10.0.10&st=1647526498842&sv=102&sign=ca5ad9c5c18d192c9c6b8aa4f6d5d3f7',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000313985%22%2C%22action%22%3A%22to%22%7D&uuid=08eda6c891bfe884424569a7&client=apple&clientVersion=10.0.10&st=1647526498843&sv=111&sign=85f6aa8696aabd0e96214dd5ab734c16',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000337469%22%2C%22action%22%3A%22to%22%7D&uuid=08eda6c891bfe884424569a7&client=apple&clientVersion=10.0.10&st=1647526498843&sv=120&sign=e0322a66b39ba9fefb8f6e1c570b6c6f',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000262588%22%2C%22action%22%3A%22to%22%7D&uuid=08eda6c891bfe884424569a7&client=apple&clientVersion=10.0.10&st=1647526498843&sv=112&sign=c927b99491aa7033fb5c14f1cf3eaa56',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000260256%22%2C%22action%22%3A%22to%22%7D&uuid=f99df9190a5ecc411eed8d28&client=apple&clientVersion=10.0.10&st=1647526498845&sv=120&sign=6002eac7aae41d88e237edc9d7c76d9a',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000272600%22%2C%22action%22%3A%22to%22%7D&uuid=f99df9190a5ecc411eed8d28&client=apple&clientVersion=10.0.10&st=1647526498845&sv=100&sign=be13986a1876726d8c550c1d7721e64b',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000312023%22%2C%22action%22%3A%22to%22%7D&uuid=10480e779256c4d582424d6e&client=apple&clientVersion=10.0.10&st=1647526498846&sv=102&sign=547271023d037c24588e8178bd7849b2',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000344292%22%2C%22action%22%3A%22to%22%7D&uuid=b57260e48fec9f9f9aa63705&client=apple&clientVersion=10.0.10&st=1647526498847&sv=112&sign=435f8a759b4dba285bb344641f432f41',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000270721%22%2C%22action%22%3A%22to%22%7D&uuid=6a0dabe03b218e200b299aaa&client=apple&clientVersion=10.0.10&st=1647526498849&sv=111&sign=de2fec928432b5b4dccd6bd1bc01e36e',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000249374%22%2C%22action%22%3A%22to%22%7D&uuid=6a0dabe03b218e200b299aaa&client=apple&clientVersion=10.0.10&st=1647526498849&sv=102&sign=96e1162198c3e4f851e15f9751839d1f',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000267913%22%2C%22action%22%3A%22to%22%7D&uuid=6a0dabe03b218e200b299aaa&client=apple&clientVersion=10.0.10&st=1647526498849&sv=112&sign=d6fda37f69bad9622e9b1f673c5bc6c7',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000301919%22%2C%22action%22%3A%22to%22%7D&uuid=fec4c13024f413070a376a37&client=apple&clientVersion=10.0.10&st=1647526498851&sv=111&sign=716e95aa792bca0ee8c01f3bf5552c30',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000262058%22%2C%22action%22%3A%22to%22%7D&uuid=1ea72cdcb72b10dbc063d157&client=apple&clientVersion=10.0.10&st=1647526498853&sv=102&sign=1c2db11b946f4ea4f8faa9e5a872450a',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000274643%22%2C%22action%22%3A%22to%22%7D&uuid=b8284d42e1008474e4bfa60d&client=apple&clientVersion=10.0.10&st=1647526498860&sv=111&sign=dfedd9a8b33daaaf00193a1995c1fb36',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000279806%22%2C%22action%22%3A%22to%22%7D&uuid=b8284d42e1008474e4bfa60d&client=apple&clientVersion=10.0.10&st=1647526498860&sv=112&sign=a3d3bd6bd2c21249101d2128d0a08bd0',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000279759%22%2C%22action%22%3A%22to%22%7D&uuid=3d6e158ad713a474b3a9c6ed&client=apple&clientVersion=10.0.10&st=1647526498861&sv=120&sign=af984437bed084952b9a124fbff91513',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000303645%22%2C%22action%22%3A%22to%22%7D&uuid=a8558a6198250d0607d55fd8&client=apple&clientVersion=10.0.10&st=1647526498862&sv=120&sign=528efea448358051bdce0759e3d8525c',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000255152%22%2C%22action%22%3A%22to%22%7D&uuid=2ccfb943756b4b7dcf14df0a&client=apple&clientVersion=10.0.10&st=1647526498863&sv=102&sign=d4ef861ca49668b4b97251001a5cd23c',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000310222%22%2C%22action%22%3A%22to%22%7D&uuid=700e8a5901ad55c6cd2f82d2&client=apple&clientVersion=10.0.10&st=1647526498863&sv=120&sign=70e68a531adca8d16e6e2fc3e58d00fc',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000282466%22%2C%22action%22%3A%22to%22%7D&uuid=700e8a5901ad55c6cd2f82d2&client=apple&clientVersion=10.0.10&st=1647526498864&sv=100&sign=0984bdf0df3e9def5f7f9903fa587ec6',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000334602%22%2C%22action%22%3A%22to%22%7D&uuid=7e8e8c6e7f1c5fc52b28ba15&client=apple&clientVersion=10.0.10&st=1647526498870&sv=120&sign=639a60ef74caffcebfdd5541d969c2eb',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000293336%22%2C%22action%22%3A%22to%22%7D&uuid=03ec0dc07d3a16fbbc2913ee&client=apple&clientVersion=10.0.10&st=1647526498871&sv=121&sign=768a3bca0369904bba234dc3c83b2cd3',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000340164%22%2C%22action%22%3A%22to%22%7D&uuid=f8143c3fabeddc7a97791956&client=apple&clientVersion=10.0.10&st=1647526498871&sv=102&sign=98f9b7314e2bf400359d7455baaffe3f',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000340301%22%2C%22action%22%3A%22to%22%7D&uuid=f8143c3fabeddc7a97791956&client=apple&clientVersion=10.0.10&st=1647526498872&sv=102&sign=9b89bfa77450fdc5e507e68e351e90de',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000335496%22%2C%22action%22%3A%22to%22%7D&uuid=f8143c3fabeddc7a97791956&client=apple&clientVersion=10.0.10&st=1647526498872&sv=121&sign=74362f30443fce9b2c748e0fe4f37177',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000286877%22%2C%22action%22%3A%22to%22%7D&uuid=3ff39e1c0ecd4b953f7aa301&client=apple&clientVersion=10.0.10&st=1647526498873&sv=111&sign=973351eb3ef957ef5f50288383b312a0',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000319779%22%2C%22action%22%3A%22to%22%7D&uuid=3ff39e1c0ecd4b953f7aa301&client=apple&clientVersion=10.0.10&st=1647526498873&sv=120&sign=32582d91500478c813da657dcc30e717',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000284071%22%2C%22action%22%3A%22to%22%7D&uuid=109ae0f8f54c5f9bfed558a3&client=apple&clientVersion=10.0.10&st=1647526498873&sv=112&sign=bef806d4b4eb3af62f4682afb55ce25e',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000329773%22%2C%22action%22%3A%22to%22%7D&uuid=43aac1700673ac1ab0b558f7&client=apple&clientVersion=10.0.10&st=1647526498875&sv=121&sign=7907654583a66186f9668f62d8455812',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000320014%22%2C%22action%22%3A%22to%22%7D&uuid=9db99d63c35743e6c36e4242&client=apple&clientVersion=10.0.10&st=1647526498876&sv=100&sign=93544553890fbfe4489544463f2e20e8',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000281016%22%2C%22action%22%3A%22to%22%7D&uuid=2c845dc34be7459f0d7169ba&client=apple&clientVersion=10.0.10&st=1647526498884&sv=111&sign=f49d74fdfd5757fa2c2569489deb2092',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000303975%22%2C%22action%22%3A%22to%22%7D&uuid=2c845dc34be7459f0d7169ba&client=apple&clientVersion=10.0.10&st=1647526498884&sv=100&sign=986877f57c36edb74153270f6212731a',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000264304%22%2C%22action%22%3A%22to%22%7D&uuid=5ee7cef6a1d0388775a2685f&client=apple&clientVersion=10.0.10&st=1647526498885&sv=100&sign=4ec2116aa79d8e94a6b20db52efd5555',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000304501%22%2C%22action%22%3A%22to%22%7D&uuid=a13a23184284cf83d3659d15&client=apple&clientVersion=10.0.10&st=1647526498886&sv=100&sign=6b9f5cc8625589396484b4dc5ac88535',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000293770%22%2C%22action%22%3A%22to%22%7D&uuid=0fd27f1b66871765f0908e40&client=apple&clientVersion=10.0.10&st=1647526498887&sv=100&sign=a679fc9d06114d127d87a76bb45a532c',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000252904%22%2C%22action%22%3A%22to%22%7D&uuid=67fd8faf4851a57ca6c0f6fd&client=apple&clientVersion=10.0.10&st=1647526498888&sv=112&sign=93c0a48e9919e2f5a6d9350c0fcf1a10',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000312196%22%2C%22action%22%3A%22to%22%7D&uuid=460a9e0c331564ce493dd8f8&client=apple&clientVersion=10.0.10&st=1647526498890&sv=100&sign=3ae4212f1760b2316a07a357e6eaca49',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000344582%22%2C%22action%22%3A%22to%22%7D&uuid=c5f259391b071311f597f3f5&client=apple&clientVersion=10.0.10&st=1647526498891&sv=112&sign=05c36702966090d821595bac22c56e12',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000318683%22%2C%22action%22%3A%22to%22%7D&uuid=e6e9967500340c7add09c2d9&client=apple&clientVersion=10.0.10&st=1647526498892&sv=102&sign=856f2fe8e945f69ba9eb5880ac01a92c',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000329594%22%2C%22action%22%3A%22to%22%7D&uuid=e6e9967500340c7add09c2d9&client=apple&clientVersion=10.0.10&st=1647526498892&sv=111&sign=e65e5ac7c54d95d19079901b4498610c',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000251268%22%2C%22action%22%3A%22to%22%7D&uuid=e6e9967500340c7add09c2d9&client=apple&clientVersion=10.0.10&st=1647526498892&sv=121&sign=d7addbd02ee9c127d542a713781aad2b',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000316915%22%2C%22action%22%3A%22to%22%7D&uuid=ca6d203baf9d11189ded0ead&client=apple&clientVersion=10.0.10&st=1647526498893&sv=121&sign=0b0961985c4a5e17fc137c099ae2260c',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000313201%22%2C%22action%22%3A%22to%22%7D&uuid=49c768832398a981632dea07&client=apple&clientVersion=10.0.10&st=1647526498894&sv=102&sign=739811b4e2e9951dc5fe23ae6bec97de',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000259098%22%2C%22action%22%3A%22to%22%7D&uuid=9cb5e67e83f2bf7af8eab622&client=apple&clientVersion=10.0.10&st=1647526498895&sv=112&sign=368f2c11360c02c8903e6fb7251dddae',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000253158%22%2C%22action%22%3A%22to%22%7D&uuid=9cb5e67e83f2bf7af8eab622&client=apple&clientVersion=10.0.10&st=1647526498895&sv=121&sign=8006d97778762f423c3afbb31adf0844',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000300937%22%2C%22action%22%3A%22to%22%7D&uuid=0c3a78dcc7e815d2f7348b14&client=apple&clientVersion=10.0.10&st=1647526498896&sv=100&sign=ff4b48272f57011486b85768cf88499e',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000327359%22%2C%22action%22%3A%22to%22%7D&uuid=b69c858ce78bf7408aa2e3f7&client=apple&clientVersion=10.0.10&st=1647526498898&sv=121&sign=995162f2aeae8b69575ae2157b346f0e',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000312899%22%2C%22action%22%3A%22to%22%7D&uuid=e02573c20d0e2f4b9a3c9069&client=apple&clientVersion=10.0.10&st=1647526498902&sv=102&sign=69e0bcefe6358b48b3c170558e584c4c',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000307185%22%2C%22action%22%3A%22to%22%7D&uuid=e02573c20d0e2f4b9a3c9069&client=apple&clientVersion=10.0.10&st=1647526498902&sv=120&sign=05ceb479210960a30c85386499535286',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000268992%22%2C%22action%22%3A%22to%22%7D&uuid=e02573c20d0e2f4b9a3c9069&client=apple&clientVersion=10.0.10&st=1647526498902&sv=102&sign=d7703d1c243a17d45243b924a63e0cf1',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000321691%22%2C%22action%22%3A%22to%22%7D&uuid=39956f3eb5f7987b8423e0d3&client=apple&clientVersion=10.0.10&st=1647526498902&sv=100&sign=ec9105bde25b1e8d31a053891d236f0b',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000312494%22%2C%22action%22%3A%22to%22%7D&uuid=39956f3eb5f7987b8423e0d3&client=apple&clientVersion=10.0.10&st=1647526498903&sv=112&sign=11e126e7bc10520b670dae8c163cd610',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000265434%22%2C%22action%22%3A%22to%22%7D&uuid=20eb1a216a24cc62ecb7bfd6&client=apple&clientVersion=10.0.10&st=1647526498904&sv=121&sign=daa239bf9cbb1acf75a3b2dfccb20255',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000329670%22%2C%22action%22%3A%22to%22%7D&uuid=46f3eb8cec2e05cc808f4565&client=apple&clientVersion=10.0.10&st=1647526498905&sv=111&sign=cd8d4eb75755dfaf29dd76230782ebbc',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000323204%22%2C%22action%22%3A%22to%22%7D&uuid=ee9afdf0e0bbadf83ec0e8cf&client=apple&clientVersion=10.0.10&st=1647526498906&sv=121&sign=08acde75f0d44e2adfc0da470afc3e88',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000335072%22%2C%22action%22%3A%22to%22%7D&uuid=ee9afdf0e0bbadf83ec0e8cf&client=apple&clientVersion=10.0.10&st=1647526498906&sv=102&sign=99d59428db44016902748aa90afe4006',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000257473%22%2C%22action%22%3A%22to%22%7D&uuid=a1c413bc49f05fd364157f39&client=apple&clientVersion=10.0.10&st=1647526498907&sv=121&sign=39c1a137807c18ee114124840fcfb077',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000285778%22%2C%22action%22%3A%22to%22%7D&uuid=c1124eaeb4f39a8001073c8a&client=apple&clientVersion=10.0.10&st=1647526498911&sv=120&sign=c52ad9befd2e4cef5fa59c868ec8cefa',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000296096%22%2C%22action%22%3A%22to%22%7D&uuid=c1124eaeb4f39a8001073c8a&client=apple&clientVersion=10.0.10&st=1647526498912&sv=112&sign=d7eb2ccab300ea5e3dc6bd6d245ef25e',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000303132%22%2C%22action%22%3A%22to%22%7D&uuid=ef95356a07accd7015629329&client=apple&clientVersion=10.0.10&st=1647526498912&sv=112&sign=58d45e4d48b3987af2b1c611b1e002cc',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000331472%22%2C%22action%22%3A%22to%22%7D&uuid=d1ac8e9a8b5962336e126ed1&client=apple&clientVersion=10.0.10&st=1647526498915&sv=112&sign=e62cff0aaf0c8564c0e6c8518f282502',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000329460%22%2C%22action%22%3A%22to%22%7D&uuid=18bd6a669c7839877a84694f&client=apple&clientVersion=10.0.10&st=1647526498916&sv=111&sign=c8eb47225af0256f4201e3e7d9709cf2',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000282317%22%2C%22action%22%3A%22to%22%7D&uuid=1da8ae2a1249193c96b031e8&client=apple&clientVersion=10.0.10&st=1647526498916&sv=112&sign=0f08ddcbe7e5a1f9e18ef4b831f01fce',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000331599%22%2C%22action%22%3A%22to%22%7D&uuid=1da8ae2a1249193c96b031e8&client=apple&clientVersion=10.0.10&st=1647526498917&sv=102&sign=4382d57b488aef704cce9d5e5bb28fed',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000266963%22%2C%22action%22%3A%22to%22%7D&uuid=4c7d97d4f59130f0d7cd0c6e&client=apple&clientVersion=10.0.10&st=1647526498918&sv=100&sign=e15d5c44a84ca13a36baa938326d4890',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000287654%22%2C%22action%22%3A%22to%22%7D&uuid=cc9feba1fc6dce9d42a94c93&client=apple&clientVersion=10.0.10&st=1647526498919&sv=102&sign=095f75790a54e24465737723c9e641e2',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000314317%22%2C%22action%22%3A%22to%22%7D&uuid=cc9feba1fc6dce9d42a94c93&client=apple&clientVersion=10.0.10&st=1647526498919&sv=100&sign=196607c7b35e4ff4b6232f50dc6e06b6',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000273198%22%2C%22action%22%3A%22to%22%7D&uuid=7aba1accb680baad1125c817&client=apple&clientVersion=10.0.10&st=1647526498920&sv=111&sign=5ae091c039b0789f4b8a1b7541f0b999',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000258438%22%2C%22action%22%3A%22to%22%7D&uuid=7aba1accb680baad1125c817&client=apple&clientVersion=10.0.10&st=1647526498920&sv=120&sign=92216a64c58252c66c6421fc7a07ba2e',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000278153%22%2C%22action%22%3A%22to%22%7D&uuid=7aba1accb680baad1125c817&client=apple&clientVersion=10.0.10&st=1647526498920&sv=112&sign=bb6d299c5e947f54c7212e60c4ceadf9',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000277914%22%2C%22action%22%3A%22to%22%7D&uuid=d2a0c5aa154e325aee636c58&client=apple&clientVersion=10.0.10&st=1647526498921&sv=111&sign=ee1dec1dbad39a7f1765595f72b5db45',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000265765%22%2C%22action%22%3A%22to%22%7D&uuid=d2a0c5aa154e325aee636c58&client=apple&clientVersion=10.0.10&st=1647526498921&sv=100&sign=a12a05b523d1b91e7ad1b38f20fb876e',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000320486%22%2C%22action%22%3A%22to%22%7D&uuid=48e44e8be40f3736d8290f98&client=apple&clientVersion=10.0.10&st=1647526498925&sv=120&sign=008553e08c564504f67cd82ac38b6909',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000295443%22%2C%22action%22%3A%22to%22%7D&uuid=1ac3312fdd57977b4f2172b4&client=apple&clientVersion=10.0.10&st=1647526498926&sv=111&sign=b8a6bee3cbecf0cdb5b51021918621a3',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000284763%22%2C%22action%22%3A%22to%22%7D&uuid=1ac3312fdd57977b4f2172b4&client=apple&clientVersion=10.0.10&st=1647526498926&sv=121&sign=22485bae529b2cf19a8b7966552a5c8c',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000275605%22%2C%22action%22%3A%22to%22%7D&uuid=02d372728f15c01efcb7638f&client=apple&clientVersion=10.0.10&st=1647526498927&sv=100&sign=d091b0e2b1357e6aba50727cc684a9a1',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000276694%22%2C%22action%22%3A%22to%22%7D&uuid=02d372728f15c01efcb7638f&client=apple&clientVersion=10.0.10&st=1647526498927&sv=100&sign=c15b96b50dc85d4386af2712ea82e9a9',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000290263%22%2C%22action%22%3A%22to%22%7D&uuid=cde6eeeebcdaaa57be536675&client=apple&clientVersion=10.0.10&st=1647526498928&sv=102&sign=dded511906fa1685c4fed016f3f11bd7',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000328277%22%2C%22action%22%3A%22to%22%7D&uuid=cde6eeeebcdaaa57be536675&client=apple&clientVersion=10.0.10&st=1647526498928&sv=102&sign=74206b93aece0829551d6c12ffdad1c4',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000263491%22%2C%22action%22%3A%22to%22%7D&uuid=bf357790f92b32cc9cfdaa77&client=apple&clientVersion=10.0.10&st=1647526498929&sv=120&sign=dec92c050507224ad13adf2bd1f53108',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000281497%22%2C%22action%22%3A%22to%22%7D&uuid=bf357790f92b32cc9cfdaa77&client=apple&clientVersion=10.0.10&st=1647526498929&sv=121&sign=b1ab2f367f44a443069b7e78ad061558',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000321485%22%2C%22action%22%3A%22to%22%7D&uuid=75ab3d7323dbe91f8ece663c&client=apple&clientVersion=10.0.10&st=1647526498932&sv=112&sign=2eb9b7521236466c71fb1f960ca39510',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000320967%22%2C%22action%22%3A%22to%22%7D&uuid=af4070be625dd5a99d4d7ed4&client=apple&clientVersion=10.0.10&st=1647526498933&sv=100&sign=4ca2e610a8a983f74a7cfda214a842b7',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000327941%22%2C%22action%22%3A%22to%22%7D&uuid=8d49bcc15597e906dc2f3ef5&client=apple&clientVersion=10.0.10&st=1647526498934&sv=121&sign=f4396f64b5564c96799491cd30b0a4aa',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000254351%22%2C%22action%22%3A%22to%22%7D&uuid=606fefdfecd47ebdab83b54a&client=apple&clientVersion=10.0.10&st=1647526498934&sv=120&sign=938623bee233373d4ab7712bb0a08f5f',
            'functionId=genToken&body=%7B%22to%22%3A%22https%3A%2F%2Fshop.m.jd.com%2F%3FshopId%3D1000346739%22%2C%22action%22%3A%22to%22%7D&uuid=606fefdfecd47ebdab83b54a&client=apple&clientVersion=10.0.10&st=1647526498935&sv=121&sign=ebe039b53a55bcd885d1e6c27a97d55f'
        ]
    }

    async main(p) {
        let cookie = p.cookie
        let pin = this.userPin(cookie)
        let dict = this.userDict[pin]
        if (cookie.includes("wskey=")) {
            let q = this.query(cookie, ';', 1)
            if (q.pt_pin && !q.pin) {
                q.pin = q.pt_pin
            }
            delete q.pt_pin
            delete q.pt_key
            cookie = this.query(q, ';')
            dict = {
                wskey: cookie,
                verify: 1
            }
            if (this.userDict[pin]) {
                this.userDict[pin].wskey = q.wskey
            }
            else {
                this.userDict[pin] = {
                    pin,
                    userName: pin,
                    index: this.rand(10000, 20000),
                    wskey: cookie,
                    verify: 1
                }
            }
        }
        if (dict.wskey && dict.verify) {
            let s = await this.curl({
                    'url': `https://plogin.m.jd.com/cgi-bin/ml/islogin`,
                    cookie
                }
            )
            if (s.islogin == '0' || parseInt(dict.verify) == 2 || cookie.includes("wskey=")) {
                let wskey = ''
                if (dict.wskey.includes("wskey")) {
                    wskey = dict.wskey
                    if (!wskey.includes('pin=')) {
                        wskey = `${wskey};pin=${encodeURIComponent(pin)};`
                    }
                }
                else {
                    wskey = `pin=${encodeURIComponent(pin)};wskey=${dict.wskey};`
                }
                let shopUrl = `https://shop.m.jd.com/?shopId=${this.rand(1000349325, 1000249325)}`
                let x = await this.response({
                    url: `https://api.m.jd.com/client.action?functionId=genToken`,
                    form: this.random(this.code, 1)[0],
                    cookie: wskey
                })
                let y = await this.response({
                    url: `https://un.m.jd.com/cgi-bin/app/appjmp?tokenKey=${x.content.tokenKey}&lbs={"cityId":"","districtId":"","provinceId":"","districtName":"","lng":"0.000000","provinceName":"","lat":"0.000000","cityName":""}&to=${encodeURIComponent(shopUrl)}`,
                    'form': '',
                })
                let openKey = y.cookie || ''
                if (!openKey.includes('app_open')) {
                    console.log("app算法生成失败,尝试使用极速版算法生成")
                    x = await this.response(this.modules.jdUrl.lite('lite_genToken', {
                            "to": shopUrl,
                            "action": "to"
                        }, 'post', wskey)
                    )
                    y = await this.response({
                        url: `https://un.m.jd.com/cgi-bin/app/appjmp?tokenKey=${x.content.tokenKey}&lbs={"cityId":"","districtId":"","provinceId":"","districtName":"","lng":"0.000000","provinceName":"","lat":"0.000000","cityName":""}&to=${encodeURIComponent(shopUrl)}`,
                        'form': '',
                    })
                    openKey = y.cookie || ''
                }
                console.log(openKey)
                if (openKey.includes('app_open')) {
                    this.notices('openKey生成成功', p.user)
                    this.n++
                    let q1 = this.query(openKey, ';', 'split')
                    let q2 = this.query(cookie, ';', 'split')
                    let q3 = {...q2, ...q1}
                    let newCookie = this.query(this.compact(q3, ['pt_key', 'pt_pin', 'pt_phone']), ';')
                    this.dict[pin] = newCookie + ';'
                }
                else {
                    console.log('openKey生成失败', p.user)
                    this.notices('openKey生成失败', p.user)
                }
            }
            else {
                console.log(p.user, '账户未过期')
            }
        }
        else {
            console.log(p.user, '没有wskey')
        }
    }

    async extra() {
        if (this.dumps(this.dict) != '{}') {
            try {
                let command = this['QITOQITO_PLATFORM'] || ''
                let platform = command
                if (command.includes('http')) {
                    platform = 'qinglong'
                }
                switch (platform) {
                    case "qinglong":
                        if (command == 'qinglong') {
                            command = 'http://127.0.0.1:5700'
                        }
                        let json = this.modules.fs.readFileSync('../config/auth.json', "utf-8");
                        let auth = JSON.parse(json)
                        let authorization = `Bearer ${auth.token}`
                        let url = command;
                        let c = await this.curl({
                            url: `${url}/api/envs?searchValue=JD_COOKIE&t=1643903429215`,
                            authorization,
                            'headers': {
                                'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                            }
                        })
                        if (c.code == 401) {
                            let login = await this.curl({
                                'url': `${url}/api/user/login?t=1639363615601`,
                                json: {
                                    "username": auth.username,
                                    "password": auth.password
                                },
                                'headers': {
                                    'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                                }
                            })
                            if (login.code == 200) {
                                let token = login.data.token
                                authorization = `Bearer ${login.data.token}`
                                c = await this.curl({
                                    url: `${url}/api/envs?searchValue=JD_COOKIE&t=1643903429215`,
                                    authorization,
                                    'headers': {
                                        'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                                    }
                                })
                            }
                        }
                        let dict = this.column(c.data, 'value', '_id')
                        let id = '_id'
                        if (this.dumps(dict) == '{}') {
                            id = 'id'
                            dict = this.column(c.data, 'value', 'id')
                        }
                        for (let i in dict) {
                            let cookie = dict[i]
                            let pin = this.userPin(cookie)
                            if (this.dict[pin]) {
                                let body = (id == 'id') ? {
                                    "name": "JD_COOKIE",
                                    "value": this.dict[pin],
                                    'id': i,
                                } : {
                                    "name": "JD_COOKIE",
                                    "value": this.dict[pin],
                                    '_id': i,
                                }
                                let u = await this.curl({
                                    url: `${url}/api/envs?t=1643903429215`,
                                    authorization,
                                    json: body,
                                    method: 'put',
                                    'headers': {
                                        'Referer': `${url}/api/crons?searchValue=&t=1638982538292`,
                                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'
                                    }
                                })
                                if (u.code == 200) {
                                    this.notices(`更新: ${pin} 成功`)
                                    console.log(`更新: ${pin} 成功`)
                                }
                                else {
                                    this.notices(`更新: ${pin} 失败`)
                                    console.log(`更新: ${pin} 失败`)
                                }
                            }
                        }
                        break
                    case 'jtask':
                    case 'jd':
                        let file = this.modules.fs.readFileSync('../config/config.sh', "utf-8");
                        let cs = this.matchAll(/Cookie\d+\s*=\s*"([^\"]+)"/g, file)
                        let c1 = {}
                        let isChange = 0
                        for (let cookie of cs) {
                            let pin = this.userPin(cookie)
                            if (this.dict[pin]) {
                                this.notices(`更新: ${pin} 成功`)
                                file = file.replace(cookie, this.dict[pin])
                                console.log(`更新: ${pin} 成功`)
                                isChange = 1
                            }
                        }
                        if (isChange) {
                            this.modules.fs.writeFile('../config/config.sh', file, function(err, data) {
                                if (err) {
                                    throw err;
                                }
                                console.log("config.sh写入成功")
                            })
                        }
                        else {
                            console.log("没有数据可以写入")
                        }
                        break
                    default:
                        delete require.cache[this.dirname + "/cookie/jd.js"];
                        let cc = require(this.dirname + "/cookie/jd")
                        let change = 0
                        for (let i in cc) {
                            for (let j in cc[i]) {
                                let cookie = cc[i][j]
                                let pin = this.userPin(cookie)
                                if (this.dict[pin]) {
                                    change = 1
                                    this.notices(`更新: ${pin} 成功`)
                                    cc[i][j] = this.dict[pin]
                                }
                            }
                        }
                        if (change) {
                            let data = `module.exports = ${JSON.stringify(cc, null, 4)}`
                            this.modules.fs.writeFile(this.dirname + "/cookie/jd.js", data, function(err, data) {
                                if (err) {
                                    throw err;
                                }
                                console.log("Cookie写入成功")
                            })
                        }
                        else {
                            console.log("没有数据可以写入")
                        }
                        break
                }
                let userData = `module.exports = ${JSON.stringify(this.userDict, null, 4)}`
                this.modules.fs.writeFile(this.dirname + "/config/jdUser.js", userData, function(err, data) {
                    if (err) {
                        throw err;
                    }
                    console.log("user写入成功")
                })
            } catch (e) {
            }
        }
        else {
            console.log('没有可执行数据')
        }
    }
}

module.exports = Main;
