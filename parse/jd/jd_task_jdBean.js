const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东轻松赚豆"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.delay = 500
        this.interval = 1000
    }

    async prepare() {
        this.clientVersion = "12.4.4"
        this.algo = new this.modules.jdAlgo({
            version: '4.4',
            type: 'main',
            referer: 'https://jdbeantask-pro.pf.jd.com/',
            // headers: {
            //     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0',
            //     referer: 'https://jdbeantask-pro.pf.jd.com/'
            // }
        })
    }

    async report(p) {
        let cookie = p.cookie;
        let ts = new Date().getTime().toString()
        let token = this.md5(ts + "5YT%aC89$22OI@pQ")
        let report = {
            "pin_sid": "",
            "report_ts": ts,
            "scr": "375x667",
            "token": token,
            "ut": "s",
            "clt": "web",
            "jvr": "3.0.12",
            "std": "MO-J2011-1",
            "tpc": "traffic-jdm.cl",
            "uuid": "1710637493566987502762",
            "cli": "IOS-M",
            "osv": "",
            "uid": "",
            "biz": "mba",
            "mba_muid": "1710637493566987502762",
            "mba_sid": "367",
            "proj_id": "3",
            "reserved3": "122270672.1710637493566987502762.1710637493.1711511964.1711545507.26_122270672_kong_t_1000582354",
            "osp": "iphone",
            "data": [{
                "ma_route_ready": "1",
                "ma_log_id": `1710637493566987502762-1711545550415-${this.rand(300000,999999)}`,
                "ma_pv_log_id": "1710637493566987502762-1711545508136-899227",
                "ref": "JingDou_Detail_Contrller",
                "ctm": "1711545550417",
                "pin": this.userPin(cookie),
                "ctp": "https://jdbeantask-pro.pf.jd.com/",
                "par": "source=JBean&ubb_loc=app.myjbean.my-put.yz-my-put&ubb_info=eyJwIjoiYnRwIn0%3D",
                "usc": "kong",
                "umd": "jingfen",
                "utr": "7fc419f42b3c45e5a9175acbfd122a96",
                "ucp": "t_1000582354_",
                "jdv": "122270672|kong|t_1000582354_|jingfen|7fc419f42b3c45e5a9175acbfd122a96|1711107379096",
                "vts": 26,
                "seq": 1,
                "browser_ver": "0",
                "browser": "JDAPP",
                "fst": 1710637493,
                "pst": 1711511964,
                "vct": 1711545507,
                "clr": "32-bit",
                "bsl": "zh-cn",
                "bsc": "UTF-8",
                "jav": 0,
                "flv": "",
                "tit": "京豆任务",
                "hash": "",
                "tad": "1",
                "dataver": "0.1",
                "is_wq": 0,
                "chan_type": 6,
                "rpd": "JingDou_Detail",
                "app_device": "IOS",
                "pap": "JA2015_311210|12.4.4|IOS",
                "typ": "cl",
                "lgt": "cl",
                "tar": "",
                "apv": this.clientVersion,
                "mba_seq": "9",
                "event_id": "NewVip_JBeanTask_RelaxTaskButton",
                "psn": "102e084dd630eb7a4cb6e8651ed23deac1a2e067|1389",
                "psq": "3",
                "page_id": "NewVip_JBeanTask",
                "page_name": "https://jdbeantask-pro.pf.jd.com/",
                "page_param": "source=JBean&ubb_loc=app.myjbean.my-put.yz-my-put&ubb_info=eyJwIjoiYnRwIn0%3D",
                "json_param": "{\"taskid\":\"383\",\"button_sort\":\"0\"}",
                "pv_sid": "367",
                "pv_seq": "9",
                "ma_is_sparse": "0",
                "ma_b_group": "-1",
                "unpl": "",
                "mjds": "",
                "mode_tag": "0"
            }]
        }
        // console.log(report)
        let log = await this.curl({
                'url': `https://uranus.jd.com/log/m?std=MO-J2011-1`,
                'json': report,
                cookie,
                referer: 'https://jdbeantask-pro.pf.jd.com/',
                // ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0'
            }
        )
        // console.log(log)
    }

    async main(p) {
        let cookie = p.cookie;
        let l = await this.algo.curl({
                'url': `http://api.m.jd.com/`,
                'form': `functionId=pg_channel_page_data&appid=jd-bean-task&body={"paramData":{"token":"2752f370-f499-44cd-b024-7c8e881cf7fe","channel":"","upstreamChannel":"","launchChannel":"APP"},"argMap":{"source":"JBean","ubb_loc":"app.myjbean.my-put.yz-my-put","ubb_info":"eyJwIjoiYnRwIn0%3D%0A"},"riskInformation":{}}`,
                cookie,
                algo: {
                    appId: '4646c',
                }
            }
        )
        await this.report(p)
        // console.log(l)
        let bean = 0
        if (!this.haskey(l, 'data.floorInfoList')) {
            console.log("没有获取到数据")
        }
        for (let i of this.haskey(l, 'data.floorInfoList')) {
            if (i.title == '轻松赚豆') {
                let token = i.token
                for (let j of this.haskey(i, 'floorData.pgTaskListVO.taskInfoList')) {
                    if (j.taskStatus != 3) {
                        console.log("正在浏览:", j.name)
                        if (j.name == '领取下单任务') {
                            for (let jj of this.haskey(l, 'data.floorInfoList')) {
                                if (jj.title == '限时挑战') {
                                    let token2 = jj.token
                                    let id2 = jj.floorData.getHomeTaskInfo.beanShortTasks[0].taskEncId
                                    let q = await this.algo.curl({
                                            'url': `http://api.m.jd.com/`,
                                            'form': `functionId=pg_interact_interface_invoke&appid=jd-bean-task&body={"floorToken":"${token2}","dataSourceCode":"taskReceive","argMap":{"channel":"","launchChannel":"APP","taskEncId":"${id2}"}}`,
                                            cookie,
                                            algo: {
                                                appId: 'a7c04'
                                            }
                                        }
                                    )
                                    await this.report(p)
                                    break
                                }
                            }
                        }
                        let z = await this.algo.curl({
                                'url': `http://api.m.jd.com/`,
                                'form': `functionId=pg_interact_interface_invoke&appid=jd-bean-task&body={"floorToken":"${token}","dataSourceCode":"taskReceive","argMap":{"launchChannel":"APP","channel":"","taskEncId":"${j.taskEncId}"}}`,
                                cookie,
                                algo: {
                                    appId: 'a7c04'
                                }
                            }
                        )
                        await this.report(p)
                        // console.log(z)
                        let id = this.haskey(j, 'browseInfoVO.browsePageVOS.0.id') || 0
                        let y = await this.algo.curl({
                                'url': `http://api.m.jd.com/`,
                                'form': `functionId=pg_interact_interface_invoke&appid=jd-bean-task&body={"floorToken":"${token}","dataSourceCode":"taskFinish","argMap":{"launchChannel":"APP","channel":"","taskEncId":"${j.taskEncId}","extParamsStr":{"browseTrxId":${id}}}}`,
                                cookie,
                                algo: {
                                    appId: 'a7c04'
                                }
                            }
                        )
                        await this.report(p)
                        // console.log(y)
                        let d = await this.algo.curl({
                                'url': `http://api.m.jd.com/`,
                                'form': `functionId=pg_interact_interface_invoke&appid=jd-bean-task&body={"floorToken":"${token}","dataSourceCode":"taskReward","argMap":{"launchChannel":"APP","channel":"","taskEncId":"${j.taskEncId}"}}`,
                                cookie,
                                algo: {
                                    appId: "a7c04"
                                }
                            }
                        )
                        await this.report(p)
                        // console.log(d)
                        if (this.haskey(d, 'data.beanInfo.beanNum')) {
                            console.log('获得京豆:', d.data.beanInfo.beanNum)
                            bean += d.data.beanInfo.beanNum
                        }
                        else {
                            console.log(d)
                        }
                    }
                }
            }
            else if (i.name == '签到活动') {
                console.log("签到中...")
                let sign = await this.algo.curl({
                        'url': `http://api.m.jd.com/`,
                        'form': `functionId=pg_interact_interface_invoke&appid=jd-bean-task&body={"floorToken":"${i.token}","dataSourceCode":"signIn","argMap":{"currSignCursor":${i.floorData.signActInfo.currSignCursor},"signActId":${i.id}},"riskInformation":{}}`,
                        cookie,
                        algo: {
                            appId: 'a7c04'
                        }
                    }
                )
                await this.report(p)
                if (this.haskey(sign, 'data.rewardVos')) {
                    console.log("签到成功")
                    for (let kk of sign.data.rewardVos) {
                        if (kk.jingBeanVo) {
                            console.log('获得京豆:', kk.jingBeanVo.beanNum)
                            bean += kk.jingBeanVo.beanNum
                        }
                    }
                }
                else {
                    console.log(this.haskey(sign, 'message') || sign)
                }
            }
        }
        if (bean) {
            this.print(`共获得京豆: ${bean}`, p.user)
        }
    }
}

module.exports = Main;
