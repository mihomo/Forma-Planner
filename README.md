# Warframe Forma Planner

[Launch the app: https://forma.him.xx.kg/](https://forma.him.xx.kg/)

[简体中文说明](README.zh-CN.md)

A lightweight static web tool for planning Warframe Forma and polarity layouts across one or more builds.

It helps you answer a practical arsenal question:

> What final slot polarities should I use so these builds can coexist with the least amount of Forma?

The app supports bilingual MOD search, multi-build optimization, element-order constraints, Exilus slots, existing polarity protection, Omni Forma, Umbra Forma, and over-capacity analysis.

## Features

- English and Simplified Chinese UI.
- Browser-language based default language: Chinese browsers open Chinese by default; all other languages open English by default.
- Separate English and Chinese MOD databases.
- MOD name autocomplete with partial input.
- Custom MOD fallback when a MOD is missing from the local database.
- Game-like slot layout: 8 normal slots in two rows of four, plus one Exilus slot on the right.
- Shared optimization for multiple builds.
- Per-build total capacity input.
- Element MOD ordering rules.
- Optional Exilus MOD support.
- Existing polarity protection when overriding is disabled.
- Omni Forma and Umbra Forma strategy toggles.
- Capacity-shortage reporting even when the build cannot fit.
- No backend, no build step, no account required.

## Live Demo

If GitHub Pages is enabled for this repository, the app can be hosted from:

```text
https://mihomo.github.io/Forma-Planner/
```

If that URL does not work yet, enable GitHub Pages in the repository settings:

```text
Settings -> Pages -> Build and deployment -> Deploy from a branch -> main / root
```

## Quick Start

This project is a static website. You can open it directly:

```text
index.html
```

If your browser blocks local scripts, serve the folder with any static server:

```bash
npx serve .
```

Then open the local URL shown in the terminal.

## How To Use

### 1. Set Current Slot Polarities

Open the first step and set the current polarities on your weapon.

The layout follows the in-game mod screen:

```text
1 2 3 4   Exilus
5 6 7 8
```

Important options:

- `Allow overriding existing polarities`: when enabled, the optimizer may replace old polarities to reduce Forma count.
- When disabled, existing non-empty polarities are protected and the optimizer will try to add new Forma without destroying them.
- `Prefer Omni Forma`: disabled by default. When enabled, Omni Forma is used only if it saves more than one regular Forma in multi-build planning.
- `Prefer Umbra Forma`: disabled by default. When enabled, builds with Umbra MODs prefer matching Umbra slots when the Forma count ties; otherwise Umbra Forma is used only if it saves more than one regular Forma.

The app will still use Omni or Umbra Forma when there is no other feasible solution.

### 2. Enter Target Builds

Each build has:

- Total capacity.
- 8 normal-slot MODs.
- 1 optional Exilus MOD.

`Total capacity` means the final usable capacity after weapon capacity plus Aura / Stance MOD bonus.

Examples:

- A weapon with 60 capacity and no bonus should use `60`.
- A melee weapon with extra capacity from a Stance MOD should use the final total shown in-game.

MOD names support autocomplete. Type part of a name and choose a suggestion.

If the MOD is not found, use the custom option or manually enter:

- MOD name.
- Drain.
- Polarity.

Leaving a MOD name blank means the slot is empty.

After typing a MOD name, press `Tab` to quickly move to the next slot.

### 3. Mark Element MODs

If a MOD participates in elemental combination order, check `Element`.

The optimizer will preserve the relative order of all checked Element MODs in the final normal-slot layout.

Normal slots are ordered exactly like the game:

```text
1 2 3 4
5 6 7 8
```

For example, if the original element order is:

```text
Cold -> Toxin -> Heat
```

The final layout will keep `Cold` before `Toxin`, and `Toxin` before `Heat`.

### 4. Add More Builds

Use `Add Build` to calculate a shared polarity plan for multiple configurations.

The optimizer tries to find one final slot layout that works for every build.

If the builds cannot fit even after optimal polarization, the app still shows the best layout and reports how much capacity is missing.

### 5. Review Results

The result step shows:

- Minimum Forma count.
- Forma work order.
- Final polarity layout.
- MOD placement for each build.
- Effective drain after polarity.
- Original drain when polarity changes the cost.
- Capacity shortage when the build still cannot fit.

## Polarity Drain Rules

Matching polarity halves MOD drain and rounds up:

```text
9 / 2 = 4.5 -> 5
```

Mismatched polarity increases drain by 25%, rounded up:

```text
9 + ceil(9 * 0.25) = 12
```

No-polarity slots and no-polarity MODs use the original drain.

Omni polarity matches non-Umbra polarities. Umbra MODs still require Umbra polarity to receive the half-cost bonus.

## MOD Database

The repository includes local MOD data files:

```text
mods.en.js
mods.en.json
mods.zh-hans.js
mods.zh-hans.json
```

The JSON files are readable source data snapshots.

The JS files are browser-ready versions that expose the data as global variables:

```js
window.WF_MOD_DATABASE
window.WF_MOD_DATABASE_EN
```

This keeps the project simple and lets it run as a plain static page without a bundler.

The data is based on WarframeStat / Warframe exported data. Upstream data can include duplicate names and hidden variants, so the app applies additional deduplication rules to prefer normal player-facing variants.

Examples checked during development:

```text
Pressure Point -> regular variant, 9 drain
Primed Pressure Point -> Prime variant, 14 drain
Pathogen Rounds -> regular variant, 11 drain
Trick Mag -> regular variant, 7 drain
```

## Language Behavior

The app chooses the initial language from the browser:

- Browser language starts with `zh`: Simplified Chinese UI and Chinese MOD database.
- Any other browser language: English UI and English MOD database.

Users can switch language manually from the top-right language switch.

The two MOD databases are independent. English mode searches English MOD names, and Chinese mode searches Chinese MOD names.

## Project Structure

```text
index.html             Page markup
style.css              Visual design
app.js                 Vue app, autocomplete, optimizer, i18n
mods.en.js             Browser-ready English MOD database
mods.en.json           English MOD database snapshot
mods.zh-hans.js        Browser-ready Simplified Chinese MOD database
mods.zh-hans.json      Simplified Chinese MOD database snapshot
README.md              English documentation
README.zh-CN.md        Simplified Chinese documentation
```

## Development Notes

There is no build step. Edit the files and refresh the browser.

Useful syntax check:

```bash
node --check app.js
```

Because MOD data comes from external game data exports, some records may be inaccurate or duplicated upstream. If a MOD looks wrong, verify the local JSON snapshot and adjust the deduplication rule or the data source.

## License And Disclaimer

This is an unofficial fan-made tool and is not affiliated with Digital Extremes.

Warframe, MOD names, and related game data belong to Digital Extremes.
