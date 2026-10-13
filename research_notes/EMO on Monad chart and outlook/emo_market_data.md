# $EMO (emonad) on Monad: market data, chart structure and the "higher highs / higher lows" + "outperformed MON" claims (Nov 2025 to 2026-10-13)

> **How this was gathered, and what that means for confidence (read first).** In this research session, direct API pulls were blocked. The egress proxy returned HTTP 403 (organization policy) for api.dexscreener.com, api.geckoterminal.com, api.coingecko.com, public-api.birdeye.so and rpc.monad.xyz. The page fetcher also failed DNS for dexscreener.com, geckoterminal.com, monadscan.com and cryptorank.io. **No OHLCV series could be downloaded, so the swing points below come from dated aggregator figures (ATH/ATL fields, explorer snapshots, news), not from a computed daily candle series.** Aggregator figures were read through search-engine snippets of those pages. They are labelled "aggregator snapshot" and carry the date the page showed. The creator's public GitHub repos (LordEmonad/Emonad, LordEmonad/emogotchi-app) were cloned and read directly. They are primary sources for addresses and mechanics, but their burn and pet counts are the creator's own figures. Anything from X posts is labelled "claim".

## 1. Identity: contract address, launch date and venue, supply

### Takeaway
The Monad $EMO is **emonad (EMO), contract `0x81A224F8A62f52BdE942dBF23A56df77A10b7777`**, 18 decimals, 1,000,000,000 fixed supply. It is a nad.fun token. The "7777" vanity suffix matches nad.fun-factory tokens such as CHOG `…7777`. It launched in the first days of Monad mainnet, between Nov 24 and about Nov 28, 2025, and has since graduated to DEX pools. The creator's canonical DexScreener pool is `0x714a2694c8d4f0b1bfba0e5b76240e439df2182d` (emo/MON, labelled "Nad.fun").

