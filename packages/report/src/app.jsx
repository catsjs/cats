import React from 'react';
import ReactDOM from 'react-dom';
import HtmlReport from './components/base/HtmlReport';

const bodyEl = document.querySelector('body');
const data = JSON.parse(bodyEl.getAttribute('data-raw'));
const config = JSON.parse(bodyEl.getAttribute('data-config'));
bodyEl.removeAttribute('data-raw');
bodyEl.removeAttribute('data-config');

ReactDOM.render(
    React.createElement(HtmlReport, { data, config }),
    document.getElementById('report')
);
