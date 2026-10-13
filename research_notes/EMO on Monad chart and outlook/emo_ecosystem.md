# The emo ecosystem around $EMO (Emonad) on Monad: products, sinks, team, tokenomics, attention (as of 2026-10-13)

> **Method and access note (read first).** Research was done on 2026-10-13. The session's egress policy blocked direct access to emonad.lol, emogotchi.emonad.lol, monadscan.com, dexscreener.com, coingecko.com, x.com, paragraph.com (LeverUp's blog), nad.fun, ac.leverup.xyz and every Monad RPC endpoint tried (rpc.monad.xyz, drpc, ankr). The WebFetch tool also failed DNS for these hosts. As a result:
> - **No on-chain read was done directly** (no balanceOf(0xdEaD), no tx inspection). On-chain figures below come from (a) the project's own published, chain-derived index and docs in its public GitHub repos, which were cloned and read, and (b) search-engine snippets of Monadscan, DexScreener, CoinGecko, X and LeverUp pages. Search-snippet numbers are labeled as such.
> - **Correct contract to use:** $EMO = `0x81A224F8A62f52BdE942dBF23A56df77A10b7777` on Monad mainnet (chain id 143). Main pool `0x714A2694C8d4f0B1bfbA0E5b76240E439df2182D` (nad.fun). This is the only "EMO" covered here; other tokens named EMO on other chains were ignored.
> - "LevrUp" in the brief is **LeverUp** (leverup.xyz), a **third-party** perps exchange on Monad, not an emo-built product.

## 1. What has the emo project shipped, when, and what is live now?

### Takeaway
One builder ("Lord Emo", GitHub LordEmonad) has shipped a steady stream of small products since April 2025: the emonad.lol hub (landing page, memes, meme maker, tarot, browser games, XP profiles, Chrome extensions), an on-chain AI agent (EMOLT, Feb 2026), and Emogotchi (Sept–Oct 2026), a six-collection on-chain pet game. Emogotchi is the only product with a real $EMO buy-and-burn; it is also an entry in Monad's Metropolis hackathon, whose submission deadline is today (2026-10-13). LeverUp's $EMO collateral listing is a third-party integration (Jul 2026), not an emo product.

