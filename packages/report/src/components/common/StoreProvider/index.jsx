import React, { useState } from "react";
import PropTypes from "prop-types";

const storeContext = React.createContext(null);

const StoreProvider = ({ data, config, children }) => {
  const [results, setResults] = useState(data.results || []);
  const [project, setProject] = useState(data.project || {});

  const store = {
    devMode: !!config.dev,
    enableChart: !!config.enableCharts,
    enableCode: !!config.enableCode,
    initialLoadTimeout: 300,
    reportTitle: config.reportTitle || data.reportTitle,
    results,
    stats: data.stats || {},
    project,
    meta: data.meta,
    // filteredSuites: [],
    isLoading: false,
    showFailed: config.showFailed !== undefined ? config.showFailed : true,
    showHooks: true, // this._getShowHooks(config),
    showPassed: config.showPassed !== undefined ? config.showPassed : true,
    showPending: config.showPending !== undefined ? config.showPending : true,
    showSkipped: config.showSkipped !== undefined ? config.showSkipped : false,
    sideNavOpen: false,
    // TODO
    filteredSuites: results,
    setResults,
    setProject,
  };

  return (
    <storeContext.Provider value={store}>{children}</storeContext.Provider>
  );
};

StoreProvider.propTypes = {
  data: PropTypes.shape().isRequired,
  config: PropTypes.shape().isRequired,
  children: PropTypes.node.isRequired,
};

export default StoreProvider;

export const useStore = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    throw new Error("You have forgot to use StoreProvider, shame on you.");
  }
  return store;
};
