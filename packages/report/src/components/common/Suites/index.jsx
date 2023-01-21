import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { Container, Typography, Box } from '@material-ui/core';
import { useStore } from '../StoreProvider';

const isEmpty = (suites) =>
    !suites ||
    suites.length === 0 ||
    (suites.length === 1 && suites[0] === false);

const ReportBody = ({ Suite, PlaceHolder, containerProps }) => {
    const store = useStore();

    // TODO: if one of these changes, call updateFilteredSuites
    // -> not really necessary, just set flags in store state and update filteredSuites accordingly
    const {
        showPassed,
        showFailed,
        showPending,
        showSkipped,
        showHooks,
        enableCode,
        enableChart,
        results,
    } = store;

    /* useEffect(() => {
        const updateSuites = (timeout) => store.updateFilteredSuites(timeout);

        updateSuites();

        const disposer = reaction(
            () => {
                return {
                    showPassed,
                    showFailed,
                    showPending,
                    showSkipped,
                    showHooks,
                    enableCode,
                    enableChart,
                    results,
                };
            },
            () => updateSuites(0),
            { delay: 300 }
        );

        return disposer;
    }, [
        store,
        showPassed,
        showFailed,
        showPending,
        showSkipped,
        showHooks,
        enableCode,
        enableChart,
        results,
    ]); */

    const { filteredSuites: suites } = store;
    console.log(suites);

    return (
        <Container {...containerProps}>
            {isEmpty(suites) ? (
                <PlaceHolder />
            ) : (
                suites.map((suite) => (
                    <Suite
                        key={suite.uuid}
                        suite={suite}
                        enableChart={enableChart}
                        enableCode={enableCode}
                    />
                ))
            )}
        </Container>
    );
};

ReportBody.propTypes = {
    Suite: PropTypes.elementType.isRequired,
    PlaceHolder: PropTypes.elementType.isRequired,
    containerProps: PropTypes.shape(Container.propTypes),
};

ReportBody.defaultProps = {
    containerProps: {},
};

ReportBody.displayName = 'ReportBody';

export default ReportBody;
