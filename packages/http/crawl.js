const COUNTER = {};

const create = (links = []) => ({
  errors: {},
  links,
});

const ok = (result, next) => {
  result.errors = { ...result.errors, ...next.errors };
  result.links = Array.from(new Set(result.links.concat(next.links)));
  return result;
};
//TODO: remove errors.keys from links
const err = (result, error) => {
  console.log("ERR", error);
  result.errors[error.url] = error.msg;
  return result;
};

//TODO: stopRegex? show in report as rootHook or so?
const crawl2 = (
  api,
  url,
  content,
  visited,
  baseUrl,
  parallel = true,
  ignoreRegex = null,
  level = 0,
  parent = null
) => {
  return api
    .get(url)
    .set(
      "Accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    )
    .redirects(2)
    .then((res) => {
      if (!res.ok) {
        return Promise.reject({
          msg: res.status,
          url,
        });
      }
      const contentType = content(res.type);

      if (!contentType || !contentType.extractLinks) {
        return Promise.resolve(
          err(
            create(),
            `No content plugin with type '${res.type}' and extractLinks found`
          )
        );
      }

      if (!COUNTER[url]) COUNTER[url] = [];
      COUNTER[url].push(parent);
      //console.log("X", url);
      const links = contentType.extractLinks(
        res.text,
        visited,
        url,
        baseUrl,
        baseUrl.substring(0, baseUrl.indexOf("/", 8)),
        ignoreRegex
      );
      //console.log("Y", links);
      //console.log("Z", visited);
      //console.log();
      const nextVisited = visited.concat(links);

      if (parallel) {
        return Promise.allSettled(
          [Promise.resolve(create(links))].concat(
            links.map((link) =>
              crawl2(
                api,
                link,
                content,
                nextVisited,
                baseUrl,
                parallel,
                ignoreRegex,
                level++,
                url
              )
            )
          )
        ).then((all) =>
          all.reduce(
            (prev, next) =>
              next.value ? ok(prev, next.value) : err(prev, next.reason),
            create()
          )
        );
      } else {
        let result = Promise.resolve(create(links));
        /*if (level >= 2) {
              console.log("BREAK");
              return result;
            }*/
        for (let i = 0; i < links.length; i++) {
          result = result.then((prev) =>
            crawl2(
              api,
              links[i],
              content,
              nextVisited,
              baseUrl,
              parallel,
              ignoreRegex,
              level++,
              url
            )
              .then((next) => ok(prev, next))
              .catch((error) => err(prev, error))
          );
        }

        return result;
      }
    });
};

const crawl = (api, { api: baseUrl }, content) => {
  const visited = [];

  return crawl2(
    api,
    "",
    content,
    visited,
    baseUrl,
    true,
    /(?:offset=(?:[2-9]|1[1-9][0-9]?)|f=[^h][^t][^m])/
  ).then((c) => {
    console.log("COUNTER", COUNTER);
    return c;
  });
};

export default async ({ sort, save: saveAs }, { api, opts, content, vars }) =>
  crawl(api, opts, content)
    .then((result) => {
      if (sort) {
        result.links.sort();
      }
      console.log(
        "LINKS2",
        result,
        result.links.length,
        [...new Set(result.links)].length
      );

      if (saveAs) {
        vars.save(saveAs, result.links);
      }
      return "CRAWL LOG";
    })
    //ignore errors in setup, requests will be repeated in test
    .catch((e) => {
      console.error(e);

      if (saveAs) {
        vars.save(saveAs, []);
      }
      return e;
    });