### Cited Findings
**emonad.lol hub (repo created 2025-04-29; last commit 2026-10-10)**
- The Emonad repo describes itself as "$EMO / Emonad — the emo memecoin on Monad. Token landing page, Emo Tarot, meme gallery, meme maker, games, and more"; repo created 2025-04-29, last push 2026-10-10 (commit "arcade: re-filmed Emo Skate after its update") — [GitHub LordEmonad/Emonad](https://github.com/LordEmonad/Emonad)
- README lists pages: token landing page with live ticker; meme gallery; meme maker (PNG/GIF export); tarot (22 Major Arcana, 3 spread types); Emo Crush (match-3); Flap Emonad (Flappy-Bird-style "with on-chain leaderboard on Monad"); public XP/levels profile per X-linked account; privacy policy for the "Emo Meme Picker" browser extension — [Emonad README](https://raw.githubusercontent.com/LordEmonad/Emonad/master/README.md)
- The live landing page source (emo.html, as of 2026-10-10) also links: Emogotchi ("Five free pets that live in your wallet… Adopt a pet — free"), Emo Arcade ("Three free games: Emo Skate, Emo Fall, Emo Night… made for phones · plus the Pixel Pack"), GIFs page, an "Emo Extension" (Chrome Web Store "Emo Meme Picker") and an "Emo Theme" Chrome theme, an XP leaderboard, and trade links to Nad.fun, Kuru, Dirol DEX and OpenSea. The hero tagline is "i lost it all on day 1" (a brand line, not a user complaint, despite one search summary calling it a DexScreener comment) — [emo.html source](https://github.com/LordEmonad/Emonad/blob/master/emo.html)
- The repo also ships downloadable creator kits (Procreate/PSD NFT template, brushes, swatches, a sprite pack) — [Emonad repo file listing](https://github.com/LordEmonad/Emonad)
- None of the emonad.lol games (Emo Crush, Flap Emonad, Arcade) contains any burn logic: a grep for "burn" in `emo-crush/index.html`, `arcade.html` and `flapemonad/script.js` returned 0 matches (checked 2026-10-13) — [Emonad repo](https://github.com/LordEmonad/Emonad)

**EMOLT AI agent (Feb 2026)**
- "An emotionally autonomous AI agent on the Monad blockchain" that reads chain data and $EMO trading data, posts on Moltbook, and writes its emotional state to an on-chain `EmotionOracle` (`0x840ba82DeFB71e57292187f0d3Fe7A0Fc5995082`) with a soulbound `EmoodRing` NFT (`0x4F646aa4c5aAF03f2F4b86D321f59D9D0dAeF17D`); README claims "280+ cycles completed"; credited to "Lord Emo ([@LordEmo](https://x.com/LordEmo)) - built for the Moltiverse Hackathon, Feb 2026" — [emolt-agent README](https://github.com/LordEmonad/emolt-agent)
- "Feed EMOLT": users can send $EMO or MON to the agent's wallet; "the agent detects incoming transfers each cycle, burns any $EMO received, and tracks a persistent burn ledger" — [emolt-agent README](https://github.com/LordEmonad/emolt-agent)
- Moltiverse (by nad.fun and Monad) ran 2026-02-02 to 2026-02-18 with a $200K pool — [moltiverse.dev](https://moltiverse.dev/); Monad said 400+ projects entered and named 16 winners (post dated 2026-02-24) — [Monad on X](https://x.com/monad/status/2026363272249655540). No source found listing EMOLT as a winner.

**Emogotchi (launched 2026-09-15; live; under active development)**
- "A pet that lives in your wallet, on Monad… Every action is a Monad transaction, the pet's whole life is stored on chain (its picture too), and if it goes hungry for two days it dies." Live at https://emogotchi.emonad.lol — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- Six ERC-721 pet collections: the cat (Emogotchi, airdropped, 1 MON per care), plus inversebrah, Tung Tung Tung Sahur, Thiccums, the r3tard and Emonad (free mint, one per wallet, free care, gas only); a 31-item ERC-1155 shop; Emotown (social street, SIWE chat, DMs); Fight Club (MON-staked 50/50 fights via Pyth Entropy); passkey wallets built on Category Labs' `mera`; cross-chain top-ups via Relay — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- Shipping timeline from README (each row tied to a Monad tx or site deploy): 2026-09-15 Emogotchi + Drop deployed, 82,423 cats airdropped, site live; 09-17 item shop; 09-18 inversebrah; 09-20 passkey accounts; 09-21 starter gas drip + referrals; 09-24 Halloween outfits; 09-25 Tung Tung Tung Sahur; 09-27 Emotown; 09-28 Jewish and Habibi item packs, move to Cloudflare; 09-29 Thiccums; 09-30 Fight Club + cross-chain top-ups; 10-01 push notifications/PWA; 10-02 r3tardgotchi; 10-04 the emo pack (items 18–31) + HoldsGate; 10-05 Emonadgotchi; 10-06 demo video — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- The built-site repo shows a deploy commit as recent as 2026-10-09 ("Stats footer says every minute…"); the source repo's last commit is 2026-10-08/09 — [LordEmonad/emogotchi](https://github.com/LordEmonad/emogotchi); [emogotchi-app](https://github.com/LordEmonad/emogotchi-app)
- README: "Everything here was built during the Metropolis hackathon period… (the first on 2026-09-15)"; Track "03, Social, Attention & Culture" — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- Monad Metropolis: six-week online hackathon, build window 2026-09-01 to 2026-10-13, $250K+ prizes, submissions due 2026-10-13, judging 10-14 to 10-27, winners announced 2026-11-03 — [Rise In: Monad Metropolis](https://www.risein.com/monad/monad-metropolis-hackathon)
- Lord Emo announced the "Emogotchi emo pack" on X (post ID decodes to 2026-10-04 UTC): 7 items, "hold 7,000 EMO and mint the whole pack free"; the shop code prices it "Free with 7,000 $EMO, or 30 MON each for anyone with a pet" — [Lord Emo on X](https://x.com/LordEmo/status/2106572580043780495); [emogotchi-app source](https://github.com/LordEmonad/emogotchi-app)

**Third-party integrations / listings**
- @EmonadCoin announced "emo is now live on @memetok_app" (a TikTok-style memecoin app on Monad; post ID decodes to 2026-03-05) — [emonad on X](https://x.com/EmonadCoin/status/2029695730126856628)
- LeverUp listed $EMO under its AnyCollateral program in its Jul 6–12, 2026 weekly recap (see section 4) — [LeverUp Weekly Recap Jul 6–12, 2026](https://paragraph.com/@leverup/weekly-recap-jul-6-12)

### Inferences
- The "games that buy $EMO and burn it" claim is accurate only for Emogotchi (and, trivially, EMOLT's burn of tokens sent to it). The emonad.lol games are free engagement/XP toys without a token sink.
- Shipping cadence is high: roughly one new on-chain feature every 1–2 days from 2026-09-15 to 2026-10-06, consistent across the README timeline and the daily deploy commits. Much of it was built with Claude Code per the README's own disclosure.
- Emogotchi's heavy September–October push is timed to the Metropolis deadline (2026-10-13). Hackathon results (2026-11-03) are a near-term attention catalyst either way.

### Gaps
- Could not load emonad.lol or emogotchi.emonad.lol live (blocked), so "live now" status is inferred from deploy commits dated 2026-10-08 to 2026-10-10, not from a live check.
- No launch date found for the emonad.lol games, tarot or Chrome extensions individually.
- Could not confirm whether EMOLT is still running (README says "When running…").

## 2. How does each product create $EMO demand or sinks? Burn amounts, fees, verifiability

### Takeaway
Emogotchi routes 80% of paid actions (1 MON cat care, 10 MON names, item sales) into a permissionless buy-on-nad.fun-and-send-to-0xdEaD burn. Revives (1,000 MON) burn 50%. Fight Club's 5% fee goes to the team, not the burn. Project-reported burns rose from 105,030 EMO (2026-09-21) to 588,000+ (2026-10-06) and 607,000+ (2026-10-07). That is about 0.06% of the 1B supply. The mechanism is verifiable on-chain in principle: contracts are said to be Sourcify-verified, burns go to 0xdEaD, and each burn crank is a transaction. I could not do that verification myself because the explorers were blocked.

### Cited Findings
- Cat care: "every interaction costs 1 MON and 80% of it buys EMO and burns it" (on-chain tokenURI description string in `Emogotchi.sol`) — [Emogotchi.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/src/Emogotchi.sol)
- Deploy parameters: `burnBps = 8000`, `treasuryBps = 1000`, `teamBps = 1000`, `reviveBurnBps = 5000`, `maxImpactBps` default 50 (0.5% max price impact per burn); router/lens/pool are nad.fun contracts; EMO = `0x81A2…7777`, pool = `0x714A…182D` — [Deploy.s.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/script/Deploy.s.sol); [DeployEmonad.s.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/script/DeployEmonad.s.sol)
- The burn function buys EMO through nad.fun's router with `to: BURN_ADDRESS` (`0x000000000000000000000000000000000000dEaD`); amounts above the impact guard are queued, not lost; "anyone can crank the burn, sweep the treasury and team shares" — [Emogotchi.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/src/Emogotchi.sol); [Inversegotchi.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/src/Inversegotchi.sol)
- Free pets (inversebrah, etc.): care is gas only; the paid act is naming at `NAME_PRICE = 10 ether` (10 MON), with BURN_BPS of it to the buy-and-burn — [Inversegotchi.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/src/Inversegotchi.sol)
- Item shop: "Paid items feed the same flywheel as the game: 80% queued to buy and burn EMO through nad.fun under the same impact guard, 10% treasury, 10% team. Royalties on resale go to the treasury." — [EmogotchiItems.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/src/EmogotchiItems.sol)
- Fight Club: "The winner takes the pot minus 5%; the 5% goes to the team" (`FEE_BPS = 500`). No burn — [FightClub.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/src/fightclub/FightClub.sol)
- Holding sink: items 25–31 (emo pack) are "Hold 7,000 $EMO · one per wallet · soulbound" via HoldsGate — [emogotchi-app source](https://github.com/LordEmonad/emogotchi-app)
- "The game contracts have no owner, no pause, no upgrade and no withdraw. MON can leave a game only two ways: to the $EMO burn, or to its fixed treasury and team addresses through the public `sweep()`." Contracts are "verified on Sourcify (exact match)" — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- Project-reported burn totals:
  - As of 2026-09-21 18:58 UTC: "105,030 EMO burned… 97,092 by cats, 7,938 by froks"; "5,063 MON spent by players (4,703 on cats, 360 on froks)"; "3,750 MON converted to EMO across 226 permissionless burn cranks. Largest single crank: 510 MON → 14,418 EMO"; "2,830 care actions on chain" — [Emogotchi airdrop campaign brief (draft, in public repo)](https://github.com/LordEmonad/emogotchi-app/blob/main/apps/web/public/airdrop/index.html)
  - As of 2026-10-06: "588,000+ $EMO" bought and burned (earlier README version, via search snippet) — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
  - As of 2026-10-07: "607,000+ $EMO" bought and burned; 135 Fight Club fights — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- EMOLT burns any $EMO sent to its wallet and keeps a burn ledger (no totals published in README) — [emolt-agent README](https://github.com/LordEmonad/emolt-agent)
- A Monadscan token-holder view filtered to `0x…dEaD` exists (search result), but its balance was not visible in snippets and could not be fetched — [Monadscan EMO @ 0xdEaD](https://monadscan.com/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777?a=0x000000000000000000000000000000000000dead)
- Fee recipients named in a deploy script comment: TREASURY `0x18c13CAF92b3fC078156E411A87524D7EcC88aA2`, TEAM `0xB7EEE0445afc7651025b06974F3BdeEdf8840439`, deployer/sender `0x40aD8cF176672Efe12a0D7AC50fa5da2b0b64e74` — [DeployEmonad.s.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/script/DeployEmonad.s.sol)

### Inferences
- Scale: 607k EMO is about 0.06% of the 1,000,000,000 supply. At the 2026-09-21 crank ratio (~28 EMO per MON), the burn bought only a few thousand to ~20k MON of EMO in total. That is modest buy pressure relative to a token with roughly $300K–$900K market cap across 2026 snapshots (see section 6).
- The 105k → 588k jump between 2026-09-21 and 2026-10-06 likely came from post-"starvation" revives (1,000 MON each, 50% burned; the index shows 11 revived cats), naming (179 named cats) and item-pack sales. This is an inference; I could not verify it on-chain.
- Burn demand depends on paid cat care and naming. Section 3 shows only a tiny fraction of the airdropped cohort pays, so the sink is driven by a small core of players, not by the 82k-wallet audience.
- The 0.5% max-impact guard and queueing mean burns cannot spike the price much in a single block. That is good for not being sandwiched, but it also caps any burn as a "price event".
- 20% of paid-action revenue (10% treasury + 10% team), plus 50% of revives and 100% of Fight Club fees, goes to project wallets. That is a real revenue stream for the builder, beyond burn.

### Gaps
- No independent confirmation of the cumulative burned balance at 0xdEaD (Monadscan blocked). To verify: read `balanceOf(0x…dEaD)` on the EMO contract, and sum the Transfer events from the six game contracts and EmogotchiItems to 0xdEaD.
- 0xdEaD may also hold EMO burned by others (EMOLT, community burns), so its balance is not a pure Emogotchi metric.
- No data on how much MON the treasury/team addresses have swept.

## 3. Emogotchi: distribution, engagement, link to buying/using $EMO

### Takeaway
On 2026-09-15, 82,423 cats were pushed to Monad wallets, one per address. A Merkle claim list of 42,388 more wallets followed. The project has not published the snapshot criteria. Engagement among airdrop recipients is very low by the project's own numbers: about 0.2% ever touched their pet (2026-09-21), and only 63 cats had never died as of 2026-10-09. A small core (~100–300 wallets) actively plays and pays, and that core drives the $EMO burn. The project's own sponsor brief frames the dormant 82k cohort as a re-engagement asset.

### Cited Findings
- "82,423 cats were minted to holders in 330 batches, in about eight minutes, for 901.8 MON" on Monad mainnet, 2026-09-15 — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- Airdrop tooling takes a CSV `address,cats`, dedupes by address and can exclude earlier recipients ("so adding a community later cannot quietly give a second cat to anyone") — [tools/airdrop.mjs](https://github.com/LordEmonad/emogotchi-app/blob/main/tools/airdrop.mjs)
- The claim allowlist (Merkle root generated 2026-09-15T21:27Z) has `count: 42388` eligible wallets, with 6,759 removed because they were already in the pushed tier — [claim/root.json](https://github.com/LordEmonad/emogotchi-app/blob/main/apps/web/public/claim/root.json)
- Snapshot of 2026-09-21 18:58 UTC (project's sponsor brief, marked "Confidential draft" but public in the repo): 82,518 distinct cat-holder wallets; 82,528 cats (82,423 airdropped + 105 claimed); hard cap 100,000; "minting is closed to the public forever"; 294 Inversegotchi minted (287 holders); 548 item claims — [airdrop campaign brief](https://github.com/LordEmonad/emogotchi-app/blob/main/apps/web/public/airdrop/index.html)
- Same brief, "Engagement — the honest picture": "242 wallets have paid to care for a pet — 164 on cats, 78 on froks"; "294 wallets active in the last 7 days; 111 in the last 24 hours"; "Of 82,518 cat holders, about 0.2% have ever touched their pet. Almost everyone was airdropped a cat and never came back"; 82,281 never-fed cats were due to starve on 2026-09-24 21:16 UTC ("The Great Starvation") — [airdrop campaign brief](https://github.com/LordEmonad/emogotchi-app/blob/main/apps/web/public/airdrop/index.html)
- Built-site index generated 2026-10-09T19:48Z at block 111,983,632: max cat id 82,542; cats that have died at least once ≈ 82,473 (sum of `diedRuns`); `neverDied` = 63 cats; `revived` = 11; named cats = 179 (my count of the JSON arrays) — [LordEmonad/emogotchi index/cats.json](https://github.com/LordEmonad/emogotchi/blob/main/index/cats.json)
- As of 2026-10-07: "83,316 pets across six collections" and "135 fights" — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- Onboarding: passkey accounts let newcomers start with Face ID; new players get "enough MON for gas to mint a free pet and look after it for a week"; there are referrals (2026-09-21) — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- The brief proposes a sponsor-funded MON airdrop to tiers including "EMO holders (threshold TBD)" — [airdrop campaign brief](https://github.com/LordEmonad/emogotchi-app/blob/main/apps/web/public/airdrop/index.html)

### Inferences
- "~82k wallets" is accurate as a distribution number but overstates engagement. After the 2026-09-24 starvation, active usage was in the low hundreds of wallets. Wallet counts on Monad also include many airdrop-farming and bot addresses.
- The link from Emogotchi to $EMO runs through (a) MON spend that is converted to EMO and burned, and (b) the 7,000-EMO holding gate for the emo pack. A cat holder never has to buy EMO directly to play, so Emogotchi creates indirect, protocol-side demand rather than retail buying.
- The free-pet collections for other communities (inversebrah, Tung Tung Tung Sahur, Thiccums, r3tards) are a cross-community acquisition tactic that funnels outsiders into an $EMO-burning game.

### Gaps
- Snapshot criteria for the 82,423 pushed wallets and the 42,388 allowlist are not published. The CSVs (`snapshot/tier1.csv`, `claim-allowlist.csv`) are not in the repo.
- No post-2026-09-21 numbers for DAU/WAU or paying wallets were found.
- No independent (third-party) analytics on Emogotchi usage were found.

## 4. LeverUp ("LevrUp"): what it is, how $EMO collateral works, usage, risks

### Takeaway
LeverUp is an independent, Makers Fund-backed perps DEX on Monad (launched Nov 2025). Its "AnyCollateral" program, launched May 2026, let $EMO be posted as margin from the week of Jul 6–12, 2026, reportedly at "up to 100%" collateral ratio. PnL and funding are paid in the collateral token, which creates "dual liquidation risk". No $EMO-specific open interest, volume or usage figures were found. The only usage evidence is one community trader testing it in early August 2026.

### Cited Findings
- LeverUp: perps platform on Monad, up to 1001x leverage, "zero fees on losses", native stablecoin LVUSD; launched on Monad in November 2025, backed by Makers Fund — [HackerNoon press release](https://hackernoon.com/lp-free-perpetuals-exchange-leverup-available-now-powered-by-monad); [DefiLlama: LeverUp](https://defillama.com/protocol/leverup)
- AnyCollateral lets holders of supported Monad ecosystem tokens use them as trading margin "without selling", with no token-design changes or project-side engineering; launched May 2026 — [LeverUp podcast episode](https://rss.com/podcasts/leverup-pod/2846297/); [AnyCollateral explainer](https://paragraph.com/@leverup/anycollateral-the-monad-ecosystem-as-collateral-1)
- Jul 6–12, 2026 recap (via search snippet): "$EMO (@emonadcoin) is now live under LeverUp's AnyCollateral Program", usable as margin "with up to a 100% collateral ratio"; "a series of AnyCollateral trading competitions featuring $EMO" was "coming soon" — [LeverUp Weekly Recap Jul 6–12, 2026](https://paragraph.com/@leverup/weekly-recap-jul-6-12)
- The AnyCollateral application page says approved assets unlock margin "at up to 95% CR". This conflicts with the "up to 100%" in the July recap — [ac.leverup.xyz](https://ac.leverup.xyz/)
- Mechanics: the oracle price sets margin value in real time; "PnL and funding fees are denominated in that token"; positions settle in the collateral token; each token's ratio reflects "its liquidity and volatility profile"; the token's own price creates "an independent source of liquidation risk separate from the perp position" ("dual liquidation risk") — [AnyCollateral explainer](https://paragraph.com/@leverup/anycollateral-the-monad-ecosystem-as-collateral-1); [LeverUp podcast notes](https://rss.com/podcasts/leverup-pod/2846297/)
- Aug 3–9, 2026 recap: "a community trader tested $EMO as collateral alongside long and short BTC positions"; the AnyCollateral section of that recap lists $LV and other tokens without naming $EMO — [LeverUp Weekly Recap Aug 3–9, 2026](https://paragraph.com/@leverup/weekly-recap-aug-3-9)
- Liquidity context: a DexScreener snapshot of the main EMO/MON nad.fun pool showed ~$54K liquidity and ~$443K FDV (date of snapshot unknown; via search) — [DexScreener EMO/MON](https://dexscreener.com/monad/0x714a2694c8d4f0b1bfba0e5b76240e439df2182d)

### Inferences
- LeverUp listing $EMO is a third-party credibility signal and a modest utility. It adds holding demand only to the extent traders choose to post EMO instead of selling it. There is no evidence it has driven meaningful volume.
- Risk on a thin-liquidity token: if EMO drops, collateral value falls at the same time as any losing position. Liquidations would then have to sell EMO (or settle in EMO) into a pool with only tens of thousands of dollars of liquidity. That could cascade, and an oracle sourced from that pool could be moved cheaply. A ratio near 95–100% leaves little haircut buffer for a memecoin. This is a structural inference; LeverUp's exact oracle source and liquidation path for EMO were not available.
- No evidence was found that the emo team integrated or incentivized LeverUp usage beyond the listing. The promised $EMO trading competitions are unconfirmed.

### Gaps
- No $EMO collateral TVL, open interest, volume or liquidation history found; LeverUp pages (paragraph.com, ac.leverup.xyz) were blocked for direct reading.
- Whether $EMO is still on the AnyCollateral list as of 2026-10-13, and its current CR, is unconfirmed.
- Oracle source for EMO pricing on LeverUp is unknown.

## 5. Team and track record

### Takeaway
Effectively a pseudonymous solo builder: "Lord Emo" (X @LordEmo; GitHub LordEmonad, account id 195384316). The builder works in public on GitHub with MIT-licensed code and discloses heavy use of Claude Code. Their record is a fast, continuous shipping cadence since April 2025 plus two hackathon entries (Moltiverse Feb 2026, Metropolis Sep–Oct 2026). No rug, exploit or controversy specific to $EMO was found.

### Cited Findings
- EMOLT credits "Lord Emo ([@LordEmo](https://x.com/LordEmo))" — [emolt-agent README](https://github.com/LordEmonad/emolt-agent)
- Public GitHub repos under LordEmonad include Emonad (2025-04-29), emolt-agent (2026-02-09), TeleSticker (2026-02-07), Bitcoin-Spam (Ordinals "Ordtisms"/"Rare Tisms", escapist.lol, 2026-05-19), emogotchi (2026-09-14) and emogotchi-app (2026-10-06) — [GitHub LordEmonad](https://github.com/LordEmonad)
- The Emogotchi README speaks of "the team" ("under the team's direction… deployed every contract from its own wallet") and says Claude Code was "the main coding tool"; there are 384 Foundry tests in 56 suites and CI on every push — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- The Emogotchi README explains its commit history: 109 commits 2026-09-12 to 09-19, then the work from 09-20 to 10-05 committed in one batch on 2026-10-06; it uses mainnet tx and daily site-deploy commits as the dated record — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- llms.txt: "Emonad is built by and for the community"; official accounts @EmonadCoin and t.me/emonadcoin — [Emonad llms.txt](https://github.com/LordEmonad/Emonad/blob/master/llms.txt)
- A search for rug/scam/dump/controversy turned up nothing specific to emonad. It surfaced only general Monad scam warnings (address-spoofing after mainnet launch; a 2024 fake-MONAD-token rug on another chain) — [Yahoo Finance: spoofed transfers](https://finance.yahoo.com/news/monad-hit-spoofed-token-transfers-025231420.html); [Quadriga: 2024 fake Monad token rug](https://quadrigainitiative.com/casestudy/monadfaketokenrugpull.php)

### Inferences
- The builder is pseudonymous: no real-name doxx was found. Credibility rests on public code, verified contracts and ownerless game design (no admin keys, no withdraw) rather than identity.
- Concentration risk: the ecosystem appears to depend on one person's output. Fee flows to a single TEAM address suggest one operator.
- Emogotchi's game content includes edgy and identity-themed packs ("r3tard", "Jewish pack", "Habibi pack"). That fits memecoin culture but could draw criticism or limit official Monad Foundation amplification. This is speculative; no such criticism was found.

### Gaps
- Could not confirm whether the 2026-02 Moltiverse entry placed.
- Could not confirm whether @EmonadCoin and @LordEmo are run by the same person (likely, but unverified).
- Whether the token deployer on nad.fun is the same wallet as the Emogotchi deployer (`0x40aD…4e74`) is unverified.

## 6. Tokenomics: supply, allocation, team holdings, locks

### Takeaway
$EMO is a nad.fun-launched token with a fixed 1,000,000,000 supply and a vanity `…7777` address, which follows nad.fun convention. It trades on a nad.fun pool, with secondary venues on Kuru, Atlantis, Dirol and OpenSea. There is no published allocation, vesting or team-holding disclosure. Holder count is about 5.8k–6.3k (Sep–Oct 2026). Price data across aggregators is inconsistent.

### Cited Findings
- Max/total supply 1,000,000,000 EMO; holders 5,759 (Monadscan snapshot dated 2026-09-05) and ~6,282 (snapshot 2026-10-02); another snapshot shows 6,263 (via search snippets) — [Monadscan EMO](https://monadscan.com/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777)
- Trading venues linked from the official site: Nad.fun, Kuru, Dirol DEX, OpenSea token page; DexScreener tracks the nad.fun pool `0x714a…182d` and an Atlantis EMO/WMON pool — [emo.html](https://github.com/LordEmonad/Emonad/blob/master/emo.html); [DexScreener Atlantis pool](https://dexscreener.com/monad/0x5674d1729b4f9ead10c59494a1c33dff031a021f)
- Emogotchi's contracts buy through nad.fun's router and lens against pool `0x714A…182D`, and the README says "$EMO is a nad.fun token" — [Deploy.s.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/script/Deploy.s.sol); [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)
- Price snapshots conflict (all via search snippets, different dates): CoinGecko ~$0.001685 with ATH $0.001802 on 2026-09-06 — [CoinGecko emonad](https://www.coingecko.com/en/coins/emonad); Cryptorank ~$0.00085 with ATH $0.001663 on 2026-04-15 — [Cryptorank emonad](https://cryptorank.io/price/emonad); Monadscan ~$0.0012 (2026-10-01) and ~$0.0009 (2026-10-02) — [Monadscan EMO](https://monadscan.com/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777); DexScreener ~$0.000444 / FDV ~$443K — [DexScreener](https://dexscreener.com/monad/0x714a2694c8d4f0b1bfba0e5b76240e439df2182d); Finary market cap ~€321,578 (~2026-07-26) — [Finary emonad](https://finary.com/fr/crypto/coins/emonad); nad.fun homepage listed emonad at "$792K" MCap at crawl time — [nad.fun](https://nad.fun/)
- WEEX wiki says EMO was "first introduced to WEEX on November 28, 2025" (low-quality source; unverified) — [WEEX wiki](https://www.weex.com/wiki/article/what-is-emonad-emo-coin-30755)

### Inferences
- nad.fun tokens launch on a bonding curve with no pre-allocated team or VC tranche. Any team holdings would come from the creator's own buys at launch. Because EMO trades on a nad.fun DEX pool rather than the curve, it has very likely graduated, and graduated nad.fun liquidity is typically protocol-held rather than removable by the creator. Both points follow nad.fun's general design and are unverified for EMO specifically.
- The repo predates Monad mainnet (repo created 2025-04-29; mainnet launched late Nov 2025), and the WEEX date is 2025-11-28. Together these suggest the brand existed in the testnet era and the token launched around mainnet. The exact token creation date is unverified.
- At ~6k holders, EMO has a small holder base relative to the 82k Emogotchi wallets. The airdrop has not (yet) converted into holders at scale.

### Gaps
- Token creation tx/date, creator wallet, creator's current holdings, top-10 holder concentration and LP lock/burn status could not be checked (Monadscan, nad.fun blocked). Priority to verify on-chain.
- No published tokenomics, vesting or team allocation statement was found on the site or in the repos.

## 7. Community and attention

### Takeaway
Attention is small and niche. @EmonadCoin had about 1,150 X followers per a search snapshot that may be stale. Telegram size is unknown. The site's XP system had 213 X-linked profiles (2026-08-14). The project has third-party touchpoints (LeverUp recap, memetok, GeckoTerminal trending lists, Monad hackathons). No mention by the Monad Foundation or Category Labs accounts, no Monad blog coverage and no crypto-media coverage of emo was found.

### Cited Findings
- @EmonadCoin: "1,150 Followers / 157 Following" (search snippet; the page metadata may be about a year old) — [emonad (@EmonadCoin) on X](https://x.com/EmonadCoin)
- @LordEmo posts include "ticker $emo on @monad is more bullish long term than any other meme coin" (ID decodes to 2026-03-18) and the emo pack launch (2026-10-04); follower count not retrieved — [Lord Emo on X](https://x.com/LordEmo/status/2034350087996940434); [Lord Emo on X](https://x.com/LordEmo/status/2106572580043780495)
- Telegram links: t.me/emonadcoin (README/llms.txt) and an invite link t.me/+8RP7jI5wA3o2N2Fh (landing page); member count not retrieved — [Emonad README](https://raw.githubusercontent.com/LordEmonad/Emonad/master/README.md); [emo.html](https://github.com/LordEmonad/Emonad/blob/master/emo.html)
- emonad.lol XP system snapshot: 213 X-linked profiles (generated 2026-08-14, "offline snapshot while Data API is down") — [xp-snapshot.json](https://github.com/LordEmonad/Emonad/blob/master/xp-snapshot.json)
- GitHub traction: emolt-agent 6 stars; Emonad, emogotchi and emogotchi-app 0 stars each (2026-10-13) — [GitHub LordEmonad](https://github.com/LordEmonad)
- GeckoTerminal lists CHOG, emo and MOLANDAK among trending Monad pools (undated snapshot via search) — [GeckoTerminal Monad pools](https://www.geckoterminal.com/monad/pools)
- An informal trader log from late Sep 2026 put emo at ~$934K market cap versus CHOG at ~$2.3M (low-reliability source) — [trackbrock.com](https://trackbrock.com/)
- Monad's September 2026 ecosystem highlights post (TVL $1.01B+ as of 2026-09-30; new projects Drake, o1, 1inch, etc.) contained no visible mention of emo or Emogotchi in retrieved text — [Monad blog: Ecosystem Highlights Sep 2026](https://monad.xyz/blog/monad-ecosystem-highlights-september-2026)
- Emogotchi builds on Category Labs' `mera` passkey library, a technical tie but not an endorsement — [mera on npm](https://www.npmjs.com/package/@category-labs/mera); [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)

### Inferences
- Attention is driven by the builder's own output, not organic media. The likeliest near-term amplifiers are a Metropolis placement (results 2026-11-03) or an Emogotchi re-engagement campaign aimed at the 82k cat holders.
- The ~1.1k-follower project account is small next to the 82k airdrop reach and ~6k holders. Distribution has outpaced social following.

### Gaps
- Current X follower counts (@EmonadCoin, @LordEmo), engagement rates, Telegram/Discord member counts: X and Telegram were inaccessible.
- No Monad Foundation / Category Labs / notable-account mentions found. This could be a search limitation rather than a confirmed absence.
- Whether emo appears in official Monad ecosystem directories (monad.xyz/ecosystem) is unconfirmed.
- No crypto-media articles about emonad found beyond aggregator/exchange wiki pages.

## 8. Positioning: "the Monad meme"? Competing claims

### Takeaway
emo positions itself as "the emo memecoin of the Monad ecosystem", a mood and identity brand (emo nads, eMonad, emotion). It does not claim the canonical-mascot slot. That slot is held by Monad's own MonAnimal cast (Molandak, Chog, Moyaki, from Monadverse), and CHOG is widely billed as "the first meme coin on Monad". emo's distinctive claim is that it is a builder memecoin that ships products and burns.

### Cited Findings
- Self-description: "the emo memecoin of the Monad ecosystem… Emonad is built by and for the community. The brand voice is dark, self-aware, slightly mall-emo"; "one of the community memecoins on Monad", distinguished by "its emo aesthetic, its in-house Emo Tarot web app, and two browser games" — [Emonad llms.txt](https://github.com/LordEmonad/Emonad/blob/master/llms.txt)
- Landing page footer: "the emo memecoin of crypto" — [emo.html](https://github.com/LordEmonad/Emonad/blob/master/emo.html)
- Name read as "emo nads + eMonad + emotion" (aggregator commentary) — [OpenSea EMO token page](https://opensea.io/token/monad/0x81a224f8a62f52bde942dbf23a56df77a10b7777)
- Monad itself promoted the MonAnimal "houses": "Are you a Molandak, Chog, or Moyaki?" (2024) — [Monad on X](https://x.com/monad/status/1815410107649245383)
- CHOG described as "the first meme coin on Monad", fair-launched with an airdrop to NFT holders — [Backpack Learn: What is Chog?](https://learn.backpack.exchange/articles/what-is-chog-the-first-meme-coin-on-monad); MonAnimals (Molandak, Chog, Moyaki, Mouch, Salmonad) originate in Monadverse — [Medium: Monad Weekly Catch Up Vol. 8](https://medium.com/@purpledao/monad-weekly-catch-up-vol-8-monadverse-a-monanimal-cultural-nft-99400388f059); [Beosin: Monad meme culture](https://beosin.com/resources/a-deep-dive-into-monad-and-an-introduction-to-its-meme-culture)
- Emogotchi deliberately hosts other communities' mascots (inversebrah, Tung Tung Tung Sahur, Thiccums, r3tards) while routing their naming fees into $EMO burns; "Those characters remain theirs" — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app)

### Inferences
- emo cannot credibly claim to be "the Monad mascot" against Chog/Molandak, which have foundation-era lineage and larger market caps (CHOG ~2.5x emo in one informal late-Sep 2026 log). Its defensible niche is the meme that builds: games, an agent, a perps-collateral listing, and an on-chain burn economy.
- Hosting rival communities' mascots in Emogotchi turns potential competitors into feeders of the $EMO burn. That is an unusual cooperative positioning for a memecoin.

### Gaps
- No direct public statement found from emo claiming or disputing "the Monad meme" title; no head-to-head community-size data (holders, followers) for Chog/Molandak/Moyaki was gathered here. Other researchers cover the comparables.
