import React from 'react';
import PropTypes from 'prop-types';
import prettyMs from 'pretty-ms';

import { Timer } from '@material-ui/icons';

import IconLabel from '../IconLabel';

const Duration = ({ ms, color, hoverColor, icon, iconAfter, speed }) => {
    const duration = prettyMs(ms, {
        unitCount: 3,
    });

    // TODO: adjust colors in theme, red300 yellow700 black38
    let iconColor = null;
    switch (speed) {
        case 'slow':
            iconColor = 'error.light';
            break;
        case 'medium':
            iconColor = 'warning.light';
            break;
        case null:
            iconColor = 'text.hint';
            break;
        default:
            break;
    }

    return (
        <IconLabel
            text={duration}
            color={color}
            hoverColor={hoverColor}
            Icon={icon ? Timer : null}
            iconAfter={iconAfter}
            iconColor={iconColor}
        />
    );
};

Duration.propTypes = {
    // className: PropTypes.string,
    ms: PropTypes.number.isRequired,
    color: PropTypes.string,
    hoverColor: PropTypes.string,
    icon: PropTypes.bool,
    iconAfter: PropTypes.bool,
    speed: PropTypes.oneOf(['slow', 'medium', null, 'notset']),
};

Duration.defaultProps = {
    color: null,
    hoverColor: null,
    icon: true,
    iconAfter: false,
    speed: 'notset',
};

Duration.displayName = 'Duration';

export default Duration;
