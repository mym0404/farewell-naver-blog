type SampleCorpusEntry = {
  id: string
  blogId: string
  logNo: string
  editorId: string
  editorVersion: number
  expectedWarnings?: {
    parser?: string[]
    reviewer?: string[]
    render?: string[]
  }
  post: {
    title: string
    publishedAt: string
    categoryId: number
    categoryName: string
    categoryPath: string[]
    thumbnailUrl: string | null
    source: string
  }
}

export const sampleCorpus: SampleCorpusEntry[] = [
  {
    id: "se4-video-table",
    blogId: "mym0404",
    logNo: "221302086471",
    editorId: "naver.se4",
    editorVersion: 4,
    post: {
      title: "휴머노이드 첫 Rigging 성공 애니메이션",
      publishedAt: "2018-06-19T13:16:43+09:00",
      categoryId: 35,
      categoryName: "Blender",
      categoryPath: ["Blender"],
      thumbnailUrl:
        "https://phinf.pstatic.net/image.nmv/blogucc28/2018/06/19/867/f18a79005b808502377d4b020c2641e0958e_ugcvideo_270P_01_16x9_logo.jpg",
      source: "https://blog.naver.com/mym0404/221302086471",
    },
  },
  {
    id: "se4-formula-code-linkcard",
    blogId: "mym0404",
    logNo: "223034929697",
    editorId: "naver.se4",
    editorVersion: 4,
    post: {
      title: "[백준] 9942 하노이의 네 탑, 1607 원숭이 타워",
      publishedAt: "2023-03-04T22:38:22+09:00",
      categoryId: 85,
      categoryName: "BOJ",
      categoryPath: ["Algorithm", "BOJ"],
      thumbnailUrl:
        "https://mblogthumb-phinf.pstatic.net/MjAyMzAzMDRfNTMg/MDAxNjc3OTM2NTg2NDU2.e5y0ziI9pO5MQMvTUNcVWLysAejftoYV5O83vFQAk3sg.aLBO_S1K-b4pQU0tOZ3ipv_r4uGR3BPXr8-gaT42riYg.PNG.mym0404/bg.png?type=w800",
      source: "https://blog.naver.com/mym0404/223034929697",
    },
  },
  {
    id: "se4-image-group",
    blogId: "mym0404",
    logNo: "224056819985",
    editorId: "naver.se4",
    editorVersion: 4,
    post: {
      title: "초간단 운전면허 필기 2026 - 첫 시험에서 합격하는 가장 확실한 방법",
      publishedAt: "2025-10-28T18:55:34+09:00",
      categoryId: 18,
      categoryName: "Daily",
      categoryPath: ["Daily"],
      thumbnailUrl:
        "https://mblogthumb-phinf.pstatic.net/MjAyNTEwMjhfMTAz/MDAxNzYxNjQ0NTc5Njc1.43EtjBHKBUENMLfYb279kooGwuikoeVTe_QMDNqMaoAg.96pBh3AVwoO8cdvS5KkkGMuXTSRnhgHjwmXShQ2wKP8g.PNG/ko-1.png?type=w800",
      source: "https://blog.naver.com/mym0404/224056819985",
    },
  },
  {
    id: "se4-heading-itinerary",
    blogId: "goyamee",
    logNo: "223511986798",
    editorId: "naver.se4",
    editorVersion: 4,
    post: {
      title: "전북 부안 가볼만한곳 변산반도 여행 1박2일 정산",
      publishedAt: "2024-07-14T09:31:32+09:00",
      categoryId: 80,
      categoryName: "▶ 방방곡곡",
      categoryPath: ["[국내여행]", "▶ 방방곡곡"],
      thumbnailUrl:
        "https://mblogthumb-phinf.pstatic.net/MjAyNDA3MTNfMjk5/MDAxNzIwODQ3NjY3OTE4.Kz7fHr5z0nKd4RCms8SuM8shdSdXn0FrA3P4ebGcPQAg.z8SI0didzxBNQw-N7K2WHzKSjAeis5_KurpilM37-jQg.PNG/%BA%CE%BE%C8_%B0%A1%BA%BC%B8%B8%C7%D1%B0%F7_%282%29.png?type=w800",
      source: "https://blog.naver.com/goyamee/223511986798",
    },
  },
  {
    id: "se4-image-legacy-link",
    blogId: "mym0404",
    logNo: "221589718939",
    editorId: "naver.se4",
    editorVersion: 4,
    post: {
      title: "[Outsourcing] 외주2",
      publishedAt: "2019-07-19T12:11:57+09:00",
      categoryId: 66,
      categoryName: "Outsourcing",
      categoryPath: ["Outsourcing"],
      thumbnailUrl:
        "https://mblogthumb-phinf.pstatic.net/MjAxOTA3MTlfMjkw/MDAxNTYzNTA1NzczODcw.uIJdF_uU_aV1Sm444n7B-cRewu97e3AGlD6V9qVEcMAg.wNNXNaRurOPPCL_uDYWxT3KEc2KxcyYmlS4nVMjcaUcg.PNG.mym0404/1.png?type=w800",
      source: "https://blog.naver.com/mym0404/221589718939",
    },
  },
  {
    id: "se4-quote-formula-code",
    blogId: "mym0404",
    logNo: "222619228134",
    editorId: "naver.se4",
    editorVersion: 4,
    post: {
      title: "[DP] Slope trick 공부 - BOJ - 19693 Safety",
      publishedAt: "2022-01-11T22:53:03+09:00",
      categoryId: 84,
      categoryName: "PS 알고리즘, 팁",
      categoryPath: ["Algorithm", "PS 알고리즘, 팁"],
      thumbnailUrl:
        "https://mblogthumb-phinf.pstatic.net/MjAyMjAxMTFfMzAw/MDAxNjQxOTAxMTY4NDI2.8akcjgeR4eBygaw-Aos4qS9Cl4K__Ms3xswjHEAWggAg.01-4GR4fCm4rUK_ywMmkcYx0mpoZMbdA_ooLeMIuxPEg.PNG.mym0404/bg.png?type=w800",
      source: "https://blog.naver.com/mym0404/222619228134",
    },
  },
  {
    id: "se2-legacy",
    blogId: "mym0404",
    logNo: "220496669802",
    editorId: "naver.se2",
    editorVersion: 2,
    post: {
      title: "2015년 10월 1일 오후 6시 33분에 저장한 글입니다.",
      publishedAt: "2015-10-01T18:33:19+09:00",
      categoryId: 18,
      categoryName: "Daily",
      categoryPath: ["Daily"],
      thumbnailUrl: null,
      source: "https://blog.naver.com/mym0404/220496669802",
    },
  },
  {
    id: "se2-code-image-autolayout",
    blogId: "mym0404",
    logNo: "221504285266",
    editorId: "naver.se2",
    editorVersion: 2,
    post: {
      title: "[iOS] 오토 레이아웃을 이용할 때 기기에 따라 적절한 값을 얻어오기",
      publishedAt: "2019-04-03T11:07:24+09:00",
      categoryId: 59,
      categoryName: "Tip",
      categoryPath: ["iOS", "Tip"],
      thumbnailUrl: null,
      source: "https://blog.naver.com/mym0404/221504285266",
    },
  },
  {
    id: "se2-table-rawhtml-navigation",
    blogId: "mym0404",
    logNo: "221459172607",
    editorId: "naver.se2",
    editorVersion: 2,
    expectedWarnings: {
      parser: ["SE2 GIF video 블록을 구조화하지 못해 원본 HTML로 보존했습니다."],
      reviewer: [
        "SE2 GIF video 블록을 구조화하지 못해 원본 HTML로 보존했습니다.",
        "fallback HTML 블록 1개가 포함됩니다.",
      ],
      render: [
        "SE2 GIF video 블록을 구조화하지 못해 원본 HTML로 보존했습니다.",
        "fallback HTML 블록 1개가 포함됩니다.",
      ],
    },
    post: {
      title: "[Android] Android Architecture Component(AAC) #5-1 : Navigation - Basic",
      publishedAt: "2019-02-06T09:53:27+09:00",
      categoryId: 60,
      categoryName: "Architecture",
      categoryPath: ["Android", "Architecture"],
      thumbnailUrl:
        "https://mblogthumb-phinf.pstatic.net/MjAxOTAyMDZfMTA0/MDAxNTQ5NDA2MzAxNjMx.yvJrtmBJP1HOloCZfCfI_oo4xxnZbqhEtct2h4sbWpAg.RY6DIb_lok5SJBDO-1pmxfY_z9zpLdab7jhCsp4cphIg.PNG.mym0404/1.png?type=w800",
      source: "https://blog.naver.com/mym0404/221459172607",
    },
  },
  {
    id: "se2-thumburl-image-group",
    blogId: "mym0404",
    logNo: "221425068566",
    editorId: "naver.se2",
    editorVersion: 2,
    post: {
      title: "트위치 로고, 카트라이더 부스터 로고를 만들어 보았다.",
      publishedAt: "2018-12-22T21:34:56+09:00",
      categoryId: 35,
      categoryName: "Blender",
      categoryPath: ["Blender"],
      thumbnailUrl:
        "https://mblogthumb-phinf.pstatic.net/MjAxODEyMjJfODcg/MDAxNTQ1NDgyMDg4NDY0.Dh6dlA-1uJ3KLQ15Iq4IjlOYhVtQNzPsBRRku6MU05Ug.bU9cS-HO872lQuf7Uj1rdUXgJWJl-UyphJTMdOlGeJgg.PNG.mym0404/double_moderator.png?type=w800",
      source: "https://blog.naver.com/mym0404/221425068566",
    },
  },
  {
    id: "se3-legacy",
    blogId: "mym0404",
    logNo: "221236891086",
    editorId: "naver.se3",
    editorVersion: 3,
    post: {
      title: "3월 25일 일요일",
      publishedAt: "2018-03-25T14:38:01+09:00",
      categoryId: 18,
      categoryName: "Daily",
      categoryPath: ["Daily"],
      thumbnailUrl: null,
      source: "https://blog.naver.com/mym0404/221236891086",
    },
  },
  {
    id: "se3-quote-imagegroup-note9",
    blogId: "sekishin",
    logNo: "221405258251",
    editorId: "naver.se3",
    editorVersion: 3,
    post: {
      title: "[Quick Review] 더 강력해진 Note- 삼성 갤럭시 노트9 (Samsung Galaxy Note9)",
      publishedAt: "2018-11-24T15:03:13+09:00",
      categoryId: 60,
      categoryName: "Review IT",
      categoryPath: ["IT", "Review IT"],
      thumbnailUrl:
        "https://mblogthumb-phinf.pstatic.net/MjAxODExMDZfNDUg/MDAxNTQxNDMyNDQ5NzMw.2pAP0hFxoYYl_Gutq5AhIqL3N5Z9-2AhOSEwK9-JdqYg.q2XelVfpsNJzliMBeV-mvzh9ffWUWt-5LQywlvG8pckg.JPEG.is02019/20181104_114001.jpg?type=w800",
      source: "https://blog.naver.com/sekishin/221405258251",
    },
  },
  {
    id: "se3-quote-table-vita",
    blogId: "sekishin",
    logNo: "221290869775",
    editorId: "naver.se3",
    editorVersion: 3,
    expectedWarnings: {
      parser: [
        "SE3 대표 미지원 블록을 원본 HTML로 보존했습니다: se_component se_horizontalLine default",
        "SE3 대표 미지원 블록을 원본 HTML로 보존했습니다: se_component se_horizontalLine line5",
        "SE3 대표 미지원 블록을 원본 HTML로 보존했습니다: se_component se_oglink og_bSize ",
      ],
      reviewer: [
        "SE3 대표 미지원 블록을 원본 HTML로 보존했습니다: se_component se_horizontalLine default",
        "SE3 대표 미지원 블록을 원본 HTML로 보존했습니다: se_component se_horizontalLine line5",
        "SE3 대표 미지원 블록을 원본 HTML로 보존했습니다: se_component se_oglink og_bSize ",
        "fallback HTML 블록 3개가 포함됩니다.",
      ],
      render: [
        "SE3 대표 미지원 블록을 원본 HTML로 보존했습니다: se_component se_horizontalLine default",
        "SE3 대표 미지원 블록을 원본 HTML로 보존했습니다: se_component se_horizontalLine line5",
        "SE3 대표 미지원 블록을 원본 HTML로 보존했습니다: se_component se_oglink og_bSize ",
        "fallback HTML 블록 3개가 포함됩니다.",
      ],
    },
    post: {
      title: "[Review PS Vita Game] 건담 브레이커 3 브레이크 에디션 (Gundam Breaker 3 BREAK EDITION)",
      publishedAt: "2018-06-03T23:13:07+09:00",
      categoryId: 74,
      categoryName: "Review PS Vita",
      categoryPath: ["PS Vita", "Review PS Vita"],
      thumbnailUrl:
        "https://mblogthumb-phinf.pstatic.net/MjAxODA2MDNfMjI1/MDAxNTI4MDM0NTQwNTg5.ERq5Wa-BGkly6OymiT-ruEFUigr43NXjjd25J1hXNxkg.yrCSnvvU0niyVKTC8_BINfqjLWi0g4QZoDashAlpHVgg.JPEG.is02019/2017-11-18-210621.jpg?type=w800",
      source: "https://blog.naver.com/sekishin/221290869775",
    },
  },
]
