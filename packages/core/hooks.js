import { getHooks, addContext } from "@catsjs/core";

//TODO: fix report before enabling
export const mochaHooks = {
  /*beforeAll() {
    const hooks = getHooks();
    
    for (let i = 0; i < hooks.length; i++) {
      addContext(this, hooks[i]);
    }

    this.test.originalTitle = "Setup";
    this.test.options = { empty: hooks.length === 0 };
  },*/
};
