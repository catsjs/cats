/* eslint-disable max-len, no-nested-ternary  */
import React from 'react';
import PropTypes from 'prop-types';

import { Box } from '@material-ui/core';
import { Title, Description, ErrorMessage } from './styles';
import Chart from '../../../Suite/Chart';

const SummaryBig = ({
    title,
    description,
    duration,
    tests,
    passes,
    failures,
    pending,
    skipped,
    errorMessage,
    isHook,
    isExpanded,
    TitleComponent,
    DescriptionComponent,
}) => {
    console.log('CHART', passes, failures, pending, skipped, title);
    const chartProps = {
        duration,
        totalPasses: passes,
        totalFailures: failures,
        totalPending: pending,
        totalSkipped: skipped,
        size: 75,
    };
    return (
        <Box
            display='flex'
            flexGrow={1}
            alignItems='start'
            justifyContent='space-between'>
            <Box>
                <TitleComponent truncate={!isExpanded}>{title}</TitleComponent>
                <DescriptionComponent>{description}</DescriptionComponent>
            </Box>
            <Chart {...chartProps} />
        </Box>
    );
};

SummaryBig.propTypes = {
    title: PropTypes.string.isRequired,
    duration: PropTypes.number,
    speed: PropTypes.string,
    passed: PropTypes.bool,
    failed: PropTypes.bool,
    pending: PropTypes.bool,
    isHook: PropTypes.bool,
    errorMessage: PropTypes.string,
    isExpanded: PropTypes.bool,
    smaller: PropTypes.bool,
    TitleComponent: PropTypes.elementType,
    DescriptionComponent: PropTypes.elementType,
    Actions: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
    Chart: PropTypes.element,
};

SummaryBig.defaultProps = {
    duration: 0,
    speed: 'notset',
    passed: false,
    failed: false,
    pending: false,
    isHook: false,
    errorMessage: null,
    isExpanded: false,
    smaller: false,
    TitleComponent: Title,
    DescriptionComponent: Description,
    Actions: false,
    Chart: null,
};

SummaryBig.displayName = 'SummaryBig';

export default SummaryBig;
