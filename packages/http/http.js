import { agent, Test } from "supertest";
import { addContext } from "@catsjs/core";
import methods from "methods";

agent.prototype.context = function (context) {
  this.testContext = context;
  return this;
};

// override HTTP verb methods
methods.forEach(function (method) {
  var original = agent.prototype[method];
  //console.log('ORIG', original);
  agent.prototype[method] = function (url, fn) {
    // eslint-disable-line no-unused-vars
    var req = original.call(this, url, fn);

    req.context = this.testContext;
    delete this.testContext;

    //console.log('REQ', req);

    return req;
  };
});

const originalAssert = Test.prototype.assert;

//console.log('ASS', Test.prototype)

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
