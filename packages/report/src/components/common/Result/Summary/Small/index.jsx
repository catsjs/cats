/* eslint-disable max-len, no-nested-ternary  */
import React from 'react';
import PropTypes from 'prop-types';

import { Box } from '@material-ui/core';
import Duration from '../../../Duration';
import IconStatus from '../../../IconStatus';
import { Title, ErrorMessage } from '../../styles';

const SummarySmall = ({
    title,
    duration,
    speed,
    passed,
    failed,
    pending,
    errorMessage,
    isHook,
    isExpanded,
    smaller,
}) => {
    return (
        <Box display='flex' flexDirection='column' flexGrow={1}>
            <Box display='flex' flexGrow={1}>
                {isHook ? (
                    <span>hook</span>
                ) : (
                    <IconStatus
                        status={
                            passed
                                ? 'passed'
                                : failed
                                ? 'failed'
                                : pending
                                ? 'pending'
                                : 'skipped'
                        }
                        boxProps={{
                            mr: 2,
                            fontSize: smaller ? '1rem' : '1.5rem',
                        }}
                    />
                )}
                <Title truncate={!isExpanded} secondary={isHook}>
                    {title}
                </Title>
                <Box display='flex'>
                    {/* hasContext && (
                                <IconLabel
                                    text=''
                                    color='text.hint'
                                    Icon={ChatBubbleOutline}
                                />
                            ) */}
                    {!isHook && !pending && (
                        <Duration
                            expanded={isExpanded}
                            pending={pending}
                            ms={duration}
                            color={
                                isExpanded ? 'text.primary' : 'text.secondary'
                            }
                            hoverColor='text.primary'
                            speed={speed}
                            iconAfter
                        />
                    )}
                </Box>
            </Box>
            {!!errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </Box>
    );
};

SummarySmall.propTypes = {
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
};

SummarySmall.defaultProps = {
    duration: 0,
    speed: 'notset',
    passed: false,
    failed: false,
    pending: false,
    isHook: false,
    errorMessage: null,
    isExpanded: false,
    smaller: false,
};

SummarySmall.displayName = 'SummarySmall';

export default SummarySmall;
