const site = {
  name: '91XS',
  url: 'https://你的域名.com',
  title: '91XS',
  titleTemplate: '%s - 91XS',

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
