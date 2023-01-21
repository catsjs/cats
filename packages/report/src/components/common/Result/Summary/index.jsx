/* eslint-disable max-len, no-nested-ternary  */
import React from 'react';
import PropTypes from 'prop-types';

import { Box, AccordionSummary } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import SummarySmall from './Small';
import SummaryBig from './Big';

const ResultSummary = ({
    title,
    description,
    duration,
    speed,
    passed,
    failed,
    pended,
    passes,
    failures,
    skipped,
    pending,
    errorMessage,
    isHook,
    isExpanded,
    smaller,
    bigger,
    Actions,
    Chart,
}) => {
    return (
        <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls='panel1a-content'
            id='panel1a-header'>
            <Box display='flex' flexGrow={1}>
                {bigger ? (
                    <SummaryBig
                        title={title}
                        description={description}
                        duration={duration}
                        speed={speed}
                        passes={passes}
                        failures={failures}
                        pending={pending}
                        skipped={skipped}
                        errorMessage={errorMessage}
                        isHook={isHook}
                        isExpanded={isExpanded}
                    />
                ) : (
                    <SummarySmall
                        title={title}
                        duration={duration}
                        speed={speed}
                        passed={passed}
                        failed={failed}
                        pending={pended}
                        errorMessage={errorMessage}
                        isHook={isHook}
                        isExpanded={isExpanded}
                        smaller={smaller}
                    />
                )}
            </Box>
        </AccordionSummary>
    );
};

ResultSummary.propTypes = {
    title: PropTypes.string.isRequired,
    duration: PropTypes.number,
    speed: PropTypes.string,
    passed: PropTypes.bool,
    failed: PropTypes.bool,
    pending: PropTypes.bool,
    errorMessage: PropTypes.string,
    isHook: PropTypes.bool,
    isExpanded: PropTypes.bool,
    hasContext: PropTypes.bool,
    smaller: PropTypes.bool,
};

ResultSummary.defaultProps = {
    duration: 0,
    speed: 'notset',
    passed: false,
    failed: false,
    pending: false,
    errorMessage: null,
    isHook: false,
    isExpanded: false,
    hasContext: false,
    smaller: false,
};

ResultSummary.displayName = 'ResultSummary';

export default ResultSummary;
