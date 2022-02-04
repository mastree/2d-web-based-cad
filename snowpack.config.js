module.exports = {
    mount: {
      public: { url: '/', static: true },
      src: { url: '/src' },
    },
    buildOptions: {
        // put the build files in /docs
        out: 'docs',
        // put the meta snowpack build files under snowpack instead of _snowpack since Github special-cases underscore prefixed folders
        metaUrlPath: 'snowpack'
    }
}