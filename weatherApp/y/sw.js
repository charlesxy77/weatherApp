const staticCachedName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v1';

const assets = [
    "/",
    "/index.html",
    "/main.css",
    "/main.js",
    "/manifest.webmanifest",
    "/mountain.png",
    "/icons"
];

// cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        })
    })
};

// install service worker
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCachedName).then(caches => {
            console.log('caching shell asset');
            caches.addAll(assets);
      })
    );
});

// activate service worker
self.addEventListener('activate', evt => {
    //console.log('service worker has been activated');
    evt.waitUntil(
        caches.keys().then(keys => {
            //console.log(keys);
            return Promise.all(keys
                 .filter(key => key !== staticCachedName && key !== dynamicCacheName)
                 .map(key => caches.delete(key))
                )
        })
    );
});

// fetch service worker
self.addEventListener('fetch', evt => {
    console.log('fetch event', evt);
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
                return cacheRes.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone());
                    limitCacheSize(dynamicCacheName, 6);
                    return fetchRes;
                })
            });
        })
    );
});

