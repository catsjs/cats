import { types } from "@catsjs/core";

import extractLinks from "./extract.js";

const plugin = {
  type: types.content,
  name: "html",
  parameters: {},
  mediaTypes: ["text/html"],
  mediaTypePattern: undefined,
};

const init = (opts) => {
  return {
    ...plugin,
    extractLinks,
    //of: (content) => chai.expect(content),
  };
};

export default {
  ...plugin,
  init: init,
};
