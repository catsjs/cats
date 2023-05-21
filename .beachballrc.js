module.exports = {
  bumpDeps: true,
  tag: "beta",
  prereleasePrefix: "beta",
  publish: false,
  push: false,
  groups: [
    {
      name: "cats",
      include: ["", "packages/*"]
    }
  ],
  changelog: {
    groups: [{
      masterPackageName: "cats",
      changelogPath: ".",
      include: [".", "packages/*"]
    }],
    customRenderers: {
      //renderChangeTypeHeader:,
      renderEntry: (entry) => `- ${entry.comment}`,
    }
  },
}
