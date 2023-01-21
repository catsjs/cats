/* eslint-disable max-len, no-nested-ternary  */
import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { Accordion } from '@material-ui/core';

import { useToggle } from '../../../style/base';

export const STATUS = Object.freeze({
    ok: 'ok',
    warn: 'warn',
    error: 'error',
    neutral: 'neutral',
    disabled: 'disabled',
    none: 'none',
});

const StyledExpandable = styled(({ status, nested, ...props }) => (
    <Accordion {...props} />
))`
    ${({ status, theme }) =>
        status !== STATUS.none &&
        css`
            border-left: 3px solid
                ${() =>
                    status === STATUS.ok
                        ? theme.color.green500
                        : status === STATUS.error
                        ? theme.color.red500
                        : theme.color.grey500};
            background-color: ${() =>
                [STATUS.ok, STATUS.error].includes(status)
                    ? theme.color.white
                    : theme.color.grey50};
        `};

    ${({ nested, theme }) =>
        nested &&
        css`
            border-left: 1px solid ${theme.palette.divider};
            border-bottom: 1px solid ${theme.palette.divider};
            margin: ${theme.spacing(0, 0, 2, 2)};

            &.Mui-expanded {
                margin: ${theme.spacing(0, 0, 2, 2)};
            }
        `};

    box-shadow: none;

    &::before {
        display: none;
    }

    border-top: 1px solid ${({ theme }) => theme.palette.divider};

    &.Mui-expanded:not(:last-child) {
        border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    }

    &.MuiExpansionPanel-root.Mui-expanded {
        //margin: 0;
    }

    & .MuiAccordionSummary-root {
        align-items: flex-end;
        padding: 0;
    }
    & .MuiAccordionSummary-content {
        //padding-right: 48px;
        margin: ${({ theme }) => theme.spacing(1, 0, 1, 2)};
    }
    & .MuiAccordionSummary-expandIcon {
        margin: 0;
        //position: absolute;
        //bottom: 0;
        //right: 0;
    }

    &.Mui-disabled {
        background-color: ${({ status, theme }) =>
            [STATUS.ok, STATUS.error, STATUS.none].includes(status)
                ? theme.color.white
                : theme.color.grey50};

        & .MuiAccordionSummary-root {
            opacity: unset;
        }

        & .MuiAccordionSummary-expandIcon {
            opacity: 0;
        }
    }
`;

const Expandable = ({ id, status, nested, disabled, children, onToggle }) => {
    const [expanded, toggleExpanded] = useToggle(false);

    const toggleExpandedState = () => {
        if (!disabled) {
            const nextExpanded = toggleExpanded();
            if (onToggle) {
                onToggle(nextExpanded);
            }
        }
    };

    return (
        <StyledExpandable
            id={id}
            square
            disabled={disabled}
            expanded={expanded}
            status={status}
            nested={nested}
            onChange={toggleExpandedState}>
            {children}
        </StyledExpandable>
    );
};

Expandable.propTypes = {
    id: PropTypes.string.isRequired,
    status: PropTypes.string,
    disabled: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.element),
    onToggle: PropTypes.func,
};

Expandable.defaultProps = {
    status: STATUS.none,
    disabled: false,
    children: [],
    onToggle: () => {},
};

Expandable.displayName = 'Expandable';

export default Expandable;
