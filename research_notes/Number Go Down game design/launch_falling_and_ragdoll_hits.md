# Launch, Falling and Ragdoll Hits: Launch Feel, Retention Loops and Spread (notes for "Number Go Down")

*Research conditions (14 Oct 2026): full-page fetches failed in this environment (DNS/proxy denials for juicybeast.com, pocketgamer.biz and wikipedia.org), and the shared web-search budget ran out partway through. Every finding below therefore comes from search-engine extracts of the cited pages, not full reads. Download and revenue numbers from Sensor Tower, AppBrain, levvvel and similar sites are third-party estimates. Dates are given where known. Items from model background knowledge that could not be sourced are listed only under "Gaps", marked "unverified".*

---

## Q1. What makes a pull-back launch feel great on a touchscreen (dead zones, max pull, rubber-band visuals, aim preview, haptics, camera)?

### Takeaway
Angry Birds' slingshot works for three reasons. Players understand it instantly as a real-world object. Failure is easy to read: the aim was tuned so players could tell why they missed, and the last shot's path stays on screen as dots. And the distance between sling and target builds anticipation. Rovio has documented little of the tactile layer (max pull, power curve, zoom, sound). But Rovio's own re-release fixes and general touch guidance agree on a few rules: never fire by accident, clamp power at a felt limit, show the player where the shot will go (or where the last one went), and respond on every frame.

