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
    home: '首页', category: '视频分类', search: '搜索', detail: '视频详情', play: '在线播放',
    history: '播放记录', image: '福利图片', imageDetail: '图片详情', novel: '精彩小说', novelDetail: '小说详情',
  },

  footer: {

    disclaimer: '警告︰本網站只這合十八歲或以上人士觀看。內容可能令人反感；不可將本網站的內容派發、傳閱、出售、出租、交給或借予年齡未滿18歲的人士或將本網站內容向該人士出示、播放或放映。
LEGAL DISCLAIMER WARNING: THIS FORUM CONTAINS MATERIAL WHICH MAY OFFEND AND MAY NOT BE DISTRIBUTED, CIRCULATED, SOLD, HIRED, GIVEN, LENT,SHOWN, PLAYED OR PROJECTED TO A PERSON UNDER THE AGE OF 18 YEARS.

站点申明：我们立足于美利坚合众国，受北美法律保护,未满18岁或被误导来到这里，请立即离开',
  },

  routes: {
    home: '/', category: '/category/:id', search: '/search', detail: '/detail/:id', play: '/play/:id', history: '/history',
    image: '/image', imageList: '/image/list/:id', imageDetail: '/image/:id',
    novel: '/novel', novelList: '/novel/list/:id', novelDetail: '/novel/:id',
  },

  getTitle(page, suffix = '') {
    const pageTitle = this.pages[page] || page || this.title
    const extra = suffix ? ` - ${suffix}` : ''
    return pageTitle === this.title ? this.title : `${pageTitle}${extra} - ${this.name}`
  },
}

export default site
