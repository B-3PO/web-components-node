exports.memoize = fn => {
  return variadic.bind(
    this,
    fn,
    new Cache()
  );
};

function variadic(fn, cache) {
  const args = Array.prototype.slice.call(arguments, 2);
  const cacheKey = JSON.stringify(args);
  let computedValue = cache.get(cacheKey);
  if (typeof computedValue === 'undefined') {
    computedValue = fn.apply(this, args);
    cache.set(cacheKey, computedValue);
  }
  return computedValue;
}

class Cache {
  constructor() {
    this.cache = Object.create(null);
  }

  has(key) {
    return (key in this.cache);
  }

  get(key) {
    return this.cache[key];
  }

  set(key, value) {
    this.cache[key] = value;
  }
}
