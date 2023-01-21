import { createMuiTheme } from '@material-ui/core/styles';

// eslint-disable-next-line no-unused-vars
import roboto from 'typeface-roboto';

import baseTheme from './base';
import mochawesomeTheme from './mochawesome';
import apispecTheme from './apispec';

const base = createMuiTheme(baseTheme);
const mochawesome = createMuiTheme(mochawesomeTheme);
const apispec = createMuiTheme(apispecTheme);

export { base, mochawesome, apispec };
