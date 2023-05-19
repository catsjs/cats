import { merge as doMerge } from "merge-anything";

const store = ({ vars, verbose }) => {
  const shared = { GLOBAL: vars || {} };
  if (verbose) {
    console.log("SHARED", shared);
  }

  const save = (key, value, context = "GLOBAL") => {
    if (!shared[context]) shared[context] = {};
    shared[context][key] = value;
    if (verbose) {
      console.log("SAVED", key, context);
    }
  };

  const load = (key, context = "GLOBAL") => {
    if (!shared[context]) shared[context] = {};
    return shared[context][key];
  };

  const loadOr = (key, val, context = "GLOBAL") => {
    return shared[context] && Object.hasOwn(shared[context], key)
      ? load(key, context)
      : val;
  };

  const orLoad = (key, vars, context = "GLOBAL") => {
    return typeof vars === "object" && Object.hasOwn(vars, key)
      ? vars[key]
      : load(key, context);
  };

  const merge = (vars, context = "GLOBAL") => {
    return store({ vars: doMerge(shared[context] || {}, vars || {}) });
  };

  return {
    save,
    load,
    loadOr,
    orLoad,
    merge,
  };
};

export default store;
