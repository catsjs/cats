/* eslint-disable max-len, no-nested-ternary  */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { AccordionDetails, Tabs, Tab, Box } from '@material-ui/core';
import CodeSnippet from '../../CodeSnippet';
import { Description } from '../styles';

const StyledExpansionPanelDetails = styled(AccordionDetails)`
    padding: 0;
    flex-direction: column;
`;

const StyledTabs = styled(Tabs)`
    padding: ${(props) => props.theme.spacing(0, 3)};
    background-color: ${(props) => props.theme.color.nearwhite};

    & .MuiTabs-indicator {
        ${(props) =>
            props.color === 'success' &&
            css`
                background-color: ${props.theme.color.green500};
            `}
        ${(props) =>
            props.color === 'error' &&
            css`
                background-color: ${props.theme.color.red500};
            `}
      ${(props) =>
            props.color === 'neutral' &&
            css`
                background-color: ${props.theme.color.black54};
            `}
    }
`;

const TabContent = styled.div`
    min-height: 128px;
    max-height: 512px;
    overflow-y: auto;
    padding: ${(props) => props.theme.spacing(2, 3)};
    background-color: ${(props) => props.theme.color.nearwhite};
    border-top: 1px solid ${(props) => props.theme.palette.divider};
`;

const TestDetails = ({
    description,
    passed,
    failed,
    error,
    code,
    context,
    enableCode,
    isInactive,
}) => {
    const cntxt = context ? JSON.parse(context) : [];

    const tabs = {};

    if (error) {
        if (error.estack) {
            tabs.error = {
                title: 'Stack trace',
                value: error.estack,
                highlight: false,
            };
        }
        if (error.diff) {
            tabs.diff = { title: 'Diff', value: error.diff, language: 'diff' };
        }
    }
    if (enableCode && code) {
        tabs.code = {
            title: 'Assertions',
            value: code,
            language: 'javascript',
        };
    }
    if (cntxt) {
        cntxt.forEach((ctx) => {
            tabs[ctx.title] = ctx;
        });
    }

    const initialSelectedTab =
        Object.keys(tabs).length > 0 && Object.keys(tabs)[0];

    const [selectedTab, setSelectedTab] = useState(initialSelectedTab);

    const onTabSelect = (event, newValue) => {
        setSelectedTab(newValue);
    };

    return (
        <StyledExpansionPanelDetails>
            {description && (
                <Box px={2} pt={0} pb={3}>
                    <Description>{description}</Description>
                </Box>
            )}
            {!isInactive && (
                <StyledTabs
                    value={selectedTab}
                    onChange={onTabSelect}
                    color={passed ? 'success' : failed ? 'error' : 'neutral'}>
                    {Object.keys(tabs).map((key) => (
                        <Tab
                            key={key}
                            value={key}
                            label={tabs[key].title.toUpperCase()}
                            disableRipple
                        />
                    ))}
                </StyledTabs>
            )}
            {!isInactive && (
                <TabContent>
                    {/* highlight.js only works when component never changes, so we create one instance per code snippet */}
                    {Object.keys(tabs).map(
                        (key) =>
                            key === selectedTab && (
                                <CodeSnippet
                                    key={key}
                                    code={tabs[key].value}
                                    lang={tabs[key].language}
                                    highlight={tabs[key].highlight}
                                    label={tabs[key].title}
                                />
                            )
                    )}

                    {/* !!context && <TestContext context={context} /> */}
                </TabContent>
            )}
        </StyledExpansionPanelDetails>
    );
};

TestDetails.propTypes = {
    description: PropTypes.string,
    passed: PropTypes.bool,
    failed: PropTypes.bool,
    error: PropTypes.shape(),
    code: PropTypes.string,
    context: PropTypes.string,
    enableCode: PropTypes.bool,
};

TestDetails.defaultProps = {
    description: null,
    passed: false,
    failed: false,
    error: null,
    code: null,
    context: null,
    enableCode: true,
};

TestDetails.displayName = 'TestDetails';

export default TestDetails;
