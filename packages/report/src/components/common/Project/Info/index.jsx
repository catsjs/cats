import React from "react";
import PropTypes from "prop-types";

import { Typography, Divider } from "@material-ui/core";
import Markdown from "../../Markdown";

const ProjectInfo = ({
  name,
  title,
  description,
  version,
  endpoint,
  started,
}) => {
  return (
    <>
      <Typography variant="h5" align="center" color="textSecondary" paragraph>
        {name}
        {version && (
          <Typography
            variant="subtitle2"
            display="inline"
            color="textSecondary"
          >
            {` v${version}`}
          </Typography>
        )}
      </Typography>
      {/*<Typography
        component="h1"
        variant="h2"
        align="center"
        color="textPrimary"
        gutterBottom
      >
        {title}
        {version && (
          <Typography
            variant="subtitle2"
            display="inline"
            color="textSecondary"
          >
            {` v${version}`}
          </Typography>
        )}
        </Typography>*/}
      <Typography variant="body" align="center" color="textSecondary" paragraph>
        <Markdown>{description}</Markdown>
      </Typography>
      <Divider variant="middle" />
      {/*<Typography variant="body" align="center" color="textSecondary" paragraph>
        {endpoint}
      </Typography>
      <Typography variant="body" align="center" color="textSecondary" paragraph>
        {started}
      </Typography>*/}
    </>
  );
};

ProjectInfo.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  version: PropTypes.string,
};

ProjectInfo.defaultProps = {
  name: null,
  title: null,
  description: null,
  version: null,
};

ProjectInfo.displayName = "ProjectInfo";

export default ProjectInfo;
