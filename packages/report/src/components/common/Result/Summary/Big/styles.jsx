import React from 'react';
import PropTypes from 'prop-types';

import {
    Box,
    Typography,
    Link,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableFooter,
    TableRow,
    TableCell,
    Paper,
} from '@material-ui/core';
import Markdown from 'markdown-to-jsx';

export const Title = ({ children }) => (
    <Typography variant='h5'>{children}</Typography>
);

Title.propTypes = {
    children: PropTypes.string,
};

Title.defaultProps = {
    children: '',
};

const headings = [1, 2, 3, 4, 5, 6].reduce((obj, level) => {
    const result = { ...obj };
    result[`h${level}`] = {
        component: Typography,
        props: { variant: `h${level}` },
    };
    return result;
}, {});

const overrides = {
    a: { component: Link, props: { color: 'secondary' } },
    p: { component: Typography },
    // table: { component: Table, props: { size: 'small' } },
    table: {
        component: (props) => (
            <TableContainer
                component={Paper}
                variant='outlined'
                square
                elevation={0}>
                <Table size='small' {...props} />
            </TableContainer>
        ),
    },
    td: { component: TableCell },
    tbody: { component: TableBody },
    tfoot: { component: TableFooter },
    th: { component: TableCell },
    thead: { component: TableHead },
    tr: { component: TableRow },
    ...headings,
};

export const Description = ({ children }) => (
    <Markdown options={{ overrides }}>{children}</Markdown>
);

Description.propTypes = {
    children: PropTypes.string,
};

Description.defaultProps = {
    children: '',
};

// TODO: colors error red500
export const ErrorMessage = ({ children }) => {
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
