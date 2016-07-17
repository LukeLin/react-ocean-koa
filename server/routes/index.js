import IndexPage from './pages/index';

export default function(router) {
    /**
     * 首页路由
     * @param  {Function} Router
     * @return {Function}
     */
    router.get('/', IndexPage);

    router.get('*', async function (ctx) {
        ctx.body = 'test';
    });

    return router.routes();
}
