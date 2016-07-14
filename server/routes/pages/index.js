export default function(router) {
    /**
     * 首页路由
     * @param  {Function} Router
     * @return {Function}
     */
    router.get('/', async function (ctx, next) {
        const title = 'koa2 title';

        await ctx.render('index', {
            title
        })
    });

    router.get('*', async function (ctx) {
        ctx.body = 'test';
    });

    return router.routes();
}
