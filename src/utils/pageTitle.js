import site from '../config/site'

export function setPageTitle(page, suffix = '') {
  document.title = site.getTitle(page, suffix)
}

export function setDefaultTitle() {
  document.title = site.title
}
