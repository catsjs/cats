/* eslint-disable max-len, no-nested-ternary  */
import React from 'react';
import PropTypes from 'prop-types';

import { Box } from '@material-ui/core';
import Tests from '../../Tests';
import Expandable, { STATUS } from '../../Expandable';
import { Summary } from '../../Result';

const getStatus = (pass, fail) =>
    pass ? STATUS.ok : fail ? STATUS.error : STATUS.neutral;

const SuiteCompact = ({
    title,
    duration,
    speed,
    passes,
    failures,
    pending,
    enableCode,
    errorMessage,
    isHook,
    isExpanded,
    hasContext,
    uuid,
    tests,
    level,
    parentPath,
    file,
    Test,
}) => {
    const hasPasses = passes && passes.length > 0;
    const hasFailures = failures && failures.length > 0;
    const hasPending = pending && pending.length > 0;

    const status = getStatus(hasPasses, hasFailures);

    const path = level > 0 ? [...parentPath, title] : [];

    return (
        <Expandable id={uuid} status={status}>
            <Summary
                title={title}
                duration={duration}
                speed={speed}
                passed={hasPasses && !hasFailures}
                failed={hasFailures}
                pending={hasPending && !hasPasses && !hasFailures}
                errorMessage={errorMessage}
                isHook={isHook}
                isExpanded={isExpanded}
                hasContext={hasContext}
            />
            <Box ml={5}>
                <Tests
                    uuid={uuid}
                    tests={tests}
                    enableCode={enableCode}
                    beforeHooks={null}
                    afterHooks={null}
                    isNested
                    path={path}
                    file={file}
                    Test={Test}
                />
            </Box>
        </Expandable>
    );
};

SuiteCompact.propTypes = {
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
};

SuiteCompact.defaultProps = {
    duration: 0,
    speed: 'notset',
    passed: false,
    failed: false,
    pending: false,
    errorMessage: null,
    isHook: false,
    isExpanded: false,
    hasContext: false,
};

SuiteCompact.displayName = 'SuiteCompact';

export default SuiteCompact;
