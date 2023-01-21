import React from 'react';
import PropTypes from 'prop-types';

// import styled from 'styled-components';
import { Box, Typography, Link } from '@material-ui/core';
import Markdown from 'markdown-to-jsx';

// TODO: colors textSecondary black54
const Title = ({ children, truncate, secondary }) => {
    return (
        <Box flexGrow={1} pr={2}>
            <Typography
                variant='subtitle2'
                noWrap={truncate}
                color={secondary ? 'textSecondary' : 'textPrimary'}>
                {children}
            </Typography>
        </Box>
    );
};

Title.propTypes = {
    truncate: PropTypes.bool,
    secondary: PropTypes.bool,
    children: PropTypes.node.isRequired,
};

Title.defaultProps = {
    truncate: true,
    secondary: false,
};

const overrides = {
    a: { component: Link },
    p: { component: Typography },
    /* table: { component: Table },
      td: { component: TableCell },
      tbody: { component: TableBody },
      tfoot: { component: TableFooter },
      th: { component: TableCell },
      thead: { component: TableHeader },
      tr: { component: TableRow }, */
};

const Description = ({ children }) => (
    <Markdown options={{ overrides }}>{children}</Markdown>
);

Description.propTypes = {
    children: PropTypes.element,
};

Description.defaultProps = {
    children: '',
};

// TODO: colors error red500
const ErrorMessage = ({ children }) => {
    return (
        <Box flexGrow={1} mt={1}>
            <Typography variant='caption' color='error'>
                {children}
            </Typography>
        </Box>
    );
};

ErrorMessage.propTypes = {
    children: PropTypes.node.isRequired,
};

ErrorMessage.defaultProps = {};
/*
const ErrorMessage = styled.p`
    color: var(--red500);
    font-size: 12px;
    margin: 10px 0 0 0;
    text-align: left;
    width: 100%;
    word-break: break-word;
`;
*/
/*
const Title = styled(Typography)`
    ${textOverflow}

    flex-grow: 1;
    font-family: ${(props) => props.theme.typography.fontFamily};
    font-size: 13px;
    line-height: 24px;
    margin: 0;
    padding-right: 12px;
    text-align: left;

    ${(props) =>
        props.hook &&
        `
      color: ${props.theme.color.black54};
    `}

    ${(props) =>
        props.expanded &&
        `
      line-height: 1.5;
      padding-top: 3px;
      white-space: normal;
    `}
`;
*/
export { Title, Description, ErrorMessage };
