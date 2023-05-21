import React from "react";
import PropTypes from "prop-types";

import { Box } from "@material-ui/core";
import { LibraryBooks, Assignment } from "@material-ui/icons";

import Duration from "../../Duration";
import IconLabel from "../../IconLabel";
import IconStatus from "../../IconStatus";

const Item = (props) => (
  <Box
    display="flex"
    color="white"
    fontSize={["16px", "18px"]}
    mx={[0.5, 1.5]}
    {...props}
  />
);

const QuickSummary = ({ stats }) => {
  const {
    duration,
    suites,
    testsRegistered,
    passes,
    failures,
    pending,
    skipped,
  } = stats;

  return (
    <Box display="flex" flexDirection={["column", "initial"]}>
      <Box display="flex" mb={[1, 0]}>
        {duration && (
          <Item title="Duration">
            <Duration ms={duration} />
          </Item>
        )}
        {suites && (
          <Item title="Suites">
            <IconLabel text={suites} Icon={LibraryBooks} />
          </Item>
        )}
        {testsRegistered && (
          <Item title="Tests">
            <IconLabel text={testsRegistered} Icon={Assignment} />
          </Item>
        )}
      </Box>
      <Box display="flex" mb={[1, 0]}>
        <Item title="Passed">
          <IconStatus status="passed" count={passes || 0} light />
        </Item>
        <Item title="Failed">
          <IconStatus status="failed" count={failures || 0} light />
        </Item>
        {!!pending && (
          <Item title="Pending">
            <IconStatus status="pending" count={pending} light />
          </Item>
        )}
        {!!skipped && (
          <Item title="Skipped">
            <IconStatus status="skipped" count={skipped} light />
          </Item>
        )}
      </Box>
    </Box>
  );
};

QuickSummary.propTypes = {
  stats: PropTypes.shape({
    duration: PropTypes.number,
    suites: PropTypes.number,
    testsRegistered: PropTypes.number,
    passes: PropTypes.number,
    failures: PropTypes.number,
    pending: PropTypes.number,
    skipped: PropTypes.number,
  }).isRequired,
};

QuickSummary.displayName = "QuickSummary";

export default QuickSummary;
