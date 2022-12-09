module.exports = {
    keywords: ['model', 'task', 'thread', 'help', 'exit', 'limit', 'except', 'reward', 'loop', 'interval', 'cron', 'expand', 'custom', 'turn', 'endTime', 'send', 'work', 'msgNum', 'msgTotal', 'msgExcept', 'msgWork', 'count', 'proxy', 'timeout', 'skip', 'aid', 'hideCode', 'timer'],
    userRegular: {
        'jd': /pin=([^;]+)/,
        'kejiwanjia': [/pin=([^;]+)/, /username=([^;]+)/],
        'baidu': /pin=([^;]+)/,
    },
    communal: ['options', 'curl', 'jsonParse', 'uuid', 'response', 'location', 'dumps', 'loads', 'match', 'matchAll', 'md5', 'unique', 'rand', 'random', 'compact', 'column', 'wait', 'query', 'sha1', 'md5', 'sha256', 'hmacsha256', 'query', 'haskey', 'type', 'parseIni', 'redisCli', 'fileCache'],
    timerRegular: {
        jd: {
            wait: 120,
            rule:
                {
                    'url':
                        'https://api.m.jd.com/client.action?functionId=queryMaterialProducts&client=wh5',
                    'haskey':
                        'currentTime2'
                }
        }
    },
    getUa: function(type = '') {
        let dict = {
            A: 'K',
            B: 'L',
            C: 'M',
            D: 'N',
            E: 'O',
            F: 'P',
            G: 'Q',
            H: 'R',
            I: 'S',
            J: 'T',
            K: 'A',
            L: 'B',
            M: 'C',
            N: 'D',
            O: 'E',
            P: 'F',
            Q: 'G',
            R: 'H',
            S: 'I',
            T: 'J',
            e: 'o',
            f: 'p',
            g: 'q',
            h: 'r',
            i: 's',
            j: 't',
            k: 'u',
            l: 'v',
            m: 'w',
            n: 'x',
            o: 'e',
            p: 'f',
            q: 'g',
            r: 'h',
            s: 'i',
            t: 'j',
            u: 'k',
            v: 'l',
            w: 'm',
            x: 'n'
        }
        let sv = `${this.random([14, 15], 1)}.${this.random([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 1)}.${this.random([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 1)}`
        let a = {
            "ciphertype": 5,
            "cipher": {"ud": "", "sv": "", "iad": ""},
            "ts": parseInt(new Date().getTime() / 1000),
            "hdid": "JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw=",
            "version": "1.0.3",
            "appname": "com.360buy.jdmobile",
            "ridx": -1
        }
        a.cipher.sv = new Buffer.from(sv).toString('base64').split("").map(d => dict[d] || d).join("")
        a.cipher.ud = new Buffer.from(this.uuid(40)).toString('base64').split("").map(d => dict[d] || d).join("")
        return `jdapp;iPhone;11.3.0;;;M/5.0;JDEbook/openapp.jdreader;appBuild/168341;jdSupportDarkMode/0;ef/1;ep/${encodeURIComponent(this.dumps(a))};Mozilla/5.0 (iPhone; CPU iPhone OS ${sv.replace(/\./g, '_')} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;`
    }
}
