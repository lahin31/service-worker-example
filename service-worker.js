let cacheName = 'v1';
let cacheFiles = [
    './',
    './index.html',
    './script.js'
]

self.addEventListener('install', (e) => {
    console.log('ServiceWorker installed');
    e.waituntil(
        caches.open(cacheName).then((cache) => {
            console.log('ServiceWorker Caching CacheFiles');
            return cache.addAll(cacheFiles);
        })
    )
});

self.addEventListener('activate', (e) => {
    console.log('ServiceWorker activated');
    e.waituntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(cacheNames.map((thisCacheName) => {
                if(thisCacheName != cacheName) {
                    console.log('ServiceWorker removing cache filles from ', thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }))
        })
    )
});

self.addEventListener('fetch', (e) => {
    console.log('ServiceWorker, fetching ', e.request.url);
    e.respondWith(
        caches.match(e.request).then(response => {
            if(response) {
                console.log("ServiceWorker, found in the cache");
                return response;
            }
            let  requestClone = e.request.clone();
            fetch(requestClone).then(response => {
                if(!response) {
                    console.log('ServiceWorker, no response from fetch');
                    return response;
                }
                let responseClone = response.clone();
                caches.open(cacheName).then(cache => {
                    cache.put(e.request, responseClone);
                    return response;
                })
            })
            .catch(err => {
                console.log('ServiceWorker, error fetching and caching data ', err);
            })
        })
    )
})