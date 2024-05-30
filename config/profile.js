module.exports = {
    keywords: ['model', 'task', 'thread', 'help', 'exit', 'limit', 'except', 'reward', 'loop', 'interval', 'cron', 'expand', 'custom', 'turn', 'endTime', 'send', 'work', 'msgNum', 'msgTotal', 'msgExcept', 'msgWork', 'count', 'proxy', 'timeout', 'skip', 'aid', 'hideCode', 'timer', 'delay', 'urlProxy', 'proxyUrl', 'proxyInterval', 'proxyProtocol', 'proxyVerify', 'proxyRetry'],
    userRegular: {
        'jd': /pin=([^;]+)/,
        'kejiwanjia': [/pin=([^;]+)/, /username=([^;]+)/],
        'baidu': /pin=([^;]+)/,
        'smzdm': /pin=([^;]+)/,
    },
    communal: ['options', 'curl', 'jsonParse', 'uuid', 'response', 'location', 'dumps', 'loads', 'match', 'matchAll', 'md5', 'unique', 'rand', 'random', 'compact', 'column', 'wait', 'query', 'sha1', 'md5', 'sha256', 'hmacsha256', 'query', 'haskey', 'type', 'parseIni', 'redisCli', 'fileCache', 'userAgents', 'userName', 'userPin', 'userDict', 'userRegular', 'urlProxy', 'proxyRow', 'proxyList', 'delay', 'proxy', 'clientUa', 'QITOQITO_JDSIGN', 'JD_SIGN_API', 'JD_SIGN_KRAPI'],
    timerRegular: {
        jd: {
            wait: 120,
            rule:
                {
                    'url':
                        'https://api.m.jd.com/client.action?functionId=jdDiscoveryRedPoint&body=%7B%7D&uuid=487f7b22f68312d2c1bbc93b1&client=apple&clientVersion=10.0.10&st=1677768101596&sv=120&sign=fbaf17e9b2a79543cd3e296665517fb5',
                    'haskey':
                        'time'
                }
        }
    },
    verifyUrl: 'https://api.m.jd.com/client.action?functionId=queryMaterialProducts&client=wh5',
    unionId: 'kbDf60q',
    unionShareId: ['FLp5i']
}
