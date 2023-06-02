/* eslint-disable max-len, no-nested-ternary  */
import React, { useState } from "react";
import PropTypes from "prop-types";

import Expandable, { STATUS } from "../Expandable";
// import Summary from './Summary';
import Details from "./Details";
import { Summary } from "../Result";
import CodeSnippet from "../CodeSnippet";

const getStatus = ({ pass, fail }, isNested) =>
  isNested
    ? STATUS.none
    : pass
    ? STATUS.ok
    : fail
    ? STATUS.error
    : STATUS.neutral;

const Test = ({ test, enableCode, isNested, parentPath, file, Code }) => {
  const [expanded, setExpanded] = useState(false);
  const {
    uuid,
    title,
    options = {},
    speed,
    duration,
    pass,
    fail,
    pending,
    skipped,
    isHook,
    err,
    code,
    context,
  } = test;

  const status = getStatus(test, isNested);

  const { description, yml } = options;

  const doNotExpand =
    !(pass && enableCode) &&
    !fail &&
    !isHook &&
    !context &&
    !description &&
    !yml;

  const isInactive =
    pending || skipped || (pass && !enableCode && !context && !yml);

  const path = [...parentPath, title];

  const description2 =
    title && title.length > 75 && !description ? title : description;

  return (
    <Expandable
      id={uuid}
      status={status}
      disabled={doNotExpand}
      onToggle={setExpanded}
    >
      <Summary
        title={title}
        duration={duration}
        speed={speed}
        passed={pass}
        failed={fail}
        pending={pending || skipped}
        errorMessage={err && err.message ? err.message : null}
        isHook={isHook}
        isExpanded={expanded}
        hasContext={!!context}
        smaller={isNested}
      />
      <Details
        description={description2}
        passed={pass}
        failed={fail}
        error={err}
        code={code}
        yml={yml}
        context={context}
        enableCode={enableCode}
        isInactive={isInactive}
        path={path}
        file={file}
        Code={Code}
      />
    </Expandable>
  );
};

Test.propTypes = {
  test: PropTypes.shape().isRequired,
  enableCode: PropTypes.bool,
  Code: PropTypes.elementType,
};

Test.defaultProps = {
  enableCode: true,
  Code: CodeSnippet,
};

Test.displayName = "Test";

export default Test;
