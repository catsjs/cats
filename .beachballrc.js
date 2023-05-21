module.exports = {
  bumpDeps: true,
  tag: "beta",
  prereleasePrefix: "beta",
  publish: false,
  push: false,
  groups: [
    {
      name: "cats",
      include: ["packages/*"]
    }
  ],
  transform: {
    changeFiles: (changeInfo) => {
      delete changeInfo.email;
      return changeInfo;
    }
  }
}
