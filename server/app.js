import Koa from 'koa';
import Router from 'koa-router';
import serveStatic from 'koa-static';
import koaCompress from 'koa-compress';
import zlib from 'zlib'
import views from 'koa-views';
import cors from 'koa-cors';
import logger from 'koa-logger';
import json from 'koa-json'
import bodyParser from 'koa-bodyparser';
import routes from './routes/pages';
import socketIO from 'socket.io';
import sockets from './sockets';
import path from 'path';
import http from 'http';

const app = new Koa();

app.use(logger());
app.use(cors());
app.use(convert(json()))
app.use(bodyParser());
app.use(koaCompress({ flush: zlib.Z_SYNC_FLUSH }));
app.use(views('views', {
    root: __dirname + '/views',
    default: 'ejs'
}));

app.use(async (next) => {
    var start = new Date;
    await next();
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
});

app.use(serveStatic('./public'));

app.use(routes(new Router()));

// 404
app.use(async (ctx) => {
    ctx.status = 404;
    await ctx.render('404')
})

app.on('error', function (err, ctx) {
    logger.error('server error', err, ctx);
});

const port = parseInt(config.port || '3000');
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
