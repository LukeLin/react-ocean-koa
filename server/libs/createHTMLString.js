import ejs from 'ejs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import fs from 'fs';
// for xss protection
import SecureFilters from 'secure-filters';

import configureStore from '../../common/store/index';
import App from '../../common/App.jsx';
import config from '../config/config.json';

const defaultTemplate = fs.readFileSync(__dirname + '/../views/index.html', 'utf8');

export default function reactRender(middlewareConfig = {}) {
    return async function(ctx, next){
        ctx.renderReactHTML = function(opts = {}){
            let {
                template = '',
                component = '',
                data = {},
                rootReducer = (() => {}),
                locals = {},
                pageConfig = {},
                needTransform = true
            } = opts;
            let transformedData = (typeof middlewareConfig.transformer === 'function' && needTransform)
                ? middlewareConfig.transformer(data) : data;
            let store = configureStore(transformedData, rootReducer);
            let html = '';
            try {
                html = renderToString((
                    <Provider store={ store }>
                        <App>
                            { component }
                        </App>
                    </Provider>
                ));
            } catch (ex) {
                html = 'internal server error: \n' + ex.message;
                console.error(ex.message);
            }

            let debug = ctx.query.debug && (ctx.query.debug === config.application.debugName);
            let state = SecureFilters.jsObj(data);
            let version = config.application.version;
            let jsVersion = process.env.NODE_ENV === 'production' && version && version.js || '';
            jsVersion = jsVersion ? `app-${ jsVersion }` : 'app';
            template = template || middlewareConfig.defaultTemplate || defaultTemplate;

            let finalLocals = Object.assign({
                html: html,
                state: state,
                appName: 'index',
                title: '',
                test: process.env.NODE_ENV !== 'production',
                debug: debug,
                appConfig: SecureFilters.jsObj(pageConfig),
                version: {
                    js: jsVersion,
                    css: version && version.css
                }
            }, typeof middlewareConfig.locals === 'object' && middlewareConfig.locals, locals);

            let pageStr = ejs.render(template, finalLocals, {
                compileDebug: false
            });

            ctx.status = 200;
            ctx.body = pageStr;
        };

        await next();
    };
}
