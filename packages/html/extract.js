import cheerio from "cheerio";
import { URL } from "url";

const relativize = (url, baseUrl) =>
  baseUrl ? url.substr(baseUrl.length) : url;

export default (
  html,
  visited = [],
  parentUrl = null,
  baseUrl = null,
  rootUrl = null,
  ignoreRegex = null
) => {
  const links = [];
  const $ = cheerio.load(html);

  $("a[href]")
    .map((i, node) => $(node).attr("href"))
    .toArray()
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
        (!ignoreRegex || !ignoreRegex.test(link)) &&
        (!baseUrl || link.startsWith(baseUrl) || !link.startsWith("http"))
      ) {
        const rel = relativize(link, baseUrl);

        if (!links.includes(rel) && !visited.includes(rel)) {
          links.push(rel);
        }
      }
    });

  return links;
};
