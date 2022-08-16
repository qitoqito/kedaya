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
        (async () => {
            await client.connect();
        })();
        Cache.set = async function(key, value) {
            value = JSON.stringify(value);
            return await client.set(key, value);
        };
        Cache.expire = async function(key, time) {
            return await client.expire(key, time);
        };
        Cache.get = async (key) => {
            return await client.get(key);
        };
        Cache.close = async function() {
            return client.quit();
        }
    }
    else {
        var client = redis.createClient(c.port, c.host, c.options);
        client.on("error", function(err) {
            console.log(err);
        });
        let text = async (key) => {
            let doc = await new Promise((resolve) => {
                client.get(key, function(err, res) {
                    return resolve(res);
                });
            });
            return JSON.parse(doc);
        };
        Cache.set = function(key, value) {
            value = JSON.stringify(value);
            return client.set(key, value, function(err) {
                if (err) {
                    console.error(err);
                }
            });
        };
        Cache.get = async (key) => {
            return await text(key);
        };
        Cache.expire = function(key, time) {
            return client.expire(key, time);
        };
        Cache.close = async function() {
            return client.quit();
        }
    }
} catch (e) {
}
module.exports = Cache;
