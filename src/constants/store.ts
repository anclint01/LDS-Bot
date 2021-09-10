const EventEmitter = require('events');
const JSONB = require('json-buffer');

export class Store extends EventEmitter {
    constructor(uri: any, opts ? : any) {
        super();
        this.opts = Object.assign({
                namespace: 'keyv',
                serialize: JSONB.stringify,
                deserialize: JSONB.parse
            },
            (typeof uri === 'string') ? {
                uri
            } : uri,
            opts
        );

        if (typeof this.opts.store.on === 'function') {
            this.opts.store.on('error', (err: any) => this.emit('error', err));
        }

        this.opts.store.namespace = this.opts.namespace;
    }

    _getKeyPrefix(key: string) {
        return `${this.opts.namespace}:${key}`;
    }

    values() {
        const {
            _cache
        } = this.opts.store;
        const values: {
            key: string,
            value: string
        } [] = [];
        return Promise.resolve()
            .then(() => {
                _cache.forEach((element: any, key: any) => {
                    let k = key.split(":")[1];
                    let data = (typeof element.value === 'string') ? this.opts.deserialize(element.value) : element.value;

                    if (data !== undefined && key !== undefined && data.value !== undefined) {
                        values.push({
                            key: k,
                            value: data.value
                        });
                    }
                });
                return values;
            })
            .then(data => {
                if (data === undefined) {
                    return undefined;
                }

                return data;
            });
    }

    get(key: string, opts ? : any) {
        const keyPrefixed = this._getKeyPrefix(key);
        const {
            store
        } = this.opts;
        return Promise.resolve()
            .then(() => store.get(keyPrefixed))
            .then(data => {
                return (typeof data === 'string') ? this.opts.deserialize(data) : data;
            })
            .then(data => {
                if (data === undefined) {
                    return undefined;
                }

                if (typeof data.expires === 'number' && Date.now() > data.expires) {
                    this.delete(key);
                    return undefined;
                }

                return (opts && opts.raw) ? data : data.value;
            });
    }

    size() {
        const {
            _cache
        } = this.opts.store;

        if (!_cache || !_cache.size) return undefined

        return _cache.size;
    }

    set(key: string, value: any, ttl ? : any) {
        const keyPrefixed = this._getKeyPrefix(key);
        if (typeof ttl === 'undefined') {
            ttl = this.opts.ttl;
        }

        if (ttl === 0) {
            ttl = undefined;
        }

        const {
            store
        } = this.opts;

        return Promise.resolve()
            .then(() => {
                const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : null;
                value = {
                    value,
                    expires
                };
                return this.opts.serialize(value);
            })
            .then(value => store.set(keyPrefixed, value, ttl))
            .then(() => true);
    }

    delete(key: string) {
        const keyPrefixed = this._getKeyPrefix(key);
        const {
            store
        } = this.opts;
        return Promise.resolve()
            .then(() => store.delete(keyPrefixed));
    }

    clear() {
        const {
            store
        } = this.opts;
        return Promise.resolve()
            .then(() => store.clear());
    }
}
