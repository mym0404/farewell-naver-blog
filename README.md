<p align="left">
  <img src="public/brand/logo.svg" alt="Goodbye Naver Blog logo" width="88" />
</p>

# Goodbye Naver Blog

[![codecov](https://codecov.io/gh/mym0404/farewell-naver-blog/graph/badge.svg)](https://codecov.io/gh/mym0404/farewell-naver-blog)

네이버 블로그 공개 글을 스캔해서 Markdown, frontmatter, 로컬 자산, 복구 가능한 `manifest.json`으로 export하는 도구입니다.

![Goodbye Naver Blog Open Graph image](public/brand/og-image.png)

## 핵심

- `SE2`, `SE3`, `ONE(SE4)` 글을 한 번에 export할 수 있습니다.
- 여러 에디터에서 쓰는 본문 블록을 폭넓게 지원합니다.
- 이미지와 썸네일은 중복 저장을 줄이면서 정리합니다.
- 필요하면 export 뒤에 PicGo(PicList) 기반 여러 image provider로 이미지를 업로드하고 Markdown 경로를 바꿉니다.
- 로컬 웹 UI에서 범위 선택과 옵션 조절까지 바로 할 수 있습니다.

지원 범위는 공개 글만입니다.

## 빠른 시작

### 요구 사항

- Node.js `20+`
- pnpm

### 설치

```bash
git clone https://github.com/mym0404/farewell-naver-blog.git
cd farewell-naver-blog
pnpm install
```

### 실행

```bash
pnpm start
```

브라우저에서 [http://localhost:4173](http://localhost:4173) 을 열면 됩니다.

기본 흐름은 아래와 같습니다.

1. 블로그 ID 또는 URL 입력
2. 공개 글 스캔
3. 카테고리/날짜 범위 선택
4. export 실행
5. `output/` 아래 결과 확인

## 출력 예시

```text
output/
  개발/
    JavaScript/
      2024-01-02-hello-world/
        index.md
  public/
    2a4c...9f.png
  manifest.json
```

## 실제 예시

| Metadata | Links | Naver Capture | Markdown |
| --- | --- | --- | --- |
| SE2 image block | [Naver](https://blog.naver.com/mym0404/221504285266) | ![Naver Capture](.agents/knowledge/reference/assets/readme/mym0404-221504285266-path-1-0-2-naver.png) | <pre><code>![](https://ssl.pstatic.net/static/blog/blank.gif)<br></code></pre> |
| SE2 code block | [Naver](https://blog.naver.com/mym0404/221504285266) | ![Naver Capture](.agents/knowledge/reference/assets/readme/mym0404-221504285266-path-1-7-0-naver.png) | <pre><code>```<br>class Device {<br>    // Base width in point, use iPhone 6<br>    static let base: CGFloat = 375<br>    static var ratio: CGFloat {<br>        return UIScreen.main.bounds.width / base<br>    }<br>}<br>```<br></code></pre> |
| SE2 embedded video block | [Naver](https://blog.naver.com/cuk1026/110167789656) | ![Naver Capture](.agents/knowledge/reference/assets/readme/cuk1026-110167789656-path-7-naver.png) | <pre><code>[Video](http://videofarm.daum.net/controller/video/viewer/Video.html?vid=v855c4MLyyLL5LLBiB5MB4L&amp;play_loc=undefined&amp;__authenticIframe=true)<br></code></pre> |
| SE3 quote block | [Naver](https://blog.naver.com/sekishin/221405258251) | ![Naver Capture](.agents/knowledge/reference/assets/readme/sekishin-221405258251-path-4-naver.png) | <pre><code>&gt; The&nbsp;new&nbsp;super&nbsp;powerful&nbsp;Note<br></code></pre> |
| SE3 image group block | [Naver](https://blog.naver.com/sekishin/221405258251) | ![Naver Capture](.agents/knowledge/reference/assets/readme/sekishin-221405258251-path-8-naver.png) | <pre><code>![](https://mblogthumb-phinf.pstatic.net/MjAxODExMDZfMTA0/MDAxNTQxNDMyMzkyNDc5.K9sjeXO4gJvR3Wnpak3Rg9oiaz2NpKdDLVL2CHoirY8g.Eo8OpuEfeuKrWgZ9gsbd1g46z0XP4ri65D1he9TN0GIg.JPEG.is02019/image_9414533351541431971760.jpg?type=w800)<br><br>![](https://mblogthumb-phinf.pstatic.net/MjAxODExMDZfNTgg/MDAxNTQxNDMyNDI0NzYy.mtcfEcZqVQWYzY2H1vL_YE5aqXK5LtPJ_bvsVOmaxIgg.UwyJB70-gQL-ksdFkaw-oH_F0qSYFCUKVdDwEV7v8E4g.JPEG.is02019/image_5391002611541431971760.jpg?type=w800)<br></code></pre> |
| SE4 heading block | [Naver](https://blog.naver.com/goyamee/223511986798) | ![Naver Capture](.agents/knowledge/reference/assets/readme/goyamee-223511986798-path-4-naver.png) | <pre><code>## **전북 부안 가볼만한곳**<br></code></pre> |
| SE4 link card block | [Naver](https://blog.naver.com/mym0404/223034929697) | ![Naver Capture](.agents/knowledge/reference/assets/readme/mym0404-223034929697-path-2-naver.png) | <pre><code>[9942번: 하노이의 네 탑](https://www.acmicpc.net/problem/9942)<br><br>9942번 제출 맞힌 사람 숏코딩 재채점 결과 채점 현황 질문 게시판 하노이의 네 탑 다국어 시간 제한 메모리 제한 제출 정답 맞힌 사람 정답 비율 3 초 128 MB 724 204 151 32.059% 문제 하노이의 탑 이라는 유명한 문제가 있다. 하지만 이 문제는 너무 유명한 나머지 이제는 식상하다. 그러니까 이번엔 탑을 3개가 아닌 4개로 늘려서 생각해보자! N개의 원판과 4개의 막대가 있을 때, 즉 보조 막대가 한 개가 아닌 두 개이면 몇 번 움직여서 모든 원판을 끝의 원판으로 옮길 수 있을까? 4개의 막대를 이용해서 N개의...<br></code></pre> |
| SE4 formula block | [Naver](https://blog.naver.com/mym0404/223034929697) | ![Naver Capture](.agents/knowledge/reference/assets/readme/mym0404-223034929697-path-10-naver.png) | <pre><code>$$<br>f\left(n\right)=MIN_{1\le k&lt;n}\left\{f\left(k\right)+g\left(n-k\right)+f\left(k\right)\right\}<br>$$<br></code></pre> |
| SE4 code block | [Naver](https://blog.naver.com/mym0404/223034929697) | ![Naver Capture](.agents/knowledge/reference/assets/readme/mym0404-223034929697-path-12-naver.png) | <pre><code>```javascript<br>const ll mod = 9901;<br>inline ll md(ll x) { return md(mod, x); }<br>void solve() {<br>   int n, t = 1;<br><br>   vi g(1000001);<br>   g[1] = 1;<br>   for (int i = 2; i &lt;= 1000000; i++) {<br>      g[i] = md(g[i - 1] * 2 + 1);<br>   }<br>   vi f(1000001);<br>   f[1] = 1;<br>   f[2] = 3;<br>   f[3] = 5;<br>   for (int i = 4; i &lt;= 1000000; i++) {<br>      int k = i - round(sqrt(i * 2 + 1)) + 1;<br>      f[i] = md(f[k] * 2 + g[i - k]);<br>   }<br>   cin &gt;&gt; n;<br>   cout &lt;&lt; f[n];<br>}<br>```<br></code></pre> |
| SE4 table block | [Naver](https://blog.naver.com/mym0404/221302086471) | ![Naver Capture](.agents/knowledge/reference/assets/readme/mym0404-221302086471-path-4-naver.png) | <pre><code>&#124; ㅗㄷ &#124; 1 &#124; 2 &#124;<br>&#124; --- &#124; --- &#124; --- &#124;<br>&#124; 3 &#124; 4 &#124; 5 &#124;<br>&#124; 6 &#124; 7 &#124; 8 &#124;<br></code></pre> |
