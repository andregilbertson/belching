# belching

## Spellcheck + Token Minimizer Integration
This project includes a pluggable spellchecker designed for a hackathon-friendly pipeline:

input -> process (token minimize) -> spell check (replacement/deletion) -> new prompt

The default is lightweight and works out-of-the-box with simple heuristics. You can upgrade accuracy by installing `nspell` and an English dictionary.

### Quick Start
1) Keep the defaults (no extra install): you’ll get basic normalization of repeated letters and safe replacements when a simple dictionary is provided.

2) Upgrade for accuracy (recommended):

```bash
npm install nspell dictionary-en
```

Then, in your code:

```js
import {
  optimizeTextWithSpellcheck,
  createSpellChecker,
  buildDictionaryFromText,
} from './text_optimizer_functions.js';

// Option A: Auto-detect backend (prefers nspell if installed, else fallback)
const result = await optimizeTextWithSpellcheck('Thiss is sooo cooool!!!', {
  backend: 'auto',           // 'auto' | 'nspell' | 'simple'
  normalizeRepeats: true,    // collapse very long letter repeats
  returnMetadata: true,      // get per-token actions
});
console.log(result.text);
console.log(result.tokens);

// Option B: Provide a small custom dictionary built from domain text
const domainText = 'API LLM prompt token minimizer minimization normalization JavaScript TypeScript';
const customDict = buildDictionaryFromText(domainText);
const resultWithDict = await optimizeTextWithSpellcheck('Minimzation of tokans', {
  backend: 'simple',
  customDictionary: customDict,
});
console.log(resultWithDict.text);

// Option C: Force nspell (requires install)
const checker = await createSpellChecker({ backend: 'nspell' });
console.log(checker.correct('recieve')); // => 'receive'
```

### How It Works
- Tokenization: preserves whitespace and punctuation, only correcting A–Z words.
- Spellcheck backends:
  - nspell (Hunspell): accurate, offline, large dictionary. Optional but recommended.
  - simple: a minimal fallback that supports:
    - repeated letter normalization (e.g., `cooool` → `cool`)
    - one-character delete heuristic (extra letter removal)
    - edit-distance-1 candidate search if a custom dictionary is provided
- Case preservation: maintains original casing (UPPER, Capitalized, lower).

### Recommended Technologies
- nspell (+ dictionary-en): best trade-off for hackathons—good accuracy, offline, easy API.
  - Pros: robust, fast, no network, maintained ecosystem
  - Cons: adds a dependency and dictionary files
- Fallback simple backend (included): zero install, deterministic, safe minimal fixes
  - Pros: no extra packages, works immediately
  - Cons: limited coverage without a dictionary

Optional alternatives if you need them later:
- wink spell (via wink NLP ecosystem): good JS NLP tools, but requires integration work
- LLM-based correction: highest accuracy but needs API calls and adds latency/cost

### Integration Pattern
Your project pipeline likely looks like this:

1. Pre-process + token minimizer (your current logic)
2. Spellcheck + edit:
   - replacement: correct misspellings via dictionary suggestions
   - deletion: remove extra characters (e.g., accidental double keypress)
   - normalization: collapse repeated letters for cleaner prompts
3. Post-process + prompt assembly

Use `optimizeTextWithSpellcheck` as the spellcheck step. If you already do token minimization, run it first, then pass the output into the spellchecker and feed the result into your new prompt.

### Notes
- If you force `backend: 'nspell'` without installing deps, you’ll get an error telling you to install them.
- If you rely on the `simple` backend without a dictionary, only heuristic changes are applied (no full suggestions). For domain-specific prompts, consider building a quick dictionary with `buildDictionaryFromText()` from your team’s docs/examples.