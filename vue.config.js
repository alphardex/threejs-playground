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
  },
};
