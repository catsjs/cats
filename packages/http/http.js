import { agent, Test } from "supertest";
import { addContext } from "@catsjs/core";

Test.prototype.ctx = function (context) {
  this.context = context;
  return this;
};

const originalAssert = Test.prototype.assert;

Test.prototype.assert = function (resError, res, fn) {
  //TODO: cfg showHeaders, showBody, truncateBody, onlyOnFailure, etc.
  if (this.context && res) {
    //TODO
    const showBody = true;
    console.log("REQUEST", res.request.url, this.compareIndex);
    let request = res.request.method + " " + res.request.url + " HTTP/1.1\n";
    for (const key of Object.keys(res.request.header)) {
      request += key + ": " + res.request.header[key] + "\n";
    }

    let response = "Status Code: " + res.status + "\n";
    for (const key of Object.keys(res.header)) {
      response += key + ": " + res.header[key] + "\n";
    }
    if (showBody) {
      response += "\n" + res.text; //TODO: res.body might have parsed body
    }

    saveContext(this.context, {
      title: "Request",
      value: request,
      language: "http",
      index: this.compareIndex,
    });
    saveContext(this.context, {
      title: "Response",
      value: response,
      language: "http",
      index: this.compareIndex,
    });
  }

  originalAssert.call(this, resError, res, fn);
};

const saveContext = (ctx, val) => {
  if (Array.isArray(ctx.test.context)) {
    const elem = ctx.test.context.findIndex(
      (entry) => entry.title === val.title
    );

    if (elem > -1) {
      ctx.test.context[elem].title += ` ${ctx.test.context[elem].index}`;
      val.title += ` ${val.index}`;
      const offset = val.index > ctx.test.context[elem].index ? 1 : 0;

      ctx.test.context.splice(elem + offset, 0, val);
      return;
    }
  }

  addContext(ctx, val);
};

export default agent;
