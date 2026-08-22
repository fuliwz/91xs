const site = {
  // Central site identity. Change these values here instead of editing views.
  name: '91XS',
  url: 'https://91xs-8ri.pages.dev',
  title: '91XS',
  description: '91XS 视频、福利图片与精彩小说',
  titleTemplate: '%s - 91XS',

  // Same-origin Pages Functions endpoints. The browser must never call lbapi9.com directly.
  api: {
    vod: '/api/vod',
    article: '/api/art',
  },

  pages: {
    home: '首页',
    category: '视频分类',
    search: '搜索',
    detail: '视频详情',
    play: '在线播放',
    history: '播放记录',
    image: '福利图片',
    imageDetail: '图片详情',
    novel: '精彩小说',
    novelDetail: '小说详情',
  },

  routes: {
    home: '/',
    category: '/category/:id',
    search: '/search',
    detail: '/detail/:id',
    play: '/play/:id',
    history: '/history',
    image: '/image',
    imageDetail: '/image/:id',
    novel: '/novel',
    novelDetail: '/novel/:id',
  },

  getTitle(page, suffix = '') {
    const pageTitle = this.pages[page] || page || this.title
    const extra = suffix ? ` - ${suffix}` : ''
    return pageTitle === this.title ? this.title : `${pageTitle}${extra} - ${this.name}`
  },
}

export default site
