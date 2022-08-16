function Cache() {
}

try {
    var redis = require("redis");
    var cli = process.communal.redisCli
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
} catch (e) {
    try {
        var config = require("../config/config");
        var c = config.redis
    } catch (ee) {
    }
}
try {
    if (cli.version == "4.0") {
        let client = redis.createClient({
            url: `redis://${c.user}:${c.password}@${c.host}:${c.port}/${c.db}`
        });
        client.on("error", function(err) {
            console.log(err);
        });
        Cache.connect = async function() {
            await client.connect();
        }
        Cache.set = async function(key, value) {
            return await client.set(key, JSON.stringify(value));
        };
        Cache.expire = async function(key, time) {
            return await client.expire(key, time);
        };
        Cache.get = async (key) => {
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
            await client.on("connect", function(res) {
            });
        }
        Cache.set = async function(key, value) {
            return client.set(key, JSON.stringify(value));
        };
        Cache.get = async (key) => {
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
} catch (e) {
    Cache.connect = function() {
    }
}
module.exports = Cache;
