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

    addContext(this.context, {
      title: "Request",
      value: request,
      language: "http",
    });
    addContext(this.context, {
      title: "Response",
      value: response,
      language: "http",
    });
  }

  originalAssert.call(this, resError, res, fn);
};

export default agent;
