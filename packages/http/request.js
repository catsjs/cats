import { apply, methods } from "./agent.js";

export default ({ method = "get", path = "", ...options }, agent) => {
  if (!methods.includes(method.toLowerCase())) {
    console.error("ERRRRRRR");
    throw new Error(`HTTP method ${method} does not exist`);
  }

  const request = agent[method.toLowerCase()](path);

  apply(request, options);

  return request;
};
