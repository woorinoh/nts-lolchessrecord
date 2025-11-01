const fs = require("fs");
const { chromium } = require("playwright");

const URL = "https://lolchess.gg/favorites?id=ee9acd22402e4571ace9a6c4d326c5d4";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });

  const players = await page.$$eval(".favorites__list .favorites__item", items =>
    items.map((el, i) => {
      const name = el.querySelector(".summoner__name")?.textContent?.trim();
      const lp = el.querySelector(".league__points")?.textContent?.trim();
      const profile = el.querySelector("a")?.href;
      return { rank: i + 1, name, lp, profile };
    })
  );

  const date = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const dir = "records";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const file = `${dir}/${date}.csv`;
  const header = "Rank,Name,LP,URL\n";
  const body = players.map(p => `${p.rank},${p.name},${p.lp},${p.profile}`).join("\n");
  fs.writeFileSync(file, header + body);

  await browser.close();
})();
