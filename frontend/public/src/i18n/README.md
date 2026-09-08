# Frontend translations

`i18n.js` provides one shared language setting for the vanilla JavaScript frontend.
English is the default. The selected language is stored under `language` in
`localStorage`; the interface also works when storage is unavailable.

For static markup, bind text and accessible labels with translation keys:

```html
<h1 data-i18n="nav.todos"></h1>
<textarea data-i18n-placeholder="ticket.addDescription"></textarea>
<button data-i18n-aria-label="common.closeModal"></button>
```

Call `translate(root)` after inserting a page or a new section. `setLanguage(code)`
updates existing bound nodes in place and dispatches a `languagechange` event on
`document`. It does not recreate views, clear input values, or change user data.
Use that event only for UI state that cannot be expressed through bindings.

For dynamic UI messages, `setText(element, "key", { name: "value" })` retains the
translation key and `{name}` parameters so the message can change language later.
`t("key", params)` returns a string when a DOM binding is not appropriate. Strings
are rendered as text, never as HTML. Missing keys fall back to English, then to
the key itself.

Bind only application-owned text. Do not bind task names, descriptions, notes,
calendar entries, or server/AI responses. If a shared message element switches
from UI text to a backend response, call `setText(element, null)` to remove its
binding before assigning its `textContent`.

To add a language, copy the structure of `en.js` into a new dictionary, import it
in `i18n.js`, and add its code, display labels, and dictionary to `registry`. The
selector uses the exported `languages` metadata automatically. Keep the same keys
in every dictionary. Both nested objects and flat dot-separated keys are supported.

Run the dependency-free manager tests from the repository root with:

```sh
node --experimental-vm-modules --test frontend/tests/i18n.test.mjs
```

These cover persistence, fallback behavior, bindings, and preservation of user
text and focus using an isolated DOM fixture. Browser interaction still needs
separate verification.
