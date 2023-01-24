import chai, { expect } from "chai";
import cheerio from "cheerio";

//TODO: check https://github.com/i-like-robots/chai-html
chai.use(function (_chai, utils) {
  utils.addMethod(_chai.Assertion.prototype, "equal2", function (other) {
    this.assert(
      this._obj === other,
      "expected Response 1 to equal Response 2",
      "expected Response 1 to not equal Response 2",
      other,
      this._obj
    );
  });
});

export const status = ({ status }, test) => test.expect(status);

export const equals = ({ reverse, ignore = {}, equalize = {} }, test) => {
  test.addComparison((res1, res2) => {
    diff(res1.text, res2.text, equalize);
  });

  return test;
};

//TODO: per content type
const diff = (source, target, equalize) => {
  const html1 = cheerio.load(source);
  let html2 = cheerio.load(target).html();

  for (let i = 0; i < Object.keys(equalize).length; i++) {
    const key = Object.keys(equalize)[i];
    if (!equalize[key]) {
      throw new Error("diff - invalid equalizer given: " + key);
    }
    html2 = html2.replaceAll(key, equalize[key]);
  }

  //fs.writeFileSync("req1", html1.html());
  //fs.writeFileSync("req2", html2);

  //html1.should.have.html(html2);

  expect(html1.html()).to.equal2(html2);
};
