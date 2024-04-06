const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东轻松赚豆"
        this.cron = `${this.rand(0, 59)} ${this.rand(0, 22)} * * *`
        this.task = 'local'
        this.import = ['jdAlgo']
        this.delay = 500
        this.interval = 20000
    }

    async prepare() {
        this.clientVersion = "12.3.1"
        this.algo = new this.modules.jdAlgo({
            version: '4.4',
            type: 'app',
            referer: 'https://jdbeantask-pro.pf.jd.com/',
        })
    }

    async main(p) {
        let cookie = `mba_muid=17117955240101769146964.385.1712198928218; mba_sid=385.52; unpl=JF8EALBnNSttC0tUBhoAHkITQlRQW1kAS0cFbTIGAwpQG1YCGVZLQkd7XlVdWBRKEh9uZRRXX1NLVg4eCysiEEpcVV9UAEIfAV9nAVIzWSVUDB5sdUETGwlRW15aGxIKbDAFVFhoe1cFKwMrEhdCVVFdWg9IHwtvYAZUWF5OXQcfMhoiEENZZG5tDE0UBWtmBFVeaEpkBCtJdRNdS1pdVlgLTBAAZ28FU15YTlIAEgAfIhF7Xg; __jda=122270672.17117955240101769146964.1711795524.1712169759.1712195430.24; __jdb=122270672.7.17117955240101769146964|24.1712195430; __jdc=122270672; __jdv=122270672%7Ckong%7Ct_1000089893_157_0_184__b2ae442ca482f114%7Ctuiguang%7Cb112034a28854591a73d2ff9a363eaaf%7C1712157229000; pre_seq=8; pre_session=102e084dd630eb7a4cb6e8651ed23deac1a2e067|1508; ${p.cookie}; 3AB9D23F7A4B3C9B=FJOYDNWH36HMKV6NZBXWENRGVQ4HXJI5NCIRE57MFYLN57RQT2GVAM27UJ4TAHKEH3FW5BM7PNZGNLUXUCXP2YXC4E; 3AB9D23F7A4B3CSS=jdd03FJOYDNWH36HMKV6NZBXWENRGVQ4HXJI5NCIRE57MFYLN57RQT2GVAM27UJ4TAHKEH3FW5BM7PNZGNLUXUCXP2YXC4EAAAAMOU367TKAAAAAADZZ524FYNPJ734X; sid=; shshshfpb=BApXeSSLDpetD5oAYv5HeX8iF35_e2GPn-4Pj50hX9xJ1PdZfQrDjkz7fqCT0IIdBYVvTZqTn; joyya=1712159437.1712169853.42.0q9omx0; shshshfpa=c0132e96-771e-7ae4-65c3-0ede4d6fb618-1678894834; unionwsws=%7B%22devicefinger%22%3A%22eidId5508121e3s7GcdDwrCSSOe%2FGLUsbjKY3hnHRUmWgBYNr6CNLIg40msRpxIBuiZ5VFk052xiCOSHOJwtB58n6OBzhJWXl6CPdj4J7hjJxn6UuHNp%22%7D; SameSite=Strict; qid_ls=1712159380003; qid_ts=1712169732951; qid_vis=10; shshshfpv=JD0111d47drMDJafiSK617121593466740386DjFBCaUFae5MUxvpSeZyqIzeVdC8G8wGCdJUBmUAOtX1JkXq1CWFbb-1ctA_1WhmySNApf_4Ml5DWXDvDLoMlmTRxhqq10yHni8nLug9w0qe0ll1~BApXeQFjyoOtD5oAYv5HeX8iF35_e2GPn-4Pj50hX9xJ1PdZfQrDjkz7fqCT0IIdBYVvTZqTn; wxa_level=1; client=apple; osv=12.4.4; mobilev=touch; qid_fs=1711796903927; qid_uid=55052bda-2e41-41ff-8f0b-c5e9995a29f5; shshshfpx=c0132e96-771e-7ae4-65c3-0ede4d6fb618-1678894834; b_avif=0; b_dh=667; b_dpr=2; b_dw=375; b_webp=1`;
        await this.report({
            cookie,
            "page_name": "https://jdbeantask-pro.pf.jd.com/",
            "page_param": "source=JBean&ubb_loc=app.myjbean.my-put.yz-my-put&ubb_info=eyJwIjoiYnRwIn0%3D",
            "json_param": "{\"touchstone_expids\":\"\",\"chid\":\"\",\"status\":\"1\",\"days\":7,\"mkt_comp_un\":{\"et\":\"2\",\"lpid\":\"\",\"cid\":\"2030\",\"fid\":\"583\",\"ext\":{\"eid\":\"NewVip_JBeanTask_SignExpo\"},\"det\":{\"recomInfo\":\"\"},\"rid\":\"1712065675352_eakg00eal6fdk3ca1adfb6fgcndlc563\"}}",
        })
        await this.report({
            cookie,
            "page_param": "{\"source\":\"JBean\"}",
        })
        let l = await this.algo.curl({
                'url': `http://api.m.jd.com/`,
                'form': `functionId=pg_channel_page_data&appid=jd-bean-task&body={"paramData":{"token":"2752f370-f499-44cd-b024-7c8e881cf7fe","channel":"","upstreamChannel":"","launchChannel":"APP"},"argMap":{"source":"JBean","ubb_loc":"app.myjbean.my-put.yz-my-put","ubb_info":"eyJwIjoiYnRwIn0%3D"},"riskInformation":{}}`,
                cookie,
                algo: {
                    appId: '4646c'
                }
            }
        )
        await this.report({
            cookie,
            "event_id": "NewVip_JBeanTask_SignExpo",
            "page_name": "https://jdbeantask-pro.pf.jd.com/",
            "page_param": "source=JBean&ubb_loc=app.myjbean.my-put.yz-my-put&ubb_info=eyJwIjoiYnRwIn0%3D",
            "json_param": "{\"touchstone_expids\":\"\",\"chid\":\"\",\"status\":\"1\",\"days\":7,\"mkt_comp_un\":{\"et\":\"2\",\"lpid\":\"\",\"cid\":\"2030\",\"fid\":\"583\",\"ext\":{\"eid\":\"NewVip_JBeanTask_SignExpo\"},\"det\":{\"recomInfo\":\"\"},\"rid\":\"1712065675352_eakg00eal6fdk3ca1adfb6fgcndlc563\"}}",
        })
        await this.report({
            cookie,
            "event_id": "NewVip_JBeanTask_XSTaskFloorExpo",
            "page_name": "https://jdbeantask-pro.pf.jd.com/",
            "page_param": "source=JBean&ubb_loc=app.myjbean.my-put.yz-my-put&ubb_info=eyJwIjoiYnRwIn0%3D",
            "json_param": "{\"status\":1,\"taskid\":\"410\",\"is_content_open\":\"\"}",
        })
        await this.report({
            cookie,
            "event_id": "NewVip_JBeanTask_TabExpo",
            "page_param": "source=JBean&ubb_loc=app.myjbean.my-put.yz-my-put&ubb_info=eyJwIjoiYnRwIn0%3D",
            "json_param": "[{\"sectabname\":\"1\"},{\"sectabname\":\"2\"},{\"sectabname\":\"3\"}]",
        })
        await this.report({
            cookie,
            "event_id": "NewVip_JBeanTask_ChildTaskExpo",
            "page_name": "https://jdbeantask-pro.pf.jd.com/",
            "page_param": "source=JBean&ubb_loc=app.myjbean.my-put.yz-my-put&ubb_info=eyJwIjoiYnRwIn0%3D",
            "json_param": "{\"taskstatus\":0,\"taskid\":\"21\",\"is_content_open\":\"0\"}",
        })
        let bean = 0
        if (!this.haskey(l, 'data.floorInfoList')) {
            console.log("没有获取到数据")
        }
        for (let i of this.haskey(l, 'data.floorInfoList')) {
            await this.wait(1000)
            if (i.title == '轻松赚豆') {
                let token = i.token
                for (let j of this.haskey(i, 'floorData.pgTaskListVO.taskInfoList')) {
                    if (j.taskStatus != 3) {
                        console.log("正在浏览:", j.name)
                        if (j.name == '领取下单任务') {
                            continue
                        }
                        else {
                            let z = await this.wget({
                                    body: {
                                        "floorToken": token,
                                        "dataSourceCode": "taskReceive",
                                        "argMap": {"launchChannel": "APP", "channel": "", "taskEncId": j.taskEncId}
                                    },
                                    cookie,
                                    algo: {
                                        appId: 'a7c04'
                                    }
                                }
                            )
                            await this.report(
                                {
                                    cookie,
                                    "event_id": "NewVip_JBeanTask_RelaxTaskButton",
                                    "psn": "102e084dd630eb7a4cb6e8651ed23deac1a2e067|1482",
                                    "psq": "1",
                                    "page_id": "NewVip_JBeanTask",
                                    "page_name": "https://jdbeantask-pro.pf.jd.com/",
                                    "page_param": "source=JBean&ubb_loc=app.myjbean.my-put.yz-my-put&ubb_info=eyJwIjoiYnRwIn0%3D",
                                    "json_param": `{\"taskid\":\"${j.taskId}\",\"button_sort\":\"0\"}`,
                                }
                            )
                            let id = this.haskey(j, 'browseInfoVO.browsePageVOS.0.id') || 0
                            let y = await this.wget({
                                    body: {
                                        "floorToken": token,
                                        "dataSourceCode": "taskFinish",
                                        "argMap": {
                                            "launchChannel": "APP",
                                            "channel": "",
                                            "taskEncId": j.taskEncId,
                                            "extParamsStr": {"browseTrxId": id}
                                        }
                                    },
                                    cookie,
                                    algo: {
                                        appId: 'a7c04'
                                    }
                                }
                            )
                            // console.log(y)
                            let d = await this.wget({
                                    body: {
                                        "floorToken": token,
                                        "dataSourceCode": "taskReward",
                                        "argMap": {"launchChannel": "APP", "channel": "", "taskEncId": j.taskEncId}
                                    },
                                    cookie,
                                    algo: {
                                        appId: "a7c04"
                                    },
                                    taskId: j.taskId
                                }
                            )
                            await this.report(
                                {
                                    cookie,
                                    "event_id": "NewVip_JBeanTask_RelaxTaskButton",
                                    "psq": "1",
                                    "page_param": "source=JBean&ubb_loc=app.myjbean.my-put.yz-my-put&ubb_info=eyJwIjoiYnRwIn0%3D",
                                    "json_param": `{\"taskid\":\"${j.taskId}\",\"button_sort\":\"1\"}`,
                                }
                            )
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
            }
            else if (i.title == '多买多赚') {
            }
            else if (i.name == '签到活动') {
                console.log("签到中...")
                let sign = await this.wget({
                        body: {
                            "floorToken": i.token,
                            "dataSourceCode": "signIn",
                            "argMap": {"currSignCursor": i.floorData.signActInfo.currSignCursor, "signActId": i.id},
                            "riskInformation": {}
                        },
                        cookie,
                        algo: {
                            appId: 'a7c04'
                        }
                    }
                )
                await this.report(
                    {
                        cookie,
                        "event_id": 'NewVip_JBeanTask_Sign',
                        "json_param": "{\"touchstone_expids\":\"\",\"chid\":\"\",\"type\":\"1\",\"days\":3,\"mkt_comp_un\":{\"et\":\"1\",\"lpid\":\"\",\"cid\":\"2030\",\"fid\":\"583\",\"ext\":{\"eid\":\"NewVip_JBeanTask_Sign\"},\"det\":{\"recomInfo\":\"\"},\"rid\":\"1711716420495_lheih88l808m98khnlkk2d429h0chk4d\"}}",
                    }
                )
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

    async report(p) {
        let cookie = p.cookie
        let ts = new Date().getTime().toString()
        let token = this.md5(ts + "5YT%aC89$22OI@pQ")
        let pin = this.userPin(cookie) 
        let json = {
            "pin_sid": "",
            "report_ts": ts,
            "scr": "375x667",
            "token": token,
            "ut": "s",
            "clt": "web",
            "jvr": "3.0.12",
            "std": "MO-J2011-1",
            "tpc": "traffic-jdm.pv",
            "uuid": "17117955240101769146964",
            "cli": "IOS-M",
            "osv": "",
            "uid": "",
            "biz": "mba",
            "mba_muid": "17117955240101769146964",
            "mba_sid": "385",
            "proj_id": "3",
            "reserved3": "122270672.17117955240101769146964.1711795524.1712169759.1712195430.24_122270672_kong_t_1000089893_157_0_184__b2ae442ca482f114_tuiguang_b112034a28854591a73d2ff9a363eaaf_1712157229000_122270672.3.17117955240101769146964_24.1712195430__122270672.3.17117955240101769146964_24.1712195430___JF8EALBnNSttC0tUBhoAHkITQlRQW1kAS0cFbTIGAwpQG1YCGVZLQkd7XlVdWBRKEh9uZRRXX1NLVg4eCysiEEpcVV9UAEIfAV9nAVIzWSVUDB5sdUETGwlRW15aGxIKbDAFVFhoe1cFKwMrEhdCVVFdWg9IHwtvYAZUWF5OXQcfMhoiEENZZG5tDE0UBWtmBFVeaEpkBCtJdRNdS1pdVlgLTBAAZ28FU15YTlIAEgAfIhF7Xg",
            "osp": "iphone",
            "data": [{
                "ma_route_ready": "1",
                "ma_log_id": "17117955240101769146964-1712196731685-388281",
                "ref": "JingDou_Detail_Contrller",
                "ctm": new Date().getTime().toString(),
                "pin": pin,
                "ctp": "https://jdbeantask-pro.pf.jd.com/",
                "par": "source=JBean&ubb_loc=app.myjbean.my-put.yz-my-put&ubb_info=eyJwIjoiYnRwIn0%3D",
                "usc": "kong",
                "umd": "tuiguang",
                "utr": "b112034a28854591a73d2ff9a363eaaf",
                "ucp": "t_1000089893_157_0_184__b2ae442ca482f114",
                "jdv": "122270672|kong|t_1000089893_157_0_184__b2ae442ca482f114|tuiguang|b112034a28854591a73d2ff9a363eaaf|1712157229000",
                "vts": 24,
                "seq": 3,
                "browser_ver": "0",
                "browser": "JDAPP",
                "fst": 1711795524,
                "pst": 1712169759,
                "vct": 1712195430,
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
                "pap": `JA2015_311210|${this.clientVersion}|IOS`,
                "typ": "pv",
                "lgt": "pv",
                "ref_cls": "NewVip_JBeanTask_ChildTaskExpo",
                "apv": this.clientVersion,
                "mba_seq": "12",
                "mba_finger": "v001eyJhIjp7ImptYWZpbmdlciI6IkpEMDExMWQ0N2RQdTZVREFXSlVSMTcxMjE5NjcyNTUxNjAzTmJOYnc0OXp5LWVrWjk5MXJKYnFkUjMyd2JzTVlwZ19iOUhPUnBBaU1EeENsUC1YRzVDVXBmVXNSb3IxMGE4RW8tcmNaRldRUm5WVktuSmFTOGRQcEljaXplcEh5bTRnNEpVOElHNDBXLUEwemVyOWh1fkJBcFhlU1NMRHBldEQ1b0FZdjVIZVg4aUYzNV9lMkdQbi00UGo1MGhYOXhKMVBkWmZRckRqa3o3ZnFDVDBJSWRCWVZ2VFpxVG4iLCJkZXZpY2VmaW5nZXIiOiJlaWRJZDU1MDgxMjFlM3M3R2NkRHdyQ1NTT2UvR0xVc2JqS1kzaG5IUlVtV2dCWU5yNkNOTElnNDBtc1JweElCdWlaNVZGazA1MnhpQ09TSE9Kd3RCNThuNk9CemhKV1hsNkNQZGo0Sjdoakp4bjZVdUhOcCIsImpka2V5IjoiMTAyZTA4NGRkNjMwZWI3YTRjYjZlODY1MWVkMjNkZWFjMWEyZTA2NyJ9LCJiIjoiYzAxMzJlOTYtNzcxZS03YWU0LTY1YzMtMGVkZTRkNmZiNjE4LTE2Nzg4OTQ4MzQiLCJjIjoiQkFwWGVTU0xEcGV0RDVvQVl2NUhlWDhpRjM1X2UyR1BuLTRQajUwaFg5eEoxUGRaZlFyRGprejdmcUNUMElJZEJZVnZUWnFUbiIsImQiOiJpUGhvbmUiLCJnIjowLCJoIjoiIiwiaSI6MCwibCI6IjBkYzRlOWU5MjYwM2IzMjc0OWUwMDYzNDY3ZTU3ZjEzIiwibSI6IiIsIm4iOiIiLCJvIjowLCJxIjoiQXNpYS9TaGFuZ2hhaSIsInIiOmZhbHNlLCJzIjpmYWxzZSwidCI6dHJ1ZSwidSI6ZmFsc2UsInYiOiIzNzU7NjY3IiwicF93cnIiOjAsInBfcGwiOjAsInBfbG4iOjEsInBfb2giOjYwMywicF9vdyI6Mzc1LCJwX2VsIjozNywicF9hdm4iOiI1LjA7YXBwQnVpbGQvMTY5MTc1O2pkU3VwcG9ydERhcmtNb2RlLzA7ZWYvMTtlcC8lN0IlMjJjaXBoZXJ0eXBlJTIyJTNBNSUyQyUyMmNpcGhlciUyMiUzQSU3QiUyMnVkJTIyJTNBJTIyQ0pLeVpKSzREUUh1RHRDbVpXUzNZSkh0WXRadkVOWTFDV1Z1Q3REdVpXUHRDV095WkpLMkRtJTNEJTNEJTIyJTJDJTIyc3YlMjIlM0ElMjJDSlVrRHk0MSUyMiUyQyUyMmlhZCUyMiUzQSUyMiUyMiU3RCUyQyUyMnRzJTIyJTNBMTcxMjE5NjczMCUyQyUyMmhkaWQlMjIlM0ElMjJKTTlGMXl3VVB3Zmx2TUlwWVBvazB0dDVrOWtXNEFySkVVM2xmTGh4QnF3JTNEJTIyJTJDJTIydmVyc2lvbiUyMiUzQSUyMjEuMC4zJTIyJTJDJTIyYXBwbmFtZSUyMiUzQSUyMmNvbS4zNjBidXkuamRtb2JpbGUlMjIlMkMlMjJyaWR4JTIyJTNBLTElN0Q7TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxNV83XzUgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBNb2JpbGUvMTVFMTQ4O3N1cHBvcnRKRFNIV0svMTsiLCJwX2NlZCI6MSwicF9oYmEiOm51bGwsInBfaWFlIjpudWxsLCJwX3ZkciI6IkFwcGxlIENvbXB1dGVyLCBJbmMuIiwicF9tdHAiOjUsInBfaGN5Ijo0LCJwX25lIjoiMCIsImFyIjoxMjcsInZjIjoiQXBwbGUgR1BVIiwiYmFfc3QiOjEsImJhX2xlIjoiIn0=",
                "fpstime": 2,
                "fpftime": 45,
                "psn": "102e084dd630eb7a4cb6e8651ed23deac1a2e067|1506",
                "psq": "1",
                "page_id": "NewVip_JBeanTask",
                "page_param": "{\"source\":\"JBean\"}",
                "event_param": "",
                "pv_sid": "385",
                "pv_seq": "12",
                "ma_is_sparse": "0",
                "ma_b_group": "-1",
                "ma_refer": "{\"ma_pg_refer\":\"JingDou_Detail\",\"ma_et_refer\":\"JingDouBuy_FloorEntrance1\"}",
                "unpl": "JF8EALBnNSttC0tUBhoAHkITQlRQW1kAS0cFbTIGAwpQG1YCGVZLQkd7XlVdWBRKEh9uZRRXX1NLVg4eCysiEEpcVV9UAEIfAV9nAVIzWSVUDB5sdUETGwlRW15aGxIKbDAFVFhoe1cFKwMrEhdCVVFdWg9IHwtvYAZUWF5OXQcfMhoiEENZZG5tDE0UBWtmBFVeaEpkBCtJdRNdS1pdVlgLTBAAZ28FU15YTlIAEgAfIhF7Xg",
                "mjds": "",
                "mode_tag": "0"
            }]
        }
        json = {...json, ...p};
        let r = await this.curl({
                'url': `https://uranus.jd.com/log/m?std=MO-J2011-1`,
                json,
                cookie,
                delay: 100
            }
        )
    }

    async wget(p) {
        let fn = p.fn || 'pg_interact_interface_invoke'
        let d = await this.algo.curl({
                'url': `http://api.m.jd.com/`,
                'form': `functionId=${fn}&appid=jd-bean-task&body=${this.dumps(p.body)}`,
                cookie: p.cookie,
                algo: p.algo || {
                    appId: 'a7c04'
                }
            }
        )
        return d
    }
}

module.exports = Main;