### Cited Findings
**Angry Birds: why the slingshot**
- Rovio tried the slingshot first but thought it "too obvious". They tested other ideas such as a swing, then went back to the slingshot because players understood it immediately. The developers concluded that a "recognisable mechanism" was needed. — [Wikipedia: Angry Birds (video game)](https://en.wikipedia.org/wiki/Angry_Birds_(video_game))
- Programmer Tuomo Lehtinen's prototype flung balls at blocks that could be knocked over. Three tuning passes followed. The aiming was tweaked "so that players could decipher why they had failed". Blocks were made "more satisfying to break". Structures were moved "further away from the slingshot to increase anticipation and excitement." — [Wikipedia: Angry Birds (video game)](https://en.wikipedia.org/wiki/Angry_Birds_(video_game))
- Rovio Toronto's Angry Birds Bounce lead, Bryan Cook, described the franchise's essence as "destruction, chaotic fun, and the intuitive understanding of cause and effect". He stressed that aiming and then seeing the result makes outcomes easy to understand. — [Rovio: Angry Birds Bounce](https://www.rovio.com/articles/angry-birds-bounce-is-here-from-toronto-with-love/)
- Original Angry Birds: about 6 months of development, about €100k (~$140k) to build and update, and $70M earned (2011 figure, Wired via MCV). Sources conflict on the budget: other accounts say €25k. It was Rovio's 52nd title (Dec 2009), after 51 games that were not hits. — [MCV/Develop](https://mcvuk.com/development-news/angry-birds-cost-rovio-140k-has-made-70m/); [UCLA case study](http://www.econ.ucla.edu/sboard/teaching/tech/rovio.pdf); [OfficeChai](https://officechai.com/startups/51-failed-games-rovio-created-angry-birds-now-going-public-1-billion-valuation/)

**Angry Birds: aim preview and input details**
- The original's aim preview looks backward, not forward. The game keeps the last bird's path on screen as white, smoke-like dots, and players use that trace to correct the next shot. — [Angry Birds Wiki: Slingshot](https://angrybirds.fandom.com/wiki/Slingshot)
- Players complain that the dots become wrong when a bird hits a trampoline or teleporter, because the trace is "calculated in a static way". — [Angry Birds Nest forum](https://www.angrybirdsnest.com/forums/topic/trajectory-dots-not-always-right/)
- Rovio sold the forward-looking preview as a consumable, the **Sling Scope** power-up, described as a "laser targeting system".
  - In the original it cost 60, 300 or 900 coins by pack size. On Facebook, power-ups cost $0.99 and up. One source says it could also be earned by watching an ad.
  - The **King Sling** power-up grants maximum launch velocity.
  - Sources: [Sling Scope wiki](https://angrybirds.fandom.com/wiki/Sling_Scope); [King Sling wiki](https://angrybirds.fandom.com/wiki/King_Sling); [Angry Birds Nest: Facebook power-ups explained](https://www.angrybirdsnest.com/angry-birds-facebook-power-ups-explained/); [Power-Ups wiki](https://angrybirds.fandom.com/wiki/Power-Ups)
- In Angry Birds 2, a shot can be cancelled after the bird has been pulled back. — [Angry Birds Wiki: Slingshot](https://angrybirds.fandom.com/wiki/Slingshot)
- When Rovio rebuilt the 2012 version in Unity for re-release, it highlighted two input fixes: "an easier way to put birds back in the slingshot" and "making it possible to zoom without accidentally flinging a bird". — [Rovio: Bringing Back 2012](https://www.rovio.com/articles/bringing-back-2012-angry-birds-sets-a-flightpath-for-a-re-release/)
- An Angry Birds-style dotted trajectory is just the projectile equation sampled at fixed time steps, typically drawn as a dotted line. — [Unity Discussions](https://discussions.unity.com/t/angry-birds-dotted-trajectory-for-the-slingshot/103819); [Unity forum thread](https://forum.unity.com/threads/drawing-a-trajectory-behind-a-projectile-angry-birds-style.144075/)
- Angry Birds Space bent trajectories after launch with per-planet gravity fields. This is a precedent for in-flight forces changing the path after release. — [Wikipedia: Angry Birds Space](https://en.wikipedia.org/wiki/Angry_Birds_Space)

**General touch-launch guidance**
- The standard slingshot pattern:
  1. Enter aim mode on touch-down.
  2. While dragging, compute the aim vector and clamp it to a maximum power.
  3. Show an aim guide.
  4. Fire on release.
  - The same course recommends making dead-zone and swipe thresholds adjustable. — [Cursa: Touch controls for mobile games](https://cursa.app/en/page/touch-controls-for-mobile-games-input-patterns-and-feedback)
- Drag distance does not need to map 1:1 to launch speed. Using a coefficient or multiplier is normal. — [LÖVE forums: basic slingshot mechanic](https://love2d.org/forums/viewtopic.php?t=96370)
- A dead zone is a small area around the first touch point where movement is ignored. Without one, controls feel twitchy, and the right size depends on the device. The guide's suggested phone value was cut off in the search extract. — [Scripts for Unity: touch input best practices](https://scriptsforunity.com/blog/touch-input-best-practices-unity/)
- Haptics guidance: use them sparingly, for confirmations, hits and perfect timing. Scale intensity to importance (light ticks for UI, stronger pulses for impacts) and always provide an opt-out. — [Interhaptics: haptic design for video games](https://doc.wyvrn.com/docs/interhaptics-sdk/guides-and-tutorials/haptic-design-for-video-games/)
- Respond to touch at 60 FPS and back it with trails, sound and vibration. — [Mobile Free To Play: Designing a Touch Mechanic](https://mobilefreetoplay.com/design-touch-mechanic/)
  - The search extract also cited Angry Birds' stretching sling strings and tension sound as the reference standard. It is not certain that this point comes from this article.
- Flash launch games used a simpler input. Toss the Turtle: "click and hold to gain power, release to fire", then WASD to steer in flight. — [Armor Games: Toss the Turtle](https://armorgames.com/play/4421/toss-the-turtle); [Newgrounds wiki](https://newgrounds.fandom.com/wiki/Toss_the_Turtle)

### Inferences (design implications for Number Go Down)
**Gesture and power**
- **Keep the gesture identical to Angry Birds:** touch near Emonad or the pouch, drag away from the launch direction, release. Rovio's history shows that the obvious, recognisable mechanism won. The emo theming belongs on the slingshot itself, not in a new gesture.
- **Prevent accidental fires.** This follows Angry Birds 2's cancel and Rovio's 2012 accidental-fling fix.
  - Fire only on release after the drag has left a dead zone.
  - Releasing inside the dead zone, or dragging back into the pouch, cancels the shot.
  - Multi-touch or pinch must never fire.
- **Clamp max pull so it is felt, not read.** At the limit, the strap stops stretching, the pouch trembles, and the stretch sound tops out.
- **Map distance to power through a curve.** Keep the low end fine-grained so short pulls are precise, and make the last ~20% of the pull punchy. A simple multiplier or curve is enough; 1:1 mapping is not needed.

**Aim preview**
- NGD's score is damage, not accuracy, so a full predictive arc would remove the surprise of the fall. A middle ground:
  - Show a short predictive arc covering only the first part of the flight.
  - Leave Angry Birds-style "ghost dots" of the previous launch so players can learn and adjust.
  - Offer a full-length "scope" as an unlock or a daily-challenge modifier. Rovio sold exactly this.

**Camera**
- Ease the camera out as tension builds, so the drop below comes into frame.
- On release, switch to a follow-cam that looks ahead in the fall direction.
- Rovio's "distance builds anticipation" lesson suggests the first obstacle should be visible from the sling, but not reached instantly.

**Feedback**
- Haptics, with a toggle:
  - a light tick when the drag leaves the dead zone
  - rising ticks at power thresholds
  - a strong pulse at max pull and on release
  - impact pulses scaled to damage
- Sound: a rubber stretch whose pitch rises with pull distance, a release "thwack", and an Emonad vocal. These cover the "tension audio" layer Angry Birds is credited with.

### Gaps
- No Rovio source gives Angry Birds' actual tuning: max pull radius, power curve, launch speed, camera zoom rules or sound design. A Sounds Resource page only lists the SFX files ([link](https://sounds.spriters-resource.com/mobile/angrybirds/asset/394266/)).
- No source describes how Angry Birds 2's aiming UI differs from the original, for example whether it shows a predictive line.
- The concrete dead-zone pixel value from the Unity guide was truncated in the extract.
- **Unverified (model background knowledge; check MDN/caniuse):** the web Vibration API (`navigator.vibrate`) works in Android Chrome but is not supported in iOS Safari. If so, iPhone browser players would get no haptics, and audio/visual feedback has to carry the feel on iOS.

---

## Q2. Which meta loops (upgrades, unlocks, cosmetics, daily challenges, leaderboards) kept players returning, and which felt grindy?

### Takeaway
Launch-and-upgrade games share one loop. It runs through the Kitten Cannon lineage: Toss the Turtle, Learn to Fly, Burrito Bison. Launch, earn currency in proportion to distance or destruction, buy upgrades, launch again and go further. It retains players because each run visibly beats the last.

It turns grindy in two ways:
- **Upgrade costs outrun earnings.** The curve forces repeated runs that add no new fun.
- **The fun tools are paywalled.** Kick the Buddy's weapons cost around 5,000 coins, and ads play constantly. Both are the top player complaints.

Telegram games added daily rituals (Hamster Kombat's daily combo and cipher) and referral economics. That retention was propped up by token or airdrop expectations, and it declined after the airdrops.

### Cited Findings
**Launch-and-upgrade lineage**
- **Kitten Cannon!** (2005, BurstStudio) is credited with popularising the "Toss" genre on Newgrounds. Its spiritual successors include Toss the Turtle, Hedgehog Launch and Shopping Cart Hero. — [Newgrounds wiki: Kitten Cannon!](https://newgrounds.fandom.com/wiki/Kitten_Cannon!)
- **Toss the Turtle** (2009, Foreverkul & Gonzossm): fire a turtle from a cannon for distance, use guns, bombs and jetpacks in flight, and collect cash to upgrade equipment. — [Newgrounds wiki](https://newgrounds.fandom.com/wiki/Toss_the_Turtle); [Kongregate wiki](https://kongregate.fandom.com/wiki/Toss_the_Turtle)
- **Learn to Fly** (2009, Light Bringer Games):
  - Learn to Fly: 12M+ plays on Kongregate.
  - Learn to Fly 2: 30M+ plays on Kongregate. The developer claims 80M+ in total, but true totals are unknown because of unofficial hosting sites.
  - Mobile versions were made by another studio. One mobile listing has 1M+ Google Play installs and pitches "upgrade your jetpack and bounce to travel farther".
  - Sources: [Learn to Fly wiki (series)](https://learntofly.fandom.com/wiki/Learn_to_Fly_(Series)); [Google Play: Learn 2 Fly](https://play.google.com/store/apps/details?id=com.energetic.learn2fly&hl=en_US)
- **Burrito Bison** (Juicy Beast):
  - The original (2011) and sequel (2012) were free Flash games. Launcha Libre followed in 2016 after fans asked for it. — [Juicy Beast: In Case of Emergency, Make Burrito Bison 3](https://juicybeast.com/2017/08/03/in-case-of-emergency-make-burrito-bison-3/)
  - About 10 months after Launcha Libre's release (2017): the web version had 1.8M+ gameplays at 3.9/5, and mobile had 6.22M Android + 2.18M iOS downloads = **8.40M**. — same source
  - Video ads were the main revenue, so income depended on players continuing to play. — same source
  - Juicy Beast gave a Casual Connect 2011 talk, "Burrito Bison Postmortem – Designing for Two Markets at Once"; no transcript was found. — [Juicy Beast press page](https://juicybeast.com/press/)

**Angry Birds meta and revenue**
- **Angry Birds 2:** grossed **>$116M worldwide in 2018**, up 47% on 2017, ranking #84 in global mobile game revenue. The US was ~$63.8M (55%) and Germany ~$6M. — [Sensor Tower (2019)](https://sensortower.com/blog/rovio-revenue-2018)
- Deconstructor of Fun analysed how Angry Birds 2 roughly quadrupled its revenue within a year after a slow start. One account in the results puts it at close to 50M downloads by the end of 2015 with much lower revenue at that point (attribution uncertain). — [Deconstructor of Fun (2017)](https://www.deconstructoroffun.com/blog/2017/6/11/how-angry-birds-2-multiplied-quadrupled-revenue-in-a-year)
- Angry Birds 2, Q2 2023, Europe, Android: weekly revenue ~$96K–$127K, weekly downloads 46K–111K. This shows a long tail. — [Sensor Tower (2023)](https://sensortower.com/blog/2023-q2-android-top-5-physics%20puzzle%20games-revenue-europe-64bdb4e6e1714cfff199771b)

**Ragdoll "abuse" loop: Kick the Buddy (Playgendary)**
- **Subscriptions:** weekly, monthly and yearly premium plans. Second Kick's weekly plan costs **$7.99/week after a 3-day free trial** and bundles weapon and outfit unlocks with daily currency. — [Google Play: Kick the Buddy: Second Kick](https://play.google.com/store/apps/details?id=com.playgendary.ktbremaster&hl=en_US)
  - In Kick the Buddy: Forever, premium removes banners and pop-ups, so ad removal is a paid perk. — [Google Play: Kick the Buddy: Forever](https://play.google.com/store/apps/details?id=com.playgendary.ktb2&hl=en_US)
- **Player complaints:** there are "barely any actual weapons that aren't locked behind 5000 coins". Weapon prices are so high "you have to watch the advertisement". "Ads play literally every minute." — store reviews and fan wiki, as quoted in the results: [App Store: Kick the Buddy](https://apps.apple.com/us/app/kick-the-buddy/id1278869953); [NamuWiki: Kick the Buddy](https://en.namu.wiki/w/Kick%20the%20Buddy)
- A fan timeline says subscriptions and "mass-ads" were added later, which caused "a ton of criticism" from returning players. — [Kick the Buddy wiki: timeline](https://kickthebuddy.fandom.com/wiki/Kick_The_Buddy_Timeline)

**Telegram mini-app loops** (2024 data unless noted)
- **Hamster Kombat daily rituals:**
  - Daily combo: pick the correct cards; it refreshes at a fixed time daily.
  - Daily cipher: a Morse-code puzzle, tapped in with a short tap for a dot and a press-and-hold for a dash.
  - Sources: [Decrypt](https://decrypt.co/resources/todays-hamster-kombat-daily-combo-cipher-code); [Bittime](https://www.bittime.com/en/blog/hamster-kombat-gamedev-daily-combo-cipher-10-januari)
- **Hamster Kombat referrals:**
  - Bonus of 5,000 coins per friend, or 25,000 if the friend has Telegram Premium. One source gives 2,000 instead of 5,000. — [CCN](https://www.ccn.com/education/crypto/hamster-kombat-explained-telegram-tap-to-earn-game/); [BDC Consulting](https://bdc.consulting/blog/cases/hamster-kombat-full-review)
  - Referral earnings keep growing as friends level up.
  - Some upgrade cards unlock only by inviting friends. — [KuCoin](https://www.kucoin.com/learn/crypto/what-is-hamster-kombat-telegram-crypto-game); [BDC Consulting](https://bdc.consulting/blog/cases/hamster-kombat-full-review)
- **Scale:**
  - Hamster Kombat: about 300M players before its Sept 2024 TON token launch — [Decrypt](https://decrypt.co/resources/todays-hamster-kombat-daily-combo-cipher-code). Another source says "over 100M within three months" of launch — [KuCoin](https://www.kucoin.com/learn/crypto/what-is-hamster-kombat-telegram-crypto-game).
  - Notcoin: 30M+ participants and ~5M DAU — [Bitget](https://www.bitget.com/news/detail/12560603998163). Another source says ~35M players — [Webopedia](https://www.webopedia.com/crypto/learn/telegram-tap-to-earn-crypto-games/). Its airdrop pushed NOT past a $1B market cap — [TradingView](https://my.tradingview.com/chart/TONUSDT/y6gkvAsn-Hamster-Kombat-Telegram-Game-to-Launch-Token-on-The-Open-Network).
  - Catizen: Telegram's CEO cited 26M+ players and **$16M from in-app purchases** — [The Block](https://www.theblock.co/post/307041/telegram-ceo-touts-catizen-crypto-game-earning-16-million-from-in-app-purchases).
  - Blum: figures conflict, 15M users vs 1.3M players — [AnalyticsInsight](https://www.analyticsinsight.net/cryptocurrency-analytics-insight/blockdag-tg-tap-miner-catizen-and-blum-which-top-play-to-earn-game-is-worth-your-time); [Webopedia](https://www.webopedia.com/crypto/learn/telegram-tap-to-earn-crypto-games/)
- By Oct 2024, Hamster Kombat, Catizen, DOGS and Notcoin faced a "rude awakening" after their airdrops. Only the headline was retrieved. — [Invezz (Oct 2024)](https://invezz.com/news/2024/10/02/hamster-kombat-catizen-dogs-notcoin-face-a-rude-awakening/)

**Hyper-casual retention benchmarks**
- **GameAnalytics industry report:** day-1 retention is about 40% for most hyper-casual categories, with timing games at 44%. Shooting games led playtime at ~45 min/day. It lists Helix Jump among physics-style games but gives only category-level numbers. — [GameAnalytics](https://www.gameanalytics.com/blog/the-metrics-behind-hyper-casual-games-industry-report)
- **What counts as healthy:**
  - 35–40% day-1 retention — [GameAnalytics 101](https://www.gameanalytics.com/blog/monetizing-hyper-casual-games)
  - Voodoo reportedly looks for day-1 retention of 50% or more — [PocketGamer.biz](https://www.pocketgamer.biz/hyper-casual-specialist-voodoo-taps-gameanalytics-to-identify-hit-games/)
  - Hyper-casual day-1 retention averaged ~29% in Q3 2022 — [Mistplay](https://business.mistplay.com/resources/mobile-game-retention-benchmarks)
  - Casual and hyper-casual: 30–40% is healthy — [Tenjin](https://tenjin.com/glossary/retention-rate-rr/)

### Inferences
**Core loop**
- NGD's core return loop should be "beat my last damage", with currency proportional to damage feeding upgrades. This is the proven Toss / Learn to Fly / Burrito Bison loop. Each upgrade should change how a run looks (new boost types, wider sway, new routes through hell), not only add +5% to a stat.

**Upgrades vs. a fair leaderboard**
- Permanent power upgrades make a global leaderboard unfair to new players. Options:
  - **(a) Daily seeded board.** The headline leaderboard is a daily "Hell of the Day" with a fixed loadout.
  - **(b) Two boards.** An all-time board with upgrades on, and a daily board with upgrades normalised.
  - **(c) Option-unlocking upgrades.** Upgrades unlock options (new slingshots, levels, boost types) rather than raw power.

**Unlocks and monetization**
- Cosmetics should be the main unlock track: emo outfits, eyeliner, slingshot skins, impact-effect colours. Kick the Buddy shows that players resent paywalled tools of destruction and ads every minute. The "toys" that create damage should be earnable through play.

**Daily ritual and referrals**
- **Daily ritual:** borrow Hamster Kombat's daily combo/cipher pattern. Run one daily challenge modifier, plus a daily "code" posted on X/Telegram that unlocks a cosmetic. This gives the community a reason to check in without a token.
- **Referrals:** reward both sides with cosmetics or extra daily attempts. Hamster's "earn more as your friend progresses" can become a crew or squad total-damage board.
- **No tokens or airdrop promises:** the post-airdrop declines suggest token-driven retention collapses when the payout ends. Use the crypto theme for humour (charts, liquidation jokes), not as an economy.

**Grind signals to watch in playtests**
- Earnings per run grow more slowly than upgrade costs.
- Players replay the same level with no new visual payoff.
- Any progression step that in practice requires watching ads.

### Gaps
- No primary data was retrieved on the meta loops, upgrade cost curves or retention of Learn to Fly 3, Learn to Fly Idle, Burrito Bison Revenge, Hedgehog Launch or Cannon Basketball.
- No lifetime revenue for Kick the Buddy; only Sensor Tower monthly snapshots (see Q3).
- Notcoin's referral structure and Blum's "Drop Game" mechanics did not appear in the results.
- **Unverified (model background knowledge; check before use):**
  - Burrito Bison: Launcha Libre launches by bouncing off wrestling-ring ropes, with tap-triggered specials and bouncy enemies mid-flight.
  - Learn to Fly 3 lets players build a rocket from parts.
  - Downwell (2015) rewards combos for chaining enemy stomps without landing. If true, it is a strong model for "chain hits without touching walls".

---

## Q3. How did these games spread (YouTube compilations, TikTok clips, streamers, share buttons, replay GIFs)? Which share mechanics existed in-game?

### Takeaway
The biggest viral spikes came from people watching, not from share buttons. Getting Over It and Only Up! exploded because streamers' falls and rage were the show. Only Up! peaked at around 280k concurrent Twitch viewers, and Getting Over It briefly outsold PUBG on Steam. Flappy Bird spread through word of mouth and chart momentum, with almost no marketing.

Other routes:
- **Telegram games:** referral economics and native sharing tools (`startapp` deep links, `shareToStory`, prepared messages, all added or expanded in 2024).
- **Hyper-casual hits like Helix Jump:** paid user acquisition at Voodoo's scale.

NGD lacks both an app store and a streamer pipeline. So the fall and the damage number must be clip-worthy on their own, and the game must create its own shareable artifacts: replay clips, score cards and challenge links.

### Cited Findings
**Streamer and spectator spread**
- **Getting Over It** (Dec 2017):
  - Before release, "high-profile streamers and video-makers had funneled wheelbarrows of apoplectic rage" into it.
  - At launch, "for a period of several hours, it topped even PlayerUnknown's Battlegrounds on the Steam sales charts."
  - Price: $7.99 on Steam, $4.99 on iOS.
  - Source: [Kotaku (2017)](https://kotaku.com/we-made-the-developer-of-getting-over-it-play-his-own-i-1821193180)
  - Foddy says it "really caught fire with streamers" and has been played by nearly all of the biggest ones. — [Foddy.net](https://www.foddy.net/blog/2017/09/getting-over-it/)
  - It is still known as "a rage game", and its Steam reviews are "Very Positive" from ~78k users (less reliable source). — [TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/YMMV/GettingOverItWithBennettFoddy); [Grokipedia](https://grokipedia.com/page/Getting_Over_It_with_Bennett_Foddy)
- **Only Up!** (2023):
  - Viewership: about **280,000 peak concurrent Twitch viewers**, per tracking-site data. Wikipedia records ~85k at an earlier point in late June 2023. — [PCGamesN](https://www.pcgamesn.com/only-up/steam-removed); [Engadget](https://www.engadget.com/viral-indie-game-only-up-delisted-from-steam-171652546.html); [Wikipedia](https://en.wikipedia.org/wiki/Only_Up!)
  - First delisting: pulled June 30, 2023, after an artist said it used a Sketchfab model licensed for non-commercial use only. It returned in early July, discounted to $6.99. — [Kotaku](https://kotaku.com/only-up-twitch-steam-delisted-pulled-copyright-dispute-1850597603); [PC Gamer](https://www.pcgamer.com/twitch-phenomenon-only-up-pulled-from-steam/)
  - Second delisting: Sept 2023, with SCKR Games citing stress. — [Automaton](https://automaton-media.com/en/news/20230908-21469/); [Delisted Games](https://delistedgames.com/small-indie-game-only-up-delisted-on-september-8th/)
  - Sales: 441k+ units and $2.6M lifetime Steam revenue. This comes from an unverified third-party estimate. — [levvvel](https://levvvel.com/only-up-statistics/)
- **Jump King:** went viral through its difficulty and Twitch streams. Jump King Quest released May 25, 2026. — [Wikipedia: Jump King](https://en.wikipedia.org/wiki/Jump_King); [Steam: Nexile](https://store.steampowered.com/search/?developer=Nexile)

**Organic store momentum**
- **Flappy Bird** (2013–14):
  - Launched free, hoping for a few hundred dollars a month from ads. It went unnoticed for months before taking off. — [Time](https://time.com/5657/flappy-bird-deleted/)
  - Nguyen says he did no marketing beyond a couple of tweets. — [Rolling Stone](https://www.rollingstone.com/culture/rs-gaming/the-flight-of-the-birdman-flappy-bird-creator-dong-nguyen-speaks-out-112457/)
  - About 50M downloads. Ad revenue estimated at $50k/day by The Verge; Nguyen declined to confirm the figure. — [Time](https://time.com/5657/flappy-bird-deleted/); [PhoneArena](https://www.phonearena.com/news/Flappy-Bird-already-generating-50k-per-day-in-ad-revenue_id52272)
  - Nguyen called it "an addictive product" and pulled it in Feb 2014. — [Forbes](https://www.forbes.com/sites/lananhnguyen/2014/02/11/exclusive-flappy-bird-creator-dong-nguyen-says-app-gone-forever-because-it-was-an-addictive-product/)
  - A blogger suggested bot-driven downloads but said he couldn't prove it. — [Fox News](https://www.foxnews.com/world/flappy-birds-app-creator-pulls-popular-game-saying-it-ruined-his-simple-life)
- **Turbo Dismount:**
  - Was profitable by the end of early access; the mobile version became its main source of success. The co-founder says the company was close to bankruptcy during development. — [Wikipedia: Turbo Dismount](https://en.wikipedia.org/wiki/Turbo_Dismount)
  - ~71M Android downloads before it was removed from Google Play on Oct 4, 2023. — [AppBrain](https://www.appbrain.com/app/turbo-dismount%E2%84%A2/com.secretexit.turbodismount)

**Scale snapshot (downloads, revenue, viewers)**

| Game | Metric | Date | Source |
|---|---|---|---|
| Angry Birds (all titles) | 1B cumulative downloads, half of them in the prior 6 months; Rovio says it was the first mobile game to reach 1B | May 2012 | [TNW](https://thenextweb.com/news/rovios-angry-birds-titles-hit-1-billion-cumulative-downloads); [Rovio](https://www.rovio.com/articles/rovio-games-have-surpassed-5-billion-total-downloads/) |
| Angry Birds 2 | >$116M gross revenue | 2018 | [Sensor Tower](https://sensortower.com/blog/rovio-revenue-2018) |
| Helix Jump (H8 Games / Voodoo) | Most-downloaded game of 2018 with 334M installs (Wikipedia); #1 new game of 2018 at >300M (Sensor Tower), ahead of PUBG Mobile, Rise Up, Love Balls and Happy Glass | 2018 | [Wikipedia: Voodoo](https://en.wikipedia.org/wiki/Voodoo_(company)); [Sensor Tower](https://sensortower.com/blog/top-new-mobile-games-worldwide-2018) |
| Voodoo (all games) | 8.6B+ downloads | 2024 | [Udonis (third party)](https://www.blog.udonis.co/mobile-marketing/mobile-games/voodoo) |
| Kick the Buddy (main app) | ~520M lifetime Android downloads, 2.6M in the last 30 days (500M+ bracket on Google Play); top-5 in the Action category in MX/CZ/SK | Undated snapshot, retrieved Oct 2026 | [AppBrain](https://www.appbrain.com/app/kick-the-buddy%EF%BC%8Dfun-action-game/com.playgendary.kickthebuddy) |
| Kick the Buddy (main app) | Sensor Tower monthly estimates: Google Play US, March 2021: ~5M downloads / ~$100K; Google Play, undated: ~3M / ~$70K; iOS, undated: ~500K / ~$200K | 2021 and undated | [Sensor Tower Android](https://sensortower.com/android/us/playgendary/app/kick-the-buddy/com.playgendary.kickthebuddy/); [Sensor Tower iOS](https://app.sensortower.com/ios/us/playgendary-limited/app/kick-the-buddy/1278869953) |
| Kick the Buddy sequels | Forever on iOS: ~80K downloads / ~$30K per month; Second Kick on Google Play: ~1M / ~$20K per month | Undated | [Sensor Tower: Forever](https://app.sensortower.com/ios/us/playgendary-limited/app/kick-the-buddy-forever/1435346021); [Sensor Tower: Second Kick](https://app.sensortower.com/overview/com.playgendary.ktbremaster?country=us) |
| Playgendary (publisher) | ~2B lifetime installs across 19 Android apps | Undated | [AppBrain dev page](https://www.appbrain.com/dev/Playgendary+Limited/) |
| Turbo Dismount | ~71M Android downloads (before Oct 2023 removal); ~700K downloads and ~$8K revenue per month (estimate) | March 2021 | [AppBrain](https://www.appbrain.com/app/turbo-dismount%E2%84%A2/com.secretexit.turbodismount); [Sensor Tower](https://sensortower.com/android/us/secret-exit-ltd/app/turbo-dismount/com.secretexit.turbodismount/) |
| Burrito Bison: Launcha Libre | 8.40M mobile downloads + 1.8M web plays | ~2017 | [Juicy Beast](https://juicybeast.com/2017/08/03/in-case-of-emergency-make-burrito-bison-3/) |
| Learn to Fly 2 | 30M+ Kongregate plays; 80M+ claimed by the developer | Flash era (2010s) | [Learn to Fly wiki](https://learntofly.fandom.com/wiki/Learn_to_Fly_(Series)) |
| Only Up! | ~280K peak concurrent Twitch viewers; 441K units (unverified) | 2023 | [PCGamesN](https://www.pcgamesn.com/only-up/steam-removed); [levvvel](https://levvvel.com/only-up-statistics/) |
| Flappy Bird | ~50M downloads; ~$50K/day ad revenue (estimate) | 2014 | [Time](https://time.com/5657/flappy-bird-deleted/) |
| Hamster Kombat / Notcoin / Catizen | ~300M / 30–35M / 26M players; Catizen $16M in-app purchases | 2024 | See Q2 |

- Note on Kick the Buddy's release date: one listing gives May 22, 2018. The iOS app ID suggests an earlier (2017) iOS release, so treat the date as unconfirmed. — [Kick the Buddy blog](https://kickthebuddy.app/blog/kick-the-buddy)
- A Playgendary-focused blog's "100M+ downloads" claim is clearly outdated next to the AppBrain figures. — [Kick the Buddy blog](https://kickthebuddy.app/blog/kick-the-buddy)

**In-game sharing infrastructure (Telegram)**
- **`shareToStory`:** a mini app can open media it creates (Telegram's examples include leaderboards) in the native story editor. Added to the WebApp class on July 31, 2024. — [Telegram Bot Features](https://core.telegram.org/bots/features); [Telegram Mini Apps docs](https://core.telegram.org/bots/webapps)
- **Prepared messages (Nov 2024 update):** mini apps can send prepared media or messages, such as referral codes, memes and artwork, to any chat or post them as a story. — [Telegram Mini Apps docs](https://core.telegram.org/bots/webapps)
- **Referral attribution:** each user gets a unique link. When a referred user opens the app, the `startapp` parameter identifies the referrer. Tracking works only in production on a properly configured HTTPS domain. — [Medium: referral feature in a Telegram Mini App](https://medium.com/@amipk2001/building-a-referral-feature-in-a-telegram-mini-app-0fc565d03f2a)
  - An open-source demo implements an "invite friend" button that opens Telegram's share dialog. — [GitHub demo](https://github.com/nikandr-surkov/Make-TON-Telegram-Mini-App-3)
- **Score cards in stories:** a proposal for a game result card uses `shareToStory(mediaUrl, {text, widget_link})` and notes that it needs a publicly reachable image URL. — [GitHub issue](https://github.com/michelecoppi/guess_the_player_from_the_path/issues/185)
- **Referral leaderboards:** boards that rank users by successful invites, with Top-100 prize pools, are a common pattern (example from a sponsored post). — [HackerNoon](https://hackernoon.com/finsai-bull-launches-telegram-mini-app-referral-challenge-with-huge-prize-pool)

**TikTok / ragdoll discovery**
- TikTok discovery pages for "ragdoll game app store" are dominated by small developers promoting their own titles, such as GORAG / Ragdore by GreenGoGames, rather than chart hits. "Ragdoll Simulator" on iOS has only ~1.2K ratings. — [TikTok discover](https://www.tiktok.com/discover/ragdoll-game-app-store); [App Store: Ragdoll Simulator](https://apps.apple.com/us/app/ragdoll-simulator/id1567709654)

### Inferences
**Design for clips**
- NGD's "show" is the fall. Design for a 5–15 second vertical clip: a big pull, a launch scream, an accelerating descent with a near miss or two, and a final huge damage number.
- Only Up! and Getting Over It spread because the stakes were legible to viewers. NGD's equivalent is spectacular outliers: one-in-fifty "jackpot" runs where Emonad chains through a gauntlet. These should be rare enough to be worth posting.

**Built-in share artifacts** (browser games have no store discovery or streamer pipeline)
1. **Auto-captured replay** of the run's best 6–10 seconds (or a GIF/still fallback), offered on the results screen. Turbo Dismount-style replays are the genre norm, but this is unsourced; see Gaps.
2. **Score card image** with the damage number, Emonad's final pose and the player's rank. Make it meme-native for crypto Twitter, for example damage drawn as red "Number Go Down" candles.
3. **Challenge link** that re-creates the exact run: same level seed, optionally the sender's ghost. The receiver plays one tap later, because there is no install step. Zero install friction is NGD's structural edge over the app-store hits.
4. **Telegram path:** `shareToStory` with the card plus a `startapp` referral link. **X path:** a pre-filled post with an Open Graph card.

**Leaderboard tie-in**
- Weekly and daily leaderboard resets create recurring "who's #1 this week" posts for Telegram and X communities. All-time boards alone stop motivating people quickly.

### Gaps
- No YouTube or TikTok view counts were retrieved for Kick the Buddy, Turbo Dismount, Helix Jump, Getting Over It compilations or Only Up! clips.
- No source was retrieved on in-game replay or share features in Turbo Dismount, Kick the Buddy, Burrito Bison or Angry Birds; the search budget ran out first.
- The claim that Hamster Kombat holds a YouTube subscriber record was not confirmed.
- No spread data was retrieved for Fall Guys falls or Downwell.

---

## Q4. What session length and pacing did the hits use, and how fast did the first fun moment arrive?

### Takeaway
The hits deliver the first payoff within seconds and keep each loop well under a minute. Flash launch games are one launch per loop, with an instant relaunch. Helix Jump is one-tap, with endless short levels and immediate restarts. Flappy Bird runs last seconds.

The main pacing devices:
- **Anticipation distance:** Angry Birds moved targets further from the sling.
- **Risk-reward streaks:** Helix Jump's fireball triggers after falling through three gaps without touching.
- **Visible progress every run:** upgrades in the launch games.

Category benchmarks put healthy hyper-casual day-1 retention at 35–50%.

### Cited Findings
**Helix Jump pacing**
- Helix Jump is described as one-tap, with "infinite levels built for short play sessions" and "immediate feedback loops and restarts." — [mwm.ai app profile](https://mwm.ai/apps/helix-jump/1345968745); [CrazyGames](https://www.crazygames.com/game/helix-jump)
- **The fireball streak**, as described by game guides and a clone spec:
  - Falling through 3+ consecutive platform gaps without bouncing turns the ball into a fireball. One guide says 5 gaps.
  - The fireball can safely touch the forbidden colour and smashes the next platform.
  - Combo points multiply: falling through 3 gaps gives triple points.
  - Later content adds metal platforms that block the fireball, forcing the player to slow down.
  - Sources: [LevelWinner](https://www.levelwinner.com/helix-jump-voodoo-cheats-tips-hints-get-super-high-score/); [CrazyGames](https://www.crazygames.com/game/helix-jump); [Apps4Blast (says 5 gaps)](https://www.apps4blast.com/games/helix_jump); [GitHub: Helix Drop 3D clone spec](https://github.com/RamitVishwakarma/youtube-playable/pull/8)

**Other pacing evidence**
- Angry Birds moved structures further from the slingshot "to increase anticipation and excitement." — [Wikipedia](https://en.wikipedia.org/wiki/Angry_Birds_(video_game))
- Burrito Bison's ad-funded model made revenue depend on players continuing to play, which pushes toward short, repeatable runs. — [Juicy Beast](https://juicybeast.com/2017/08/03/in-case-of-emergency-make-burrito-bison-3/)
- Toss the Turtle's whole interaction is: hold to charge, release, steer in flight, spend cash, repeat. — [Armor Games](https://armorgames.com/play/4421/toss-the-turtle)
- Kick the Buddy players report ads "literally every minute", which suggests ad breaks paced around once a minute. Players see this as excessive. — [App Store](https://apps.apple.com/us/app/kick-the-buddy/id1278869953)

**Benchmarks**
- Hyper-casual day-1 retention: ~40% typical, timing games 44%. Best category playtime: ~45 min/day. — [GameAnalytics](https://www.gameanalytics.com/blog/the-metrics-behind-hyper-casual-games-industry-report)
- Voodoo's day-1 retention bar: ≥50%. — [PocketGamer.biz](https://www.pocketgamer.biz/hyper-casual-specialist-voodoo-taps-gameanalytics-to-identify-hit-games/)
- PocketGamer.biz ran a "Helix Jump case study, key retention data" item in Oct 2018. Its contents could not be retrieved. — [PocketGamer.biz Hot Five, Oct 29 2018](https://www.pocketgamer.biz/hot-five-october-29th-2018/)

### Inferences (pacing targets for NGD)
**Time to first fun**
- Show the loaded slingshot within ~3–5 s of page load. Avoid splash screens, sign-in walls or wallet connects before the first launch; load the sling scene first and stream deeper levels in afterwards.
- First impact within ~1–2 s of release, and a big damage number during the first run.
- Results screen and retry in one tap, in under ~1 s.

**Run length**
- Aim for 20–45 s per run, with each hell level ~8–12 s.
- Show depth explicitly at transitions, e.g. "Floor −3: Liquidation", so progress is readable even when the score drops.

**NGD's version of the fireball** (hits are good in NGD, so the Helix mechanic is translated rather than copied)
- **Hit chains:** hits chained within a short window raise a combo multiplier.
- **Doom mode:** threading a speed-gate sequence cleanly charges "Doom mode" (Emonad ignites). The next impact deals ×N damage and smashes through.
- **Breaking it up:** later levels add "metal" obstacles that break the chain. This mirrors Helix's metal platforms and creates rhythm instead of a constant maximum.

**Session targets**
- Aim for 5–10 minute sessions (roughly 10–20 runs).
- Use the 35–40% day-1 retention band as the go/no-go benchmark in soft launch, and ≥50% as the "hit" bar.

### Gaps
- No game-specific session length, day-1/day-7 retention or time-to-first-fun data was found for Angry Birds, Kick the Buddy, Burrito Bison, Learn to Fly, Turbo Dismount or Helix Jump. Only category benchmarks were found.
- **Unverified (model background knowledge):** Helix Jump was reportedly built quickly by a tiny team and scaled through Voodoo's ad-driven user acquisition. The PocketGamer.biz feature on H8 Games could not be fetched to confirm this. [PocketGamer.biz feature](https://www.pocketgamer.biz/voodoo-development-magic-how-h8-games-launched-helix-jump/)

---

## Q5. What failed in the copycats? Why did most ragdoll mobile games stay low-quality, and what would a premium one need?

### Takeaway
Ragdoll copycats collect lifetime installs through store keyword search ("ragdoll", "dismount") but keep almost no players. One "Ragdoll Dismounting" has 5M+ lifetime installs but only ~1.6k in the last 30 days. Even the category leader, Kick the Buddy, drifted toward ad and subscription density that players openly resent.

The quality exceptions show the upside. Turbo Dismount reached ~71M Android installs, and Angry Birds succeeded only after iterating on failure readability and satisfying destruction.

A premium ragdoll game needs:
- physics that feels weighty and readable
- cinematic camera, replay and sound
- fair, non-intrusive monetization
- enough content variety to keep runs fresh
- clean asset licensing

### Cited Findings
**Copycat install patterns** (Android, aggregator figures)
- Herald Studio's "Ragdoll Dismounting": **5M+ lifetime downloads but ~1.6K in the last 30 days**. — [AppBrain](https://www.appbrain.com/app/ragdoll-dismounting/com.stickman.ragdoll.turbo.dismount.physics)
- Anti-stress Mobile Dev's "Stickman Dismount Ragdoll Game": 100K+ lifetime, ~9.5K in the last 30 days (Oct 2025 listing). — [AppBrain](https://www.appbrain.com/app/stickman-dismount-ragdoll-game/com.ragdoll.distmount.stickman.turbo.dismounting)
- erow.dev's "Stickman Ragdoll: Dismounting": 50K+ downloads, 4.1 rating. — [Google Play](https://play.google.com/store/apps/details?id=com.erow.stickman.dismount)
- Many separate apps share the "Stickman Dismounting" name. — [AppBrain](https://www.appbrain.com/app/stickman-ragdoll-dismount-game/com.erow.stickman.dismount); [Uptodown](https://com-stickman-ragdoll-turbo-dismount-physics.en.uptodown.com/android)

**The category leader's drift**
- Kick the Buddy moved to weekly subscriptions ($7.99/week), coin-gated weapons and frequent ads, which drew "a ton of criticism". — [Google Play: Second Kick](https://play.google.com/store/apps/details?id=com.playgendary.ktbremaster&hl=en_US); [Kick the Buddy wiki: timeline](https://kickthebuddy.fandom.com/wiki/Kick_The_Buddy_Timeline)
- The developer replies to complaints that "sponsored ads help us make the game free to play". — [App Store](https://apps.apple.com/us/app/kick-the-buddy/id1278869953)
- Monthly revenue estimates for the sequels (~$20–30K) are a fraction of the original's. — [Sensor Tower: Forever](https://app.sensortower.com/ios/us/playgendary-limited/app/kick-the-buddy-forever/1435346021); [Sensor Tower: Second Kick](https://app.sensortower.com/overview/com.playgendary.ktbremaster?country=us)

**Quality outliers**
- Turbo Dismount was profitable by the end of early access, and mobile became its main success, with ~71M Android installs. It was removed from Google Play on Oct 4, 2023. — [Wikipedia](https://en.wikipedia.org/wiki/Turbo_Dismount); [AppBrain](https://www.appbrain.com/app/turbo-dismount%E2%84%A2/com.secretexit.turbodismount)
- An unofficial fan site says Turbo Dismount 2 launched on PC on March 13, 2026, with mobile planned but undated. — [turbodismount2.com](https://turbodismount2.com/mobile/)
- Angry Birds came after 51 non-hit games, and its prototype was iterated specifically on failure readability and satisfying block breaks. — [OfficeChai](https://officechai.com/startups/51-failed-games-rovio-created-angry-birds-now-going-public-1-billion-valuation/); [Wikipedia](https://en.wikipedia.org/wiki/Angry_Birds_(video_game))

**Cloning is cheap, and asset risk is real**
- Open-source "Hamster Kombat clone" mini-app repos exist, showing how cheaply hit mechanics get cloned. — [GitHub: telegram-mini-apps](https://github.com/prosperitysoftware/telegram-mini-apps)
- Only Up!'s first delisting came from a single misused, non-commercially-licensed Sketchfab asset. — [Kotaku](https://kotaku.com/only-up-twitch-steam-delisted-pulled-copyright-dispute-1850597603)

### Inferences
**Why ragdoll mobile stayed low-quality**
- Ad-funded hyper-casual economics reward cheap production and dense ads.
- Store keyword traffic ("ragdoll", "dismount", "stickman") delivers installs regardless of quality.
- Most clones have no shareable artifact or social hook, so nothing brings players back or pulls new ones in. Installs come in, retention is near zero, and so is the incentive to invest.

**Premium checklist for NGD**
1. **Physics fidelity.**
   - Stable, weighty ragdoll: sensible joint limits and mass distribution, no jitter at rest, no limbs stretching apart.
   - No tunnelling at high fall speeds: use sub-stepping or continuous collision on Emonad's core bodies. Cap true velocity and fake extra speed with field of view, speed lines and audio.
2. **Readable damage.** Per-impact and per-limb damage popups, with escalating typography for big hits. A satisfying score that ticks up ("Number Go Down" as a falling red ticker).
3. **Cinematic camera.**
   - Follow-cam with look-ahead.
   - Brief slow-motion on top-tier impacts.
   - Screen shake scaled to damage and capped.
   - An end-of-run replay of the best moment.
4. **Audio layering.** Stretch, release, wind rush that rises with speed, impact sounds tiered by damage, and Emonad vocal barks.
5. **Performance.** 60 fps on mid-range phones in mobile browsers, a small first payload, and instant restarts.
6. **Fair monetization, if any.** No forced interstitials mid-session. Cosmetics only. No paywalled destruction tools.
7. **Content variety.** Several hell levels with distinct obstacles and boosts, plus daily seeds, so runs stay fresh. This is the clones' biggest weakness.
8. **Asset hygiene.** Licensed or original assets only, given Only Up!'s delisting.

### Gaps
- No data was retrieved on Ragdoll Achievement 1/2, Stickman Destruction, Falling Art Ragdoll Simulator, "Ragdoll Break" or "Ragdoll Fall". A search for "Ragdoll Achievement" found no mobile listing.
- No ragdoll game that hit the 2023–2026 app-store charts or went viral on TikTok/YouTube Shorts could be confirmed. Only small-developer TikTok self-promotion surfaced.
- No developer postmortems were found that explain the copycats' failure directly. The explanation above is inferred from install and engagement data and from reviews.
- **Unverified (model background knowledge):** Fall Guys' "falls" (elimination slime, falling platforms) and Downwell's falling-combo design were not researched. Both are likely relevant references for making a fall feel good and should be checked in a follow-up search.
