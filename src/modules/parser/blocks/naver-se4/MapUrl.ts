export const buildNaverMapSearchUrl = (query: string) =>
  `https://map.naver.com/p/search/${encodeURIComponent(query)}`
