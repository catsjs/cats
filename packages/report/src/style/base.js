import { useState } from 'react';
import styled, { css } from 'styled-components';
import { media } from './theme';

export const useToggle = (initial) => {
    const [toggled, setToggle] = useState(initial);
    const toggle = () => {
        setToggle((prev) => !prev);
        return !toggled;
    };

    return [toggled, toggle];
};

export const clearfix = css`
    &:before {
        content: ' ';
        display: table;
    }

    &:after {
        content: ' ';
        display: table;
        clear: both;
    }
`;

const ButtonReset = styled.button`
    border: none;
    background: transparent;
    padding: 0;

    &:focus {
        box-shadow: 0 0 2px 0 ${(props) => props.theme.color.ltblue500};
        outline: none;
    }
`;

export const ButtonBase = styled(ButtonReset)`
    cursor: pointer;
    transition: ${(props) => props.theme.link.transition};
`;

const ColumnBase = styled.div`
    position: relative;
    min-height: 1px;
`;

export const Column = styled(ColumnBase)`
    padding-left: calc(${(props) => props.theme.grid.gutter.width} / 2);
    padding-right: calc(${(props) => props.theme.grid.gutter.width} / 2);
`;

export const Row = styled.div`
    ${clearfix}

    margin-left: calc(${(props) => props.theme.grid.gutter.width} / -2);
    margin-right: calc(${(props) => props.theme.grid.gutter.width} / -2);
`;

export const Container = styled.div`
    ${clearfix}

    margin-right: auto;
    margin-left: auto;
    padding-left: calc(${(props) => props.theme.grid.gutter.width} / 2);
    padding-right: calc(${(props) => props.theme.grid.gutter.width} / 2);

    ${media.greaterThan('small')`
        width: ${(props) => props.theme.container.sm.width};
    `}

    ${media.greaterThan('medium')`
        width: ${(props) => props.theme.container.md.width};
    `}

    ${media.greaterThan('large')`
        width: ${(props) => props.theme.container.lg.width};
    `}
`;

export const ListUnstyled = styled.ul`
    list-style: none;
    padding-left: 0;
`;

export const textOverflow = css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;
