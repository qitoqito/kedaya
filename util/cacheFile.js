var cc = require('node-file-cache')

class cacheFile {
    constructor(params = {}) {
        // console.log(process)
        params.life = parseInt(params.expire || params.life || 86400 * 30)
        if (params.name && !params.file) {
            params.file = `${process.communal.dirname}/temp/${params.name}.json`
        }
        this._cache = cc.create(params)
    }

    async get(key) {
        return this._cache.get(key)
    }

    async set(key, value, expire = 0) {
        let params = expire ? {life: parseInt(expire)} : {}
        this._cache.set(key, value, params)
    }

    async close() {
        // this._cache.close()
    }
}

module.exports = cacheFile;
