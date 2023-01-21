import React from 'react';
import PropTypes from 'prop-types';

import { IconButton } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';

const ExpandButton = ({ onClick }) => {
    return (
        <IconButton onClick={onClick} disableRipple>
            <ExpandMore />
        </IconButton>
    );
};

ExpandButton.displayName = 'ExpandButton';

ExpandButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default ExpandButton;
