import Koa from 'koa';
import Router from 'koa-router';
import serveStatic from 'koa-static';
import koaCompress from 'koa-compress';
import zlib from 'zlib'
import render from 'koa-ejs';
import cors from 'koa-cors';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import routes from './routes/pages';
import socketIO from 'socket.io';
import sockets from './sockets';
import path from 'path';
import http from 'http';

const app = new Koa();

app.use(logger());
app.use(cors());
app.use(bodyParser());
app.use(koaCompress({ flush: zlib.Z_SYNC_FLUSH }));

app.use(serveStatic('./public'));

render(app, {
    root: path.join(__dirname, 'views'),
    layout: false,
    viewExt: 'html',
    debug: false,
    cache: true
});

app.use(routes(new Router()));

app.on('error', error=>{
    console.error(error);
});

const server = http.createServer(app.callback());
const io = socketIO(server);
sockets(io);

app.listen(3000, '127.0.0.1', ()=>{
    console.log('server listen');
});
