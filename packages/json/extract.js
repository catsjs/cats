import { URL } from "url";

const relativize = (url, baseUrl) =>
  baseUrl ? url.substr(baseUrl.length) : url;

export default (
  body,
  visited = [],
  parentUrl = null,
  baseUrl = null,
  rootUrl = null,
  ignoreRegex = null
) => {
  const links = [];
  const json = JSON.parse(body);

  if (Array.isArray(json.links)) {
    console.log("JSON", json.links);
    json.links
      .map((link) => link.href)
      .map((link) => {
        if (link.length > 0 && !link.startsWith("http")) {
          return new URL(
            link,
            link.startsWith("/") ? rootUrl : rootUrl + parentUrl
          ).href;
        }
        return link;
      })
      .forEach((link) => {
        if (
          link.length > 0 &&
          (!ignoreRegex || !new RegExp(ignoreRegex).test(link)) &&
          (!baseUrl || link.startsWith(baseUrl) || !link.startsWith("http"))
        ) {
          const rel = relativize(link, baseUrl);

          if (!links.includes(rel) && !visited.includes(rel)) {
            links.push(rel);
          }
        }
      });
  }

  return links;
};
