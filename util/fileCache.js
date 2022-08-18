function Cache() {
}

var fileCache = process.communal.fileCache
if (fileCache.type == "redis") {
    var cli = process.communal.redisCli
    var redis = require("redis");
    var c = {
        port: cli.port,
        host: cli.host,
        options: {
            timeout: cli.timeout || 3000,
            password: cli.password || null
        },
        password: cli.password || "",
        user: cli.user || "",
        version: cli.version || "3.0",
        db: cli.db || "0"
    }
    if (cli.version == "4.0") {
        let client = redis.createClient({
            url: `redis://${c.user}:${c.password}@${c.host}:${c.port}/${c.db}`
        });
        client.on("error", function(err) {
            console.log(err);
        });
        Cache.connect = async function() {
            try {
                await client.connect();
            } catch (e) {
            }
        }
        Cache.set = async function(key, value, expire = 0) {
            var error = 0
            try {
                await client.connect();
            } catch (e) {
                error = 1
            }
            // if (!error) {
            //     await process.communal.wait(3000)
            // }
            await client.set(key, JSON.stringify(value));
            if (expire) {
                await client.expire(key, expire)
            }
        };
        Cache.expire = async function(key, time) {
            return await client.expire(key, time);
        };
        Cache.get = async (key) => {
            var error = 0
            try {
                await client.connect();
            } catch (e) {
                error = 1
            }
            // if (!error) {
            //     await process.communal.wait(3000)
            // }
            return process.communal.jsonParse(await client.get(key));
        };
        Cache.close = async function() {
            return await client.quit();
        }
    }
    else {
        var client = redis.createClient(c.port, c.host, c.options);
        client.on("error", function(err) {
            console.log(err);
        });
        Cache.connect = async function() {
            client = redis.createClient(c.port, c.host, c.options);
        }
        Cache.set = async function(key, value, expire = 0) {
            if (!client.connected) {
                // await process.communal.wait(3000)
                client = redis.createClient(c.port, c.host, c.options);
            }
            await client.set(key, JSON.stringify(value));
            if (expire) {
                await client.expire(key, expire)
            }
        };
        Cache.get = async (key) => {
            if (!client.connected) {
                // await process.communal.wait(3000)
                client = redis.createClient(c.port, c.host, c.options);
            }
            let doc = await new Promise((resolve) => {
                client.get(key, function(err, res) {
                    return resolve(res);
                });
            });
            return process.communal.jsonParse(doc);
        };
        Cache.expire = function(key, time) {
            return client.expire(key, time);
        };
        Cache.close = async function() {
            return await client.quit();
        }
    }
}
else {
    var cc = require('node-file-cache') 
    Cache.connect = async (params) => {
        if (cc.create) {
            cc = cc.create(params)
        }
    }
    Cache.get = async (key) => {
        return cc.get(key)
    }
    Cache.set = async (key, value, expire = 0) => {
        let params = expire ? {life: parseInt(expire)} : {}
        cc.set(key, value, params)
    }
    Cache.close = async () => {
        return
    }
}
module.exports = Cache;