### Cited Findings
- Creator's repo README: "$EMO on Monad — Contract: `0x81A224F8A62f52BdE942dBF23A56df77A10b7777`". It links DEXScreener pair `0x714a2694c8d4f0b1bfba0e5b76240e439df2182d`, the nad.fun page `nad.fun/tokens/0x81A2…7777` and CoinGecko "emonad". Official accounts are @EmonadCoin (X) and t.me/emonadcoin. The site is emonad.lol. — [LordEmonad/Emonad README](https://github.com/LordEmonad/Emonad/blob/master/README.md)
- The site's live ticker hard-codes the same pool. It fetches `api.dexscreener.com/latest/dex/pairs/monad/0x714a2694c8d4f0b1bfba0e5b76240e439df2182d` and embeds that chart. — [Emonad emo.html](https://github.com/LordEmonad/Emonad/blob/master/emo.html)
- Emogotchi contracts pin `EMO = 0x81A224F8A62f52BdE942dBF23A56df77A10b7777; // $EMO, 18 decimals`. The README says "$EMO is a nad.fun token, and the games buy it through nad.fun and burn it." — [emogotchi-app CreateEmo.s.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/script/CreateEmo.s.sol); [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app/blob/main/README.md)
- Monadscan lists the token as "emonad (emo)" at that address. — [Monadscan token page](https://monadscan.com/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777)
- DexScreener titles pool `0x714a…182d` "emo … emonad / MON on Monad / Nad.fun". An early snapshot showed price $0.0004441, market cap about $443K and liquidity about $54K (page last indexed about 323 days ago, i.e. late Nov 2025). — [DexScreener 0x714a…](https://dexscreener.com/monad/0x714a2694c8d4f0b1bfba0e5b76240e439df2182d)
- A second "emo/MON" Monad pair, `0x97aac6131a2010efafa5a935c55bea1f06d2ee4a`, shows about **$4 of liquidity** (FDV about $438K). It is effectively dead and should be ignored for price discovery. — [DexScreener 0x97aac…](https://dexscreener.com/monad/0x97aac6131a2010efafa5a935c55bea1f06d2ee4a)
- Supply: total supply 1,000,000,000 EMO, with circulating equal to total. — [Finary](https://finary.com/fr/crypto/coins/emonad). Max supply 1B. — [CryptoRank](https://cryptorank.io/price/emonad). Cross-check: CoinGecko market cap $1,685,191 ÷ price $0.001685 ≈ 1.0B.
- Launch timing evidence:
  - @EmonadCoin joined X in **November 2025**. Its bio reads "i lost it all on day 1". — [X @EmonadCoin](https://x.com/EmonadCoin)
  - WEEX first listed EMO for trading on **Nov 28, 2025**. — [WEEX wiki: EMO USDT live](https://www.weex.com/wiki/article/emo-usdt-live-emonad-emo-coin-listings-on-weex-30735)
  - WEEX ran a "price prediction for November 2025: can this new meme coin surge after launch?" article. — [WEEX wiki](https://www.weex.com/wiki/article/emonad-emo-coin-price-prediction-forecasts-for-november-2025-can-this-new-meme-coin-surge-after-launch-30754)
- Monad mainnet and MON went live on **Nov 24, 2025** at the $0.025 Coinbase sale price. Decrypt dates the debut Nov 25. — [Decrypt MON price, Nov 28 2025](https://decrypt.co/price/monad)
- nad.fun mechanics: fair-launch bonding curves that graduate to DEX liquidity (Capricorn CLMM pools), with a 1% trading fee. — [Backpack Learn: What is Nad.fun](https://learn.backpack.exchange/articles/what-is-nad-fun-monad)
- CoinGecko lists EMO on 4 exchanges. The most active venue is **Uniswap V4 (Monad)**, followed by **Capricorn**. — [CoinGecko emonad](https://www.coingecko.com/en/coins/emonad)
- Other tokens named "EMO" are different assets. Emocoin (EMO) on CoinLore/LiveCoinWatch is an inactive legacy coin, and Solflare lists Solana "EMO" mints. Exclude them. — [CoinLore Emocoin](https://www.coinlore.com/coin/emocoin); [Solflare EMO (Solana)](https://www.solflare.com/prices/emo/JBVpd521nt2Uzo5QBqxrHAb2FUMivYAuLpyiXsSxCykF/)

### Inferences
- Launch window is **Nov 24–28, 2025**, i.e. day one to day four of Monad mainnet. The bio "lost it all on day 1" fits a mainnet day-one launch.
- The token has **graduated** off the nad.fun bonding curve. Trading on Uniswap V4 and Capricorn per CoinGecko is only possible after graduation. The Emogotchi burns still route buys through the nad.fun Lens/router (`0x7e78…87ea` Lens in money.mjs). That router picks the best venue.
- The "~$900K market cap around Sep 29, 2026" snapshot is **confirmed**. Monadscan showed about $908K on-chain market cap on Sep 29, 2026 (see section 2).

### Gaps
- The exact creation transaction, block and timestamp were not found because Monadscan and nad.fun could not be fetched. The graduation date and graduation market cap were not found either.
- The creator's own X post stating the contract was not surfaced by search. Contract confirmation rests on the creator's GitHub, the site code and Monadscan/DexScreener, which all agree.

## 2. Current price, market cap/FDV, volume, liquidity and slippage

### Takeaway
As of **Oct 11, 2026** EMO was about **$0.0008**, which is a market cap and FDV of about **$800K** (fully circulating). It peaked near $1.69M market cap on Sep 6, 2026. Liquidity is thin: the last dated pool reading found was about $54K, at launch. A **$10K market buy could move price by tens of percent and a $50K buy by multiples**. Exact current liquidity and volume figures could not be retrieved.

### Cited Findings
- Monadscan snapshots (dated on the page):
  - **Sep 29, 2026 09:12 UTC**: 6,249 holders, on-chain market cap about **$908K**. — [Monadscan](https://monadscan.com/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777?a=0xaD01C20d5886137e056775af56915de824c8fCe5)
  - **Oct 2, 2026**: price **$0.0009**, on-chain market cap about **$904K**. — [Monadscan](https://monadscan.com/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777?a=0xcD6b980029E6E6e0733ac8eC3E02be9410D09799)
  - **Oct 11, 2026**: price **$0.0008**, **6,299 holders**. — [Monadscan](https://monadscan.com/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777?a=0x3ef3d8ba38ebe18db133cec108f4d14ce00dd9ae)
- Other recent aggregator snapshots (exact timestamps unclear):
  - CryptoRank: about **$0.000854**, −7.96% in 24h. — [CryptoRank](https://cryptorank.io/price/emonad)
  - Phemex: **$0.00064989**, market cap **$649,886**. — [Phemex price](https://phemex.com/price/emonad)
  - Coinbase info page: market cap **£275,269** (GBP). — [Coinbase emonad](https://www.coinbase.com/en-gb/price/emonad)
  - The snapshots disagree by up to ±30%. That fits thin, fragmented liquidity and stale caches.
- **Sep 6, 2026 peak-day CoinGecko snapshot** (taken 16 minutes after the ATH print): price **$0.001685**, **+102% 24h**, market cap **$1,685,191** (rank #2,487), **24h volume about $143K**. — [CoinGecko emonad](https://www.coingecko.com/en/coins/emonad)
- Liquidity readings:
  - Main pool `0x714a…`: about **$54K liquidity** at about **$443K market cap**, a 12% liquidity-to-market-cap ratio. Snapshot from about late Nov 2025. The same page showed **$7.3K volume over 86 txns** in one window. — [DexScreener 0x714a…](https://dexscreener.com/monad/0x714a2694c8d4f0b1bfba0e5b76240e439df2182d)
  - DexPaprika showed one EMO listing at **$0.00054 with $27.25 24h volume** (undated, likely a minor pool). — [DexPaprika](https://dexpaprika.com/monad/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777)
- MON reference price: about **$0.026** on Oct 11, 2026. — [MetaMask MON price](https://metamask.io/price/monad). Coinbase shows **$0.02458**. — [Coinbase MON](https://www.coinbase.com/price/monad). At $0.0008, 1 MON buys about 32 EMO.

### Inferences
- **Slippage estimate.** This uses constant-product math, where buying $B into a pool with $L/2 per side moves the end price by ((L/2+B)/(L/2))² − 1. Concentrated-liquidity pools (Capricorn CLMM, Uniswap V4) can be deeper near spot but run out faster once a buy leaves the active range.

  | Assumed total pool liquidity | $10K buy: end-price move | $10K buy: average fill vs spot | $50K buy: end-price move | $50K buy: average fill vs spot |
  |---|---|---|---|---|
  | $30K | +178% | +67% | +1,778% | +333% |
  | **$54K (last dated reading)** | **+88%** | **+37%** | **+713%** | **+185%** |
  | $100K | +44% | +20% | +300% | +100% |

  Even at $100K of depth, a $10K order moves EMO about 40%. A **single five-figure wallet can print a new swing high or low**, so wick-based swing points are fragile.
- The +102% day on Sep 6, on about $143K of volume, against a market cap under $2M shows how little capital moves the chart.

### Gaps
- Current pool-by-pool liquidity in USD, the MON/EMO split, and 24h/7d/30d volume are missing. DexScreener and GeckoTerminal APIs and pages were blocked or unreachable, and no dated October 2026 volume figure was found.
- The current FDV versus market cap split could not be confirmed. Both should equal price × 1B unless burned tokens are excluded, and the dead-address balance is unknown.

## 3. Price history, swing points, and the "higher highs and higher lows for ~10 months" claim

### Takeaway
Measured on **major multi-month swings since the Feb 25, 2026 all-time low (~7.5 months)**, the structure is broadly **higher lows and higher highs**. The higher high is marginal (+8%), and the September higher low is effectively a double bottom. **Over the full ~10 months the claim fails.** The Feb 25, 2026 ATL ($0.0000929) sits about 77–84% below late-Nov and Dec 2025 prices, which is a clear lower low and break of structure. The ride also included an −81% drawdown (April to July) and a −56% drawdown (Sep 6 to Oct 11).

### Cited Findings
- **Late Nov 2025 (about Nov 28):** EMO rose **290% in 24h** to about **$0.00057**, a market cap of about **$570K** and then the #2 meme on Monad. The article speculated the move was tied to a reply from Monad co-founder Keone Hon. — [Phemex News](https://phemex.com/news/article/meme-token-emo-on-monad-chain-soars-290-in-24-hours-40336). Keone was posting heavily that week, e.g. his Nov 29, 2025 reply to Arthur Hayes. — [X @keoneHD](https://x.com/keoneHD/status/1994865326937313744)
- **Dec 2025:** CoinStats snapshot at about **$0.0004081**. Its date is inferred as Dec 2025 from search metadata, so it is weak. — [CoinStats](https://coinstats.app/coins/0x81a224f8a62f52bde942dbf23a56df77a10b7777_monad/)
- **All-time low $0.00009293 on Feb 25, 2026** (a market cap of about $93K) and **all-time high $0.001663 on Apr 15, 2026**. — [CryptoRank](https://cryptorank.io/price/emonad)
- **All-time low $0.0003180 on Jul 25, 2026** and **all-time high $0.001802 on Sep 6, 2026**. — [CoinGecko](https://www.coingecko.com/en/coins/emonad). CoinGecko's history evidently starts after Feb 25, 2026, which explains why its ATL differs from CryptoRank's.
- Week before Sep 6, 2026: high **A$0.00245601** on Sun Sep 6 and low **A$0.00048954** on Wed Sep 2. — [CoinGecko EMO/AUD](https://www.coingecko.com/en/coins/emonad/aud). At AUD/USD 0.64–0.66 that is about **US$0.000313–0.000323**, essentially equal to the Jul 25 low.
- Other ATH prints:
  - MEXC: **$0.00187653**, undated. Its ATL field reads $0, which is unusable. — [MEXC emonad](https://www.mexc.com/price/emonad)
  - Phemex: **$0.00167207**. — [Phemex price](https://phemex.com/price/emonad)
  - Coinbase (Jul 31, 2026 snapshot): ATH **£0.0002936**, which implies Coinbase's history starts late. — [Coinbase emonad](https://www.coinbase.com/en-gb/price/emonad)
- Post-peak points: about **$0.000908** (Sep 29, implied by $908K market cap), **$0.0009** (Oct 2), **$0.0008** (Oct 11). — Monadscan links in section 2.

**Swing table (USD; source-limited, not computed from candles)**

| # | Date | Type | Price | Market cap (1B supply) | Move from prior swing | Source |
|---|---|---|---|---|---|---|
| 0 | ~Nov 28, 2025 | Early spike / reference | ~$0.00057 | ~$570K | n/a | Phemex News |
| 1 | Feb 25, 2026 | **Swing low (ATL)** | $0.00009293 | ~$93K | −83.7% | CryptoRank |
| 2 | Apr 15, 2026 | **Swing high** | $0.001663 | ~$1.66M | +1,689% | CryptoRank |
| 3 | Jul 25, 2026 | **Swing low** | $0.000318 | ~$318K | −80.9% | CoinGecko |
| 3b | Sep 2, 2026 | Retest low | ~$0.00031–0.00032 (FX-converted) | ~$315K | ≈ equal to #3 | CoinGecko AUD |
| 4 | Sep 6, 2026 | **Swing high (ATH)** | $0.001802 | ~$1.80M | +467% (from #3) | CoinGecko |
| 5 | Oct 11, 2026 | Current | $0.0008 | ~$800K | −55.6% | Monadscan |

- Structure checks:
  - Higher low: Jul 25 low is 3.42× the Feb 25 low ✔.
  - Higher high: Sep 6 high is +8.4% above the Apr 15 high ✔ (cross-source).
  - Sep 2 vs Jul 25: equal low (double bottom), not a clear higher low.
  - Feb 25 vs Nov/Dec 2025: lower low ✘ (−77% vs the $0.000408 Dec snapshot, −84% vs the $0.00057 Nov spike).

### Inferences
- **Claim test.**
  - "Higher highs and higher lows for about 10 months" (Dec 2025 to Oct 2026) is **not supported literally**. The ATL was set in month three of that window.
  - A defensible restatement is "higher lows and a marginally higher high since the Feb 25, 2026 bottom (~7.5 months), on a multi-month swing basis." Over that span EMO is still **8.6× off its low**.
- **Fragility of the higher high.** It rests on comparing CryptoRank's April ATH ($0.001663) with CoinGecko's September ATH ($0.001802).
  - If MEXC's undated $0.00187653 ATH was the April print, Sep 6 would be a **lower high (−4%)**.
  - On closing prices rather than wicks the answer could differ either way, and no candle series was available to check.
- **Current state.** Price is 55.6% below the Sep 6 high and 2.5× above the Jul/Sep lows.
  - The uptrend structure stays intact as long as **$0.000318 holds**. A daily close below it would be the first clear break since February.
  - A failure to reclaim about $0.0018 before then would confirm a lower high and a range rather than a trend.
- **Liquidity caveat.** At $50K–$100K of pool depth (section 2), a few wallets can create or erase any of these swing points. The ATH and ATL wicks (+102% day on Sep 6, a $93K market cap low in February) should be treated as approximate.
- The structure looks like **two pump-and-retrace cycles** (Feb→Apr→Jul and Jul→Sep→Oct), each about +470% to +1,700% then −50% to −80%. It does not look like a steady staircase.

### Gaps
- No daily or weekly OHLC series was obtained, because GeckoTerminal and DexScreener OHLCV endpoints were blocked. Monthly open, high, low and close values could not be tabulated. Closing-basis structure, intermediate swings (e.g. May/June) and Dec 2025–Jan 2026 lows are unverified.
- CryptoRank's Feb 25 ATL is single-source and could be a thin-liquidity wick.

## 4. EMO vs MON: relative performance (EMO/MON ratio)

### Takeaway
**Since launch (late Nov 2025) and since the February lows, EMO clearly outperformed MON.** From Nov 28, 2025: EMO +40% vs MON −13%, so EMO/MON is about +62%. From the February lows: EMO +761% vs MON +59%. **Over the last ~1 month and from the April peak, EMO underperformed MON.** The outperformance claim is true on long windows and false on recent ones.

### Cited Findings
- MON price points:
  - Sale and debut at **$0.025** on Nov 24/25, 2025. About **$0.03 on Nov 28, 2025**, −15% in 24h from about $0.04. — [Decrypt](https://decrypt.co/price/monad)
  - ATH **$0.04883 on Nov 26, 2025**. — [Bybit MON](https://www.bybit.com/en/price/monad/); [CoinGecko MON](https://www.coingecko.com/en/coins/monad)
  - ATL **$0.01637 on Feb 6, 2026**. — [MEXC News](https://www.mexc.com/news/709431); [CoinMarketCap MON](https://coinmarketcap.com/currencies/monad/) ($0.01615); [DeFiLlama MON](https://defillama.com/token/MON) (Feb 5)
  - About **$0.0236 on Feb 13** and **$0.021 on Feb 18, 2026**. — [MEXC News](https://www.mexc.com/news/709431); [MEXC News](https://www.mexc.com/tr-CT/news/736350)
  - About **$0.0326 on Apr 8, 2026**, with an April range of **$0.029–0.033**. — [MEXC News](https://www.mexc.com/tr-CT/news/1012837); [CoinStats AI](https://coinstats.app/ai/a/latest-news-for-monad)
  - About **$0.0272** in a CMC analysis whose date is ambiguous (likely late July or Aug 2026). — [CMC AI](https://coinmarketcap.com/cmc-ai/monad/price-analysis/)
  - On the Oct 11, 2026 page: **$0.026**, with **$0.034** "one week earlier" and **$0.0233** "one month earlier". — [MetaMask](https://metamask.io/price/monad)
  - Coinbase: **$0.02458**, 1-year change **−35.46%**. — [Coinbase MON](https://www.coinbase.com/price/monad)
- EMO price points are as cited in section 3.

**Return comparison (end point Oct 11, 2026: EMO $0.0008, MON $0.026)**

| Window | EMO | MON | Verdict |
|---|---|---|---|
| Since about Nov 28, 2025 (EMO $0.00057; MON $0.03) | **+40%** | −13% | EMO outperformed by ~53 pts; EMO/MON +62% |
| Since MON sale price $0.025 / MON ATH $0.0488 | n/a | +4% / −47% | n/a |
| Since Feb lows (EMO Feb 25 $0.0000929; MON Feb 6 $0.01637) | **+761%** | +59% | EMO far outperformed |
| ~3m (from EMO Jul 25 low $0.000318; MON ~$0.0272) | **+152%** | ~−4% | EMO outperformed. EMO is low-anchored, so this flatters EMO. |
| ~6m (from EMO Apr 15 peak $0.001663; MON April $0.029–0.033) | **−52%** | −10% to −21% | **EMO underperformed**. EMO is peak-anchored, so this flatters MON. |
| ~1m (MON ~Sep 11 $0.0233; EMO between $0.0018 Sep 6 and $0.0009 Sep 29) | −12% to −56% | +12% | **EMO underperformed** |

**EMO/MON ratio (MON per EMO).** The MON prices for Feb 25, Jul 25 and Sep 6 are nearest-date proxies.

| Date | Ratio | Change vs Nov 28 |
|---|---|---|
| Nov 28, 2025 | 0.0190 | 0% |
| Feb 25, 2026 | ~0.0044 | −77% |
| Apr 15, 2026 | ~0.054 | +182% |
| Jul 25, 2026 | ~0.0117 | −38% |
| Sep 6, 2026 | ~0.077 | +307% |
| Oct 11, 2026 | 0.0308 | +62% |

### Inferences
- In MON terms EMO also made a **lower low in February**, then a higher low in July and a higher high in September. The ratio's structure mirrors the USD structure. EMO's beta to Monad sentiment is very high, while its idiosyncratic spikes (Apr 15, Sep 6) dominate.
- "Outperformed MON" is **accurate since launch and since the bottom**, a modest edge from the late-Nov spike and a large one from February. It should be qualified: EMO gave back more than MON from April and from September. MON itself is down about 47% from its ATH and about 35% year-on-year, so beating MON is a low bar.
- MetaMask's "$0.034 one week earlier" implies MON fell about 24% in the week to Oct 11. EMO fell about 11% from Oct 2 to Oct 11. That suggests EMO held up better in the most recent week, but the timestamps do not align exactly.

### Gaps
- MON prices on the exact EMO swing dates (Feb 25, Apr 15, Jul 25, Sep 6, 2026) were not found. Nearest-date proxies were used.
- No daily ratio series could be computed because the APIs were blocked.

## 5. Volume pattern and leadership vs Monad meme volume

### Takeaway
Only a few volume data points could be retrieved. The visible pattern is **event-driven bursts**: the late-Nov 2025 +290% day, the Apr 15 high and the Sep 6 +102% day on about $143K of 24h volume. Between bursts, volume is low. **No evidence was found either way** on whether EMO moved before broader Monad meme volume picked up.

### Cited Findings
- Sep 6, 2026: 24h volume about **$143K** on a price up **102%** in 24h, a volume-to-market-cap ratio of about 8.5%. — [CoinGecko](https://www.coingecko.com/en/coins/emonad)
- Late Nov 2025: +290% in 24h to about $0.00057, then the #2 meme by market cap on Monad. — [Phemex News](https://phemex.com/news/article/meme-token-emo-on-monad-chain-soars-290-in-24-hours-40336)
- Early main-pool snapshot: **$7.3K volume over 86 txns** in one window. — [DexScreener 0x714a…](https://dexscreener.com/monad/0x714a2694c8d4f0b1bfba0e5b76240e439df2182d). DexPaprika showed **$27.25 24h volume** on one listing (undated). — [DexPaprika](https://dexpaprika.com/monad/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777)
- Early nad.fun context: an undated early-mainnet report said nad.fun had produced 30 meme tokens, the largest being NADS at a $730K market cap. — [MEXC News](https://www.mexc.com/news/188334)
- Distribution and utility events the creator promoted during the Feb–Mar 2026 bottoming phase (claims, dated from X post IDs):
  - EMO went live on the memetok app on **Mar 5, 2026**. — [X post](https://x.com/EmonadCoin/status/2029695730126856628)
  - Zero-fee swaps to $emo in Backpack on **Mar 13, 2026**. — [X post](https://x.com/EmonadCoin/status/2032467605861138855)
- Emogotchi launched **Sep 15, 2026**, nine days after the Sep 6 ATH, with an 82,423-pet airdrop. Successive pets and item packs shipped through Oct 6. — [emogotchi-app README timeline](https://github.com/LordEmonad/emogotchi-app/blob/main/README.md)

### Inferences
- Sep 6 is very likely the highest-volume day of 2026. Late Nov 2025 and around Apr 15 are likely other top days. This is inferred from the size of the moves, not measured.
- The Sep 6 ATH came **before** Emogotchi's Sep 15 launch, and price fell about 50% by Sep 29 despite the launch and the burns. Product launches did not sustain price over the following three weeks.

### Gaps
- Daily volume series and the top-N volume days are missing (APIs blocked). There is no Monad-wide meme volume series (e.g. nad.fun volume on Dune or DeFiLlama) to test leadership. No September 2026 nad.fun volume data surfaced in search.

## 6. Holders, concentration and burns

### Takeaway
Holder count is about **6,300** and growing slowly: 6,249 on Sep 29 and 6,299 on Oct 11, 2026, about +4/day. Concentration data (top 10 or top 50 share, team or LP wallets) **could not be retrieved**. Emogotchi buy-and-burn has destroyed about **607,000 EMO, or 0.061% of supply**, about $486 at $0.0008. That is economically negligible so far.

### Cited Findings
- Holders over time:
  - About **5,618** on a DexScreener token page (undated, probably earlier in 2026). — [DexScreener token](https://dexscreener.com/monad/0x81A224F8A62f52BdE942dBF23A56df77A10b7777)
  - **6,249** on Sep 29, 2026. — [Monadscan](https://monadscan.com/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777?a=0xaD01C20d5886137e056775af56915de824c8fCe5)
  - **6,299** on Oct 11, 2026. — [Monadscan](https://monadscan.com/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777?a=0x3ef3d8ba38ebe18db133cec108f4d14ce00dd9ae)
- Burns (the creator's figures, which the README says are read from the contracts):
  - "**588,000+ $EMO**" bought and burned as of 2026-10-06, and "**607,000+ $EMO**" as of 2026-10-07. That is about 19,000 EMO/day, roughly $15/day at $0.0008. — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app/blob/main/README.md) and its git history
  - Mechanism: "80% of every care and name payment queues to buy $EMO on nad.fun and burn it." Anyone can trigger `crankBurn`. Care costs 1 MON on the airdropped cat. Each game contract exposes `totalEmoBurned()`. The ops script also reads the `0x…dEaD` balance. — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app/blob/main/README.md); [tools/money.mjs](https://github.com/LordEmonad/emogotchi-app/blob/main/tools/money.mjs)
- Airdrop and holder utility:
  - **82,423 cats** airdropped "to holders" in 330 batches (~8 minutes, 901.8 MON gas) on Sep 15, 2026. — [emogotchi-app README](https://github.com/LordEmonad/emogotchi-app/blob/main/README.md)
  - The repo's snapshot configs include a **Monad Cards NFT-only** snapshot (`cards.json`) and an "emo-only" EMO-holder snapshot at block 105,070,285. A claim allowlist at the same block covers about 9 NFT collections and 17 nad.fun meme tokens (CHOG, MOLANDAK, JAMES, etc.). — [tools/snapshot](https://github.com/LordEmonad/emogotchi-app/tree/main/tools/snapshot)
  - Holder utility added Oct 4, 2026: free soulbound "holders' edition" items for wallets with **≥7,000 EMO** (about $5.60 at $0.0008), via HoldsGate. — [CreateEmo.s.sol](https://github.com/LordEmonad/emogotchi-app/blob/main/contracts/script/CreateEmo.s.sol)
- LeverUp, a perps DEX on Monad (launched Nov 2025, LVUSD settlement), runs an "AnyCollateral" program that lets supported Monad ecosystem tokens serve as margin. **No public source found names EMO as supported collateral.** — [LeverUp pod](https://rss.com/podcasts/leverup-pod/2846297/); [DeFiLlama LeverUp](https://defillama.com/protocol/leverup)

### Inferences
- The **82K Emogotchi wallets are not 82K EMO holders**. The airdrop appears keyed to Monad Cards NFT holders (inferred from the snapshot configs). EMO's on-chain holder base, about 6.3K, is roughly 7.6% of that number. Converting pet owners into EMO holders is the open funnel. Holder growth of about +50 in 12 days after launch suggests slow conversion so far.
- At about 19K EMO/day, burns would remove about 0.7% of supply per year. That is not price-relevant unless care volume or the MON price rises many times over.

### Gaps
- No data on top-10 or top-50 share, creator or dev wallets, LP share or dead-address balance. Monadscan, GMGN, Birdeye and Bubblemaps were not reachable or not indexed in search.
- No holder-count time series before Sep 29, 2026, apart from the undated DexScreener figure.
- EMO as LeverUp collateral is unverified; it is a claim from the brief only.

## 7. Listings and aggregator coverage

### Takeaway
EMO has broad **data-aggregator coverage** and one claimed small-CEX listing, WEEX EMO/USDT from Nov 28, 2025. No top-tier CEX listing and no CoinMarketCap page were found.

### Cited Findings
- **CoinGecko**: listed as "emonad". On Sep 6, 2026 it was rank #2,487 with 4 exchanges, top venues Uniswap V4 (Monad) and Capricorn. EMO/USD history starts after Feb 25, 2026; EMO/PHP and EMO/INR pages existed by May and June 2026. — [CoinGecko](https://www.coingecko.com/en/coins/emonad)
- Other aggregators:
  - **CryptoRank**. — [CryptoRank](https://cryptorank.io/price/emonad)
  - **CoinStats**. — [CoinStats](https://coinstats.app/coins/0x81a224f8a62f52bde942dbf23a56df77a10b7777_monad/)
  - **DexPaprika**. — [DexPaprika](https://dexpaprika.com/monad/token/0x81a224f8a62f52bde942dbf23a56df77a10b7777)
  - **OpenSea token page**. — [OpenSea](https://opensea.io/token/monad/0x81a224f8a62f52bde942dbf23a56df77a10b7777)
  - **Finary**. — [Finary](https://finary.com/fr/crypto/coins/emonad)
  - Coinbase, MEXC and Phemex price-info pages. These are informational and do not by themselves mean trading support. — [Coinbase](https://www.coinbase.com/en-gb/price/emonad); [MEXC](https://www.mexc.com/price/emonad); [Phemex](https://phemex.com/price/emonad)
- **WEEX**: "EMO USDT live", first listed for trading Nov 28, 2025. — [WEEX wiki](https://www.weex.com/wiki/article/emo-usdt-live-emonad-emo-coin-listings-on-weex-30735)
- Distribution integrations (creator claims): memetok app (Mar 5, 2026) and Backpack zero-fee swaps (Mar 13, 2026). — [X](https://x.com/EmonadCoin/status/2029695730126856628); [X](https://x.com/EmonadCoin/status/2032467605861138855)

### Inferences
- Coverage is typical of a sub-$2M Monad meme. Aggregator presence helps discovery, but trading still runs through thin on-chain pools. The WEEX pair's current status and volume are unknown and probably small.

### Gaps
- No CoinMarketCap page was found. Whether the WEEX listing is still active is unconfirmed. No evidence of Binance, Bybit, OKX, Coinbase or Upbit trading support for EMO.
- The creator's X post making the "higher highs and higher lows for ~10 months" claim was not surfaced by search, so its exact wording and date are unverified.
