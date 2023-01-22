import { methods } from "./agent.js";

export default (
  agent,
  { method = "get", path = "", headers = {}, redirects = 2 }
) => {
  if (!methods.includes(method.toLowerCase())) {
    console.error("ERRRRRRR");
    throw new Error(`HTTP method ${method} does not exist`);
  }

  const res = agent[method.toLowerCase()](path).redirects(redirects);

  Object.keys(headers).forEach((header) => {
    res.set(header, headers[header]);
  });

  return res;
};
