const webpack = require("webpack");

module.exports = {
  productionSourceMap: false,
  publicPath: "/",
  chainWebpack: (config) => {
    config.module
      .rule("raw")
      .test(/\.(glsl|vs|fs|vert|frag)$/)
      .use("raw-loader")
      .loader("raw-loader")
      .end();
    config.module
      .rule("glslify")
      .test(/\.(glsl|vs|fs|vert|frag)$/)
      .use("glslify-loader")
      .loader("glslify-loader")
      .end();
    config.plugin("provide").use(webpack.ProvidePlugin, [
      {
        THREE: "three",
      },
    ]);
  },
};
