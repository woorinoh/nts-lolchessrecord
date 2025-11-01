// scrape.js
const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const ID = "ee9acd22402e4571ace9a6c4d326c5d4"; // 즐겨찾기 ID
const URL = `https://lolchess.gg/api/favorites?id=${ID}`;

(async () => {
  try {
    // 1. API 요청
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();

    // 2. CSV 변환
    const players = data.favorites; // favorites 배열 안에 각 플레이어 정보
    if (!players || players.length === 0) {
      console.log("플레이어 데이터를 가져오지 못했습니다.");
      return;
    }

    const date = new Date().toISOString().slice(0,10).replace(/-/g,"");
    const time = new Date().toISOString().slice(11,19).replace(/:/g,""); // 중복 방지용 시간
    const dir = "records";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const file = `${dir}/${date}_${time}.csv`;
    const header = "Rank,Name,LP,URL\n";
    const body = players.map((p, i) => {
      const name = p.name || "";
      const lp = p.lp || "";
      const profile = p.url || "";
      return `${i+1},${name},${lp},${profile}`;
    }).join("\n");

    fs.writeFileSync(file, header + body);
    console.log(`✅ CSV 생성 완료: ${file}`);

  } catch (err) {
    console.error("❌ 스크래핑 실패:", err);
  }
})();
