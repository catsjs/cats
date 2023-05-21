import { hot } from "react-hot-loader";
import React from "react";
import PropTypes from "prop-types";

import Footer from "../../common/Footer";
import Loader from "../../common/Loader";
import Navbar from "../../common/Navbar";
import Project from "../../common/Project";
// import { NavMenu } from "components/nav-menu";
import Suites from "../../common/Suites";
import Suite from "../../common/Suite";
import Test from "../../common/Test";
import Report from "../../common/Report";

import { apispec as theme } from "../../../themes";

const DefaultTest = (props) => <Test {...props} />;
const DefaultSuite = (props) => (
  <Suite
    {...props}
    Test={DefaultTest}
    Actions={undefined /*() => <div>actions</div>*/}
  />
);
const DefaultSuites = (props) => <Suites {...props} Suite={DefaultSuite} />;

const HtmlReport = ({ data, config }) => {
  return (
    <Report
      data={data}
      config={config}
      theme={theme}
      Navbar={Navbar}
      Header={Project}
      Suites={DefaultSuites}
      Loader={Loader}
      Footer={Footer}
    />
  );
};

HtmlReport.propTypes = {
  data: PropTypes.shape().isRequired,
  config: PropTypes.shape().isRequired,
};

HtmlReport.displayName = "HtmlReport";

export default hot(module)(HtmlReport);
