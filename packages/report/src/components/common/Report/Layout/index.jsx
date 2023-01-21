import React from "react";
import PropTypes from "prop-types";

import { Box } from "@material-ui/core";
import { useStore } from "../../StoreProvider";

const ReportLayout = ({
  Navbar,
  Suites,
  Header,
  Loader,
  Footer,
  SuitePlaceHolder,
}) => {
  const { openSideNav, reportTitle, stats, meta } = useStore();

  return (
    <>
      <Navbar
        onMenuClick={openSideNav}
        reportTitle={reportTitle}
        stats={stats}
      />
      <Box component="main" pt={12} pb={6} flexGrow={1}>
        <Header />
        <Suites PlaceHolder={SuitePlaceHolder} />
        <Loader />
        {/* <NavMenu /> */}
      </Box>
      <Footer {...meta.cats} />
    </>
  );
};

ReportLayout.propTypes = {
  Navbar: PropTypes.elementType.isRequired,
  Suites: PropTypes.elementType.isRequired,
  Header: PropTypes.elementType,
  Loader: PropTypes.elementType,
  Footer: PropTypes.elementType,
  SuitePlaceHolder: PropTypes.elementType.isRequired,
};

ReportLayout.defaultProps = {
  Header: () => null,
  Loader: () => null,
  Footer: () => null,
};

ReportLayout.displayName = "ReportLayout";

export default ReportLayout;
