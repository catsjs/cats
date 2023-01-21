import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import {
    Box,
    Typography,
    Card as MuiCard,
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

export const Card = styled(MuiCard)`
    ${(props) =>
        props.raised &&
        css`
            margin-top: ${props.theme.spacing(6)}px;
            padding-left: ${props.theme.spacing(0, 2, 0, 0)};
        `};

    ${(props) =>
        !props.raised &&
        css`
            box-shadow: none;
            border-top: 1px solid ${props.theme.palette.divider};
            border-left: 1px solid ${props.theme.palette.divider};
            border-bottom: 1px solid ${props.theme.palette.divider};
            margin: ${props.theme.spacing(0, 0, 2, 2)};
        `};
`;

export const TestContainer = styled(Box)`
    border-top: 1px solid black;
`;

export const Title = ({ title }) => (
    <Typography variant='h5'>{title}</Typography>
);

Title.propTypes = {
    title: PropTypes.string,
};

Title.defaultProps = {
    title: '',
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

export const Description = ({ description }) => (
    <Markdown options={{ overrides }}>{description}</Markdown>
);

Description.propTypes = {
    description: PropTypes.string,
};

Description.defaultProps = {
    description: '',
};

export const CardContent = ({ children }) => (
    <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        p={2}
        pt={1}
        pr={1}>
        {children}
    </Box>
);

CardContent.propTypes = {
    children: PropTypes.node.isRequired,
};

export const CardActions = ({ children }) => (
    <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        pl={2}
        pr={0.5}
        pt={0}
        pb={1}
        mt={-1}>
        {children}
    </Box>
);

CardActions.propTypes = {
    children: PropTypes.node.isRequired,
};
