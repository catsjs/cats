import React from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
} from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import styled from "styled-components";

import QuickSummary from "./QuickSummary";
import { margin } from "polished";

const Title = styled(Typography)`
  flex-grow: 1;
`;

const PercentBar = styled.div`
  display: flex;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
`;
const PercentBarSegment = styled.span.attrs((props) => ({
  title: `${props.percent.toFixed(2)}% ${props.titleSuffix}`,
}))`
  height: 4px;
  width: ${(props) => props.percent}%;

  ${(props) =>
    props.type === "pass" && `background-color: ${props.theme.color.green500};`}
  ${(props) =>
    props.type === "fail" && `background-color: ${props.theme.color.red500};`}
    ${(props) =>
    props.type === "pend" &&
    `background-color: ${props.theme.color.ltblue500};`}
`;

const Navbar = ({ reportTitle, stats }) => {
  const { passPercent = null, pendingPercent = null } = stats;

  const failPercent = 100 - passPercent;
  const allPending = pendingPercent === 100;
  const showPctBar = passPercent !== null && pendingPercent !== null;

  const { Logo } = useTheme();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <img
          src={Logo}
          height="36px"
          width="36px"
          style={{ marginRight: "12px" }}
        />
        {/*<IconButton edge="start" color="inherit">
          <Menu />
  </IconButton>*/}
        <Title variant="h6" color="inherit" noWrap>
          {reportTitle}
        </Title>

        <QuickSummary stats={stats} />
        {showPctBar && (
          <PercentBar>
            {allPending && (
              <PercentBarSegment
                percent={pendingPercent}
                type="pend"
                titleSuffix="Pending"
              />
            )}
            {!allPending && (
              <PercentBarSegment
                percent={passPercent}
                type="pass"
                titleSuffix="Passing"
              />
            )}
            {!allPending && (
              <PercentBarSegment
                percent={failPercent}
                type="fail"
                titleSuffix="Failing"
              />
            )}
          </PercentBar>
        )}
      </Toolbar>
    </AppBar>
  );
};

Navbar.propTypes = {
  //  onMenuClick: PropTypes.func,
  reportTitle: PropTypes.string.isRequired,
  stats: PropTypes.shape({
    passPercent: PropTypes.number,
    pendingPercent: PropTypes.number,
  }).isRequired,
};

Navbar.displayName = "Navbar";

export default Navbar;
