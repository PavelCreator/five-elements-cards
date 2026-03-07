# GitHub Copilot Instructions for Five Elements Cards Game

## Language Requirements

**All game texts, UI labels, comments, and code documentation MUST be in English only.**

### Rules:
1. ✅ **Use English** for all user-facing text in the game
2. ✅ **Use English** for all HTML comments
3. ✅ **Use English** for all code comments (TypeScript, CSS, etc.)
4. ✅ **Use English** for all variable names, function names, and code identifiers
5. ✅ **Use English** for all documentation and README files
6. ❌ **DO NOT use Russian** or any other language for any text in the codebase
7. ❌ **DO NOT add Russian comments** in HTML, TypeScript, or CSS files

### Examples:

**Correct:**
```html
<!-- Joker Exchange Block -->
<div class="dice-cancel-warning">
    🃏 Exchange jokers for tokens ({{ exchangedJokersCount }}/{{ jokerCount }})
</div>
```

**Incorrect:**
```html
<!-- Блок обмена джокеров -->
<div class="dice-cancel-warning">
    🃏 Поменяй джокера на токены ({{ exchangedJokersCount }}/{{ jokerCount }})
</div>
```

## Code Style
- Use clear, descriptive English names for all identifiers
- Write comments in English to explain complex logic
- Keep UI text concise and professional in English
