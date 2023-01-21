import React from 'react';
import PropTypes from 'prop-types';
import {
    createGlobalStyle,
    ThemeProvider as ScThemeProvider,
} from 'styled-components';
import {
    StylesProvider as MuiStylesProvider,
    ThemeProvider as MuiThemeProvider,
} from '@material-ui/core/styles';

import { CssBaseline, Box, Typography } from '@material-ui/core';

import StoreProvider from '../StoreProvider';
import Layout from './Layout';

const GlobalStyle = createGlobalStyle`
html {
  height: 100%;
}
  body {
    min-height: 100vh;
  }
  #report {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

const Report = ({
    data,
    config,
    theme,
    Navbar,
    Suites,
    Header,
    Loader,
    Footer,
    SuitePlaceHolder,
}) => {
    return (
        <MuiStylesProvider injectFirst>
            <MuiThemeProvider theme={theme}>
                <ScThemeProvider theme={theme}>
                    <StoreProvider data={data} config={config}>
                        <CssBaseline />
                        <GlobalStyle />
                        <Layout
                            Navbar={Navbar}
                            Suites={Suites}
                            Header={Header}
                            Loader={Loader}
                            Footer={Footer}
                            SuitePlaceHolder={SuitePlaceHolder}
                        />
                    </StoreProvider>
                </ScThemeProvider>
            </MuiThemeProvider>
        </MuiStylesProvider>
    );
};

Report.propTypes = {
    data: PropTypes.shape().isRequired,
    config: PropTypes.shape().isRequired,
    theme: PropTypes.shape().isRequired,
    Navbar: PropTypes.elementType.isRequired,
    Suites: PropTypes.elementType.isRequired,
    Header: PropTypes.elementType,
    Loader: PropTypes.elementType,
    Footer: PropTypes.elementType,
    SuitePlaceHolder: PropTypes.elementType,
};

Report.defaultProps = {
    Header: () => null,
    Loader: () => null,
    Footer: () => null,
    SuitePlaceHolder: () => (
        <Box my={4}>
            <Typography align='center'>No suites found</Typography>
        </Box>
    ),
};

Report.displayName = 'Report';

export default Report;
