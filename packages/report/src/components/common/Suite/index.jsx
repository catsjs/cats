import React from "react";
import PropTypes from "prop-types";
import { Collapse, Box } from "@material-ui/core";

import ExpandButton from "../ExpandButton";
import {
  Card,
  CardContent,
  CardActions,
  TestContainer,
  Title,
  Description,
} from "./styles";
import Chart from "./Chart";
import SuiteCompact from "./Compact";
import Tests from "../Tests";
import Expandable, { STATUS } from "../Expandable";
import { Summary, getStats } from "../Result";
// import TestListMui from '../test/list-mui';
// import SuiteListMui from './list-mui'
// import SuiteSummaryMui from './summary-mui'

import { useToggle } from "../../../style/base";

const getStatus = (pass, fail) =>
  pass ? STATUS.ok : fail ? STATUS.error : STATUS.neutral;

const Suite = ({
  suite,
  enableChart,
  enableCode,
  isMain,
  compact,
  level,
  parentPath,
  TitleComponent,
  DescriptionComponent,
  Actions,
  Test,
}) => {
  const [expanded, toggleExpanded] = useToggle(true);

  const {
    rootEmpty,
    suites,
    tests,
    passes,
    failures,
    pending,
    skipped,
    beforeHooks,
    afterHooks,
    uuid,
    title,
    file,
    options = {},
    duration,
  } = suite;

  const { description = "" } = options;

  const {
    hasPasses,
    hasFailures,
    hasPending,
    hasSkipped,
    hasBeforeHooks,
    hasAfterHooks,
    hasSuites,
    hasTests,
    totalPasses,
    totalFailures,
    totalPending,
    totalSkipped,
  } = getStats(
    passes,
    failures,
    pending,
    skipped,
    beforeHooks,
    afterHooks,
    suites,
    tests
  );

  const status = getStatus(hasPasses, hasFailures);
  const path = level > 0 ? [...parentPath, title] : [];

  const subSuiteProps = {
    enableChart,
    enableCode,
    TitleComponent,
    DescriptionComponent,
    Actions,
    Test,
  };
  // TODO: CompositeTest instead of SuiteCompact
  // TODO: instead of triggering by level, might trigger in options with compositeTest
  const subSuites = (isMain2) =>
    hasSuites &&
    (!isMain && !isMain2
      ? suites.map((subsuite) => (
          <SuiteCompact
            key={subsuite.uuid}
            suite={subsuite}
            isMain={isMain2}
            level={level + 1}
            parentPath={path}
            Test={Test}
            {...subsuite}
            {...subSuiteProps}
          />
        ))
      : suites.map((subsuite) => (
          <Suite
            key={subsuite.uuid}
            suite={subsuite}
            isMain={isMain2}
            level={level + 1}
            parentPath={path}
            {...subSuiteProps}
          />
        )));
  /*
    const summaryProps = {
        duration,
        totalTests,
        totalPasses,
        totalFailures,
        totalPending,
        totalSkipped,
        noMargin: title === '' && file === '',
    };
*/
  const chartProps = {
    duration,
    totalPasses,
    totalFailures,
    totalPending,
    totalSkipped,
    size: 75,
  };

  //TODO: how to display root hooks
  if (rootEmpty /*&& !hasBeforeHooks && !hasAfterHooks*/) {
    return subSuites(true);
  }

  return isMain ? (
    <Card id={uuid} raised={isMain} square>
      <Expandable id={uuid} expanded={expanded}>
        <Summary
          title={title}
          description={description}
          duration={duration}
          passed={hasPasses && !hasFailures}
          failed={hasFailures}
          pended={hasPending || (hasSkipped && !hasPasses && !hasFailures)}
          passes={totalPasses}
          failures={totalFailures}
          pending={totalPending}
          skipped={totalSkipped}
          isExpanded={expanded}
          Actions={Actions}
          hasContext
          bigger
        />
        <Box>
          {/*Actions && (
            <Box p={2}>
              <Actions {...suite} path={path} />
            </Box>
          )*/}
          {(hasTests || hasBeforeHooks || hasAfterHooks) && (
            <Tests
              uuid={uuid}
              tests={tests}
              beforeHooks={beforeHooks}
              afterHooks={afterHooks}
              enableCode={enableCode}
              path={path}
              file={file}
              Test={Test}
            />
          )}
          {subSuites()}
        </Box>
      </Expandable>
    </Card>
  ) : (
    <Expandable id={uuid} nested>
      <Summary
        title={title}
        description={description}
        duration={duration}
        passed={hasPasses && !hasFailures}
        failed={hasFailures}
        pended={hasPending || (hasSkipped && !hasPasses && !hasFailures)}
        passes={totalPasses}
        failures={totalFailures}
        pending={totalPending}
        skipped={totalSkipped}
        isExpanded={expanded}
        hasContext
        bigger
      />
      <Box>
        {/*Actions && (
            <Box p={2}>
              <Actions {...suite} path={path} />
            </Box>
          )*/}
        {(hasTests || hasBeforeHooks || hasAfterHooks) && (
          <Tests
            uuid={uuid}
            tests={tests}
            beforeHooks={beforeHooks}
            afterHooks={afterHooks}
            enableCode={enableCode}
            path={path}
            file={file}
            Test={Test}
          />
        )}
        {subSuites()}
      </Box>
    </Expandable>
  );
};

Suite.propTypes = {
  suite: PropTypes.shape().isRequired,
  isMain: PropTypes.bool,
  compact: PropTypes.bool,
  level: PropTypes.number,
  parentPath: PropTypes.arrayOf(PropTypes.string),
  enableChart: PropTypes.bool,
  enableCode: PropTypes.bool,
  TitleComponent: PropTypes.elementType,
  DescriptionComponent: PropTypes.elementType,
  Actions: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
  Test: PropTypes.elementType.isRequired,
};

Suite.defaultProps = {
  isMain: false,
  compact: false,
  level: 0,
  parentPath: [],
  enableChart: false,
  enableCode: false,
  TitleComponent: Title,
  DescriptionComponent: Description,
  Actions: false,
};

Suite.displayName = "Suite";

export default React.memo(Suite);
