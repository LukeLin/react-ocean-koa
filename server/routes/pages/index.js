export default function(router) {
    /**
     * 首页路由
     * @param  {Function} Router
     * @return {Function}
     */
    router.get('/', function* () {
        yield this.render('index');
    });

    router.get('*', function* () {
        yield this.render('index');
    });

    return router.routes();
}
