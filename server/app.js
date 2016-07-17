import Koa from 'koa';
import Router from 'koa-router';
import serveStatic from 'koa-static';
import koaCompress from 'koa-compress';
import zlib from 'zlib'
import cors from 'koa-cors';
import logger from 'koa-logger';
import json from 'koa-json'
import bodyParser from 'koa-bodyparser';
import routes from './routes';
import socketIO from 'socket.io';
import sockets from './sockets';
import http from 'http';
import config from '../package.json';
import reactRender from './libs/createHTMLString';
import Immutable from 'immutable';
import path from 'path';

const app = new Koa();

// app.use(logger());
app.use(json());
app.use(bodyParser());
app.use(koaCompress({ flush: zlib.Z_SYNC_FLUSH }));

app.use(async (ctx, next) => {
    var start = new Date;
    await next();
    var ms = new Date - start;
    console.log('%s %s - %s', ctx.method, ctx.url, ms);
});

app.use(serveStatic(path.join(__dirname, '../public'), {
    maxage: 86400000
}));
app.use(reactRender({
    transformer(data){
        return Immutable.fromJS(data);
    }
}));
let router = new Router();
app.use(routes(router))
    .use(router.allowedMethods());

// 404
app.use(async (ctx) => {
    ctx.status = 404;
    await ctx.render('404')
});

app.on('error', function (err, ctx) {
    // logger.error('server error', err, ctx);
    console.error('server error', err, ctx)
});

const port = parseInt(config.port || '3333');
const server = http.createServer(app.callback());
const io = socketIO(server);
sockets(io);

server.listen(port);
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(port + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(port + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error
    }
});
server.on('listening', () => {
    console.log('Listening on port: %d', port)
});

export default app
