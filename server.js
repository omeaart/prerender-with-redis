#!/usr/bin/env node

var config = require('./config')();
var prerender = require('./lib');

var server = prerender({
    workers: process.env.PRERENDER_NUM_WORKERS,
    iterations: process.env.PRERENDER_NUM_ITERATIONS
});

server.use(prerender.sendPrerenderHeader());

if (config.auth) {
	server.use(prerender.basicAuth());
}

if (config.logger) {
	server.use(prerender.logger());
}

server.use(prerender.blacklist());
server.use(prerender.removeScriptTags());

server.use(prerender.httpHeaders());
if (config.s3HtmlCache) {
	prerender.s3HtmlCache();
} else if (config.redis) {
	server.use(require('prerender-redis-cache'));
} else {
	server.use(prerender.inMemoryHtmlCache());
}

server.start();
