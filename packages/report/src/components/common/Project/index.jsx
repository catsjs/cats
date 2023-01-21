import React from "react";
import { useStore } from "../StoreProvider";

import Info from "./Info";

const Project = () => {
  const { project, stats } = useStore();

  const {
    name,
    title,
    description,
    version,
    plugins,
    protocol,
    endpoint,
    ...parameters
  } = project;

  return name ? (
    <Info
      name={name}
      title={title}
      description={description}
      version={version}
      plugins={plugins}
      protocol={protocol}
      parameters={parameters}
      started={stats.start}
      endpoint={endpoint}
    />
  ) : null;
};

Project.propTypes = {};

Project.defaultProps = {};

Project.displayName = "Project";

export default Project;
