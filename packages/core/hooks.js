import { getHooks, addContext, init } from "@catsjs/core";

//TODO: should cache + resources really be nested in opts?
//TODO: fix report before enabling
export const mochaHooks = async () => {
  const {
    opts: { cache, resources, rootDir, ...options },
  } = await init();

  return {
    beforeAll() {
      const hooks = getHooks();

      this.test.parent.project = { ...options };

      for (let i = 0; i < hooks.length; i++) {
        addContext(this, hooks[i]);
      }

      this.test.originalTitle = "Setup";
      this.test.options = { empty: hooks.length === 0 };
    },
  };
};
