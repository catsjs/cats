import React from 'react';
import PropTypes from 'prop-types';

import { Check, Close, Pause, Stop } from '@material-ui/icons';

import styled from 'styled-components';
import IconLabel from '../IconLabel';

const CircleIcon = styled.div`
    &.MuiSvgIcon-root {
        color: ${(props) =>
            props.theme.color[`${props.$color}${props.$shades[0]}`]};
        background-color: ${(props) =>
            props.theme.color[`${props.$color}${props.$shades[1]}`]};
        border-radius: 50%;
        padding: 3px;
    }
`;

const IconStatus = ({ status, count, circle, after, light, boxProps }) => {
    const icons = {
        passed: Check,
        failed: Close,
        pending: Pause,
        skipped: Stop,
    };

    const colors = {
        passed: 'green',
        failed: 'red',
        pending: 'ltblue',
        skipped: 'grey',
    };

    const shades = {
        true: ['700', '100'],
        false: ['100', '500'],
    };

    const Icon = circle
        ? (props) => (
              <CircleIcon
                  {...props}
                  as={icons[status]}
                  $color={colors[status]}
                  $shades={shades[light]}
              />
          )
        : icons[status];

    const text = count === null ? null : `${count}`;

    return (
        <IconLabel
            text={text}
            Icon={Icon}
            iconAfter={after}
            boxProps={boxProps}
        />
    );
};

IconStatus.propTypes = {
    status: PropTypes.oneOf(['passed', 'failed', 'pending', 'skipped'])
        .isRequired,
    count: PropTypes.number,
    circle: PropTypes.bool,
    after: PropTypes.bool,
    light: PropTypes.bool,
    boxProps: PropTypes.shape(),
};

IconStatus.defaultProps = {
    count: null,
    circle: true,
    after: false,
    light: false,
    boxProps: {},
};

IconStatus.displayName = 'IconStatus';

export default IconStatus;
