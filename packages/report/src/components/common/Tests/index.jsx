import React from 'react';
import PropTypes from 'prop-types';

const TestList = ({
    tests,
    beforeHooks,
    afterHooks,
    enableCode,
    isNested,
    path,
    file,
    Test,
}) => (
    <>
        {!!beforeHooks &&
            beforeHooks.map((test) => (
                <Test
                    key={test.uuid}
                    test={test}
                    enableCode={enableCode}
                    isNested={isNested}
                    parentPath={path}
                    file={file}
                />
            ))}
        {!!tests &&
            tests.map((test) => (
                <Test
                    key={test.uuid}
                    test={test}
                    enableCode={enableCode}
                    isNested={isNested}
                    parentPath={path}
                    file={file}
                />
            ))}
        {!!afterHooks &&
            afterHooks.map((test) => (
                <Test
                    key={test.uuid}
                    test={test}
                    enableCode={enableCode}
                    isNested={isNested}
                    parentPath={path}
                    file={file}
                />
            ))}
    </>
);

TestList.propTypes = {
    tests: PropTypes.arrayOf(PropTypes.shape()),
    beforeHooks: PropTypes.arrayOf(PropTypes.shape()),
    afterHooks: PropTypes.arrayOf(PropTypes.shape()),
    enableCode: PropTypes.bool,
    Test: PropTypes.elementType.isRequired,
};

TestList.defaultProps = {
    tests: [],
    beforeHooks: [],
    afterHooks: [],
    enableCode: false,
};

TestList.displayName = 'TestList';

export default TestList;
