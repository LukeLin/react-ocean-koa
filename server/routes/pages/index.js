import React from 'react';
import rootReducer from '../../../common/pages/index/indexReducers';
import Page from '../../../common/pages/index';

let fakeData = {
    visibilityFilter: 'SHOW_ALL',
    todos: [
        {
            text: 'one',
            completed: false
        },
        {
            text: 'two',
            completed: true
        }
    ]
};

export default function (ctx, next) {
    ctx.renderReactHTML({
        component: <Page/>,
        locals: {
            appName: 'index',
            title: 'index page'
        },
        data: fakeData,
        rootReducer
    });
};
