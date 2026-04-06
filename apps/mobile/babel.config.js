module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@raven-os/core": "../../packages/core/src",
            "@raven-os/ui": "../../packages/ui/src",
          },
        },
      ],
    ],
  };
};
