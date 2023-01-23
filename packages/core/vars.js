export default ({ vars, verbose }) => {
  const shared = { GLOBAL: vars || {} };
  console.log("SHARED", shared);

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

  return {
    save,
    load,
    loadOr,
    orLoad,
  };
};
