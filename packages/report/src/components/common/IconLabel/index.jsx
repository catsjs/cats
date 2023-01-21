import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, useTheme } from '@material-ui/core';

const DefaultIcon = () => null;

// TODO
const getColor = (palette, color) => {
    const path = color.split('.');
    let value = palette;
    for (let i = 0; i < path.length; i++) {
        value = value[path[i]];
    }
    return value;
};

const ColorIcon = styled.div`
    &.MuiSvgIcon-root {
        color: ${(props) => props.$color};
    }
`;

const IconLabel = ({
    text,
    color,
    hoverColor,
    Icon,
    iconAfter,
    iconColor,
    boxProps,
}) => {
    const icon = Icon !== DefaultIcon;
    const { palette } = useTheme();

    const ColoredIcon = iconColor
        ? (props) => (
              <ColorIcon
                  {...props}
                  as={Icon}
                  $color={getColor(palette, iconColor)}
              />
          )
        : Icon;

    return (
        <Box
            display='flex'
            alignItems='center'
            fontSize='calc(400% / 3)'
            color={color}
            {...boxProps}
            css={
                hoverColor && {
                    '&:hover': { color: getColor(palette, hoverColor) },
                }
            }>
            {icon && !iconAfter && <Icon fontSize='inherit' />}
            <Box
                ml={text && icon && !iconAfter ? 0.5 : 0}
                mr={text && icon && iconAfter ? 0.5 : 0}
                fontSize='0.75em'>
                {text}
            </Box>
            {icon && iconAfter && <ColoredIcon fontSize='inherit' />}
        </Box>
    );
};

IconLabel.propTypes = {
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    color: PropTypes.string,
    hoverColor: PropTypes.string,
    Icon: PropTypes.elementType,
    iconAfter: PropTypes.bool,
    iconColor: PropTypes.string,
    boxProps: PropTypes.shape(),
};

IconLabel.defaultProps = {
    text: null,
    color: null,
    hoverColor: null,
    Icon: DefaultIcon,
    iconAfter: false,
    iconColor: null,
    boxProps: {},
};

IconLabel.displayName = 'IconLabel';

export default IconLabel;
