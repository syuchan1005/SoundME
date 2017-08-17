var ORIGIN = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
var version = 1;
var cacheName = 'soundme_static_' + version;

var files = [
    '/',
    '/reset.css',
    '/js/jquery.particleground.min.js',
    '/js/sha256.js'
];

var ex_files = [
    {file: 'top.css', ok: false},
    {file: 'notosansjapanese.css', ok: false},
    {file: 'NotoSansJP-Regular.woff2', ok: false}
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            var promises = [];
            files.map(function (url) {
                promises.push(fetch(ORIGIN + url).then(function (response) {
                    if (response.ok) return cache.put(response.url, response);
                    return Promise.reject('Invalid response.  URL:' + response.url + ' Status: ' + response.status);
                }));
            });
            for (var f of ex_files) {
                if (ex_files.url) {
                    promises.push(fetch(ex_files.url).then(function (response) {
                        if (response.ok) return cache.put(response.url, response);
                        return Promise.reject('Invalid response.  URL:' + response.url + ' Status: ' + response.status);
                    }));
                }
            }
            return Promise.all(promises);
        })
    );
});

self.addEventListener('fetch', function (event) {
    var path = new URL(event.request.url).pathname;
    var name = path.split("/").pop();
    if (files.includes(path)) {
        event.respondWith(caches.match(event.request, {cacheName: cacheName}));
    } else {
        for (var file of ex_files) {
            if (file.file === name) {
                if (file.ok && file.url === event.request.url) {
                    event.respondWith(caches.match(event.request, {cacheName: cacheName}));
                } else {
                    caches.open(cacheName).then(function (cache) {
                        fetch(event.request.url).then(function (response) {
                            if (response.ok) {
                                cache.put(response.url, response);
                                file.url = response.url;
                                file.ok = true;
                            }
                        })
                    });
                }
                break;
            }
        }
    }
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            var promises = [];
            keys.forEach(function (oldCacheName) {
                if (oldCacheName !== cacheName) promises.push(caches.delete(oldCacheName));
            });
            return Promise.all(promises);
        }));
});