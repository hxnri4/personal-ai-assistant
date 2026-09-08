import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../public/src/i18n/i18n.js", import.meta.url), "utf8");

async function readCatalog(language) {
  const catalogSource = await readFile(new URL(`../public/src/i18n/${language}.js`, import.meta.url), "utf8");
  const module = new vm.SourceTextModule(catalogSource);
  await module.link(() => { throw new Error("Catalogs should contain only translations"); });
  await module.evaluate();
  return module.namespace[language];
}

test("production dictionaries have matching, non-empty keys and interpolation parameters", async () => {
  const en = await readCatalog("en");
  const de = await readCatalog("de");
  assert.deepEqual(Object.keys(en).sort(), Object.keys(de).sort());
  for (const key of Object.keys(en)) {
    assert.equal(typeof en[key], "string", key);
    assert.equal(typeof de[key], "string", key);
    assert.ok(en[key].trim() && de[key].trim(), key);
    assert.deepEqual(en[key].match(/\{\w+\}/g), de[key].match(/\{\w+\}/g), key);
  }
});

test("translation keys used by all implemented pages exist in the production catalog", async () => {
  const en = await readCatalog("en");
  const paths = ["index.html", "src/main.js", ...["home", "calendar", "todos", "notes"].map((page) => `src/pages/${page}.js`)];
  const prefixes = [...new Set(Object.keys(en).map((key) => key.split(".")[0]))].join("|");
  const keyPattern = new RegExp(`["']((?:${prefixes})\\.[a-zA-Z]+)["']`, "g");
  for (const path of paths) {
    const pageSource = await readFile(new URL(`../public/${path}`, import.meta.url), "utf8");
    for (const [, key] of pageSource.matchAll(keyPattern)) {
      assert.ok(Object.hasOwn(en, key), `${path}: missing ${key}`);
    }
    for (const [, key] of pageSource.matchAll(/data-i18n(?:-placeholder|-title|-aria-label)?="([^"]+)"/g)) {
      assert.ok(Object.hasOwn(en, key), `${path}: missing ${key}`);
    }
  }
  for (const status of ["open", "in_progress", "done"]) {
    assert.ok(Object.hasOwn(en, `status.${status}`));
  }
});

function element(tagName, attributes = {}, children = []) {
  const attrs = new Map(Object.entries(attributes));
  return {
    tagName,
    textContent: "",
    value: "",
    children,
    getAttribute: (name) => attrs.get(name) ?? null,
    setAttribute: (name, value) => attrs.set(name, value),
    removeAttribute: (name) => attrs.delete(name),
    matches: () => [...attrs.keys()].some((name) => name.startsWith("data-i18n")),
    querySelectorAll() {
      return this.children.flatMap((child) => [
        ...(child.matches() ? [child] : []),
        ...child.querySelectorAll(),
      ]);
    },
  };
}

async function setup({ saved, blocked = false, nodes = [] } = {}) {
  const storage = new Map(saved === undefined ? [] : [["language", saved]]);
  const events = [];
  const document = element("DOCUMENT", {}, nodes);
  document.documentElement = { lang: "" };
  document.dispatchEvent = (event) => events.push(event);
  const context = vm.createContext({
    document,
    localStorage: {
      getItem(key) {
        if (blocked) throw new Error("Storage disabled");
        return storage.get(key);
      },
      setItem(key, value) {
        if (blocked) throw new Error("Storage disabled");
        storage.set(key, value);
      },
    },
    CustomEvent: class CustomEvent {
      constructor(type, options) {
        this.type = type;
        this.detail = options.detail;
      }
    },
  });
  const fixtures = {
    "./en.js": ["en", { nav: { home: "Home" }, placeholder: "Add a description…", greeting: "Hello {name}", fallback: "English only", "flat.key": "Flat" }],
    "./de.js": ["de", { nav: { home: "Start" }, placeholder: "Beschreibung hinzufügen…", greeting: "Hallo {name}" }],
  };
  const module = new vm.SourceTextModule(source, { context });
  await module.link((specifier) => {
    const [name, dictionary] = fixtures[specifier];
    return new vm.SyntheticModule([name], function () {
      this.setExport(name, dictionary);
    }, { context });
  });
  await module.evaluate();
  return { api: module.namespace, document, events, storage };
}

test("English is default; saved supported languages survive module startup", async () => {
  const fresh = await setup();
  assert.equal(fresh.api.getLanguage(), "en");
  assert.equal(fresh.document.documentElement.lang, "en");
  assert.equal((await setup({ saved: "de" })).api.getLanguage(), "de");
  assert.equal((await setup({ saved: "fr" })).api.getLanguage(), "en");
});

test("switching translates text and attributes in place, preserving drafts and focus", async () => {
  const heading = element("H1", { "data-i18n": "nav.home" });
  const input = element("TEXTAREA", {
    "data-i18n-placeholder": "placeholder",
    "data-i18n-aria-label": "placeholder",
    "data-i18n": "nav.home",
  });
  input.value = "My unfinished\ndescription";
  input.textContent = "Original task description";
  const button = element("BUTTON", { "data-i18n-title": "nav.home" });
  const userTitle = element("SPAN");
  userTitle.textContent = "Call Professor Müller";
  const { api, document, events, storage } = await setup({ nodes: [heading, input, button, userTitle] });
  document.activeElement = input;
  api.translate();
  assert.equal(heading.textContent, "Home");
  assert.equal(api.setLanguage("de"), true);
  assert.equal(heading.textContent, "Start");
  assert.equal(button.getAttribute("title"), "Start");
  assert.equal(input.getAttribute("placeholder"), "Beschreibung hinzufügen…");
  assert.equal(input.getAttribute("aria-label"), "Beschreibung hinzufügen…");
  assert.equal(input.value, "My unfinished\ndescription");
  assert.equal(input.textContent, "Original task description");
  assert.equal(userTitle.textContent, "Call Professor Müller");
  assert.equal(document.activeElement, input);
  assert.equal(document.documentElement.lang, "de");
  assert.equal(storage.get("language"), "de");
  assert.equal(events[0].type, "languagechange");
  assert.equal(events[0].detail.language, "de");
});

test("dynamic messages keep safe parameters across language changes; unbinding preserves later user content", async () => {
  const message = element("P");
  const { api } = await setup({ nodes: [message] });
  api.setText(message, "greeting", { name: "<img src=x onerror=alert(1)>" });
  assert.equal(message.textContent, "Hello <img src=x onerror=alert(1)>");
  api.setLanguage("de");
  assert.equal(message.textContent, "Hallo <img src=x onerror=alert(1)>");
  api.setText(message, null);
  assert.equal(message.getAttribute("data-i18n"), null);
  assert.equal(message.textContent, "");
  message.textContent = "Backend response stays unchanged";
  api.setLanguage("en");
  assert.equal(message.textContent, "Backend response stays unchanged");
});

test("missing translations fall back to English then the key, including flat dictionary keys", async () => {
  const { api } = await setup({ saved: "de" });
  assert.equal(api.t("fallback"), "English only");
  assert.equal(api.t("missing.key"), "missing.key");
  assert.equal(api.t("flat.key"), "Flat");
  assert.equal(api.t("greeting"), "Hallo {name}");
  assert.equal(api.t("__proto__.constructor"), "__proto__.constructor");
});

test("blocked storage still allows switching and unsupported choices are ignored", async () => {
  const { api, events } = await setup({ blocked: true });
  assert.equal(api.getLanguage(), "en");
  assert.equal(api.setLanguage("de"), true);
  assert.equal(api.getLanguage(), "de");
  assert.equal(api.setLanguage("fr"), false);
  assert.equal(api.getLanguage(), "de");
  assert.equal(events.length, 1);
});

test("translate also updates a directly supplied root element", async () => {
  const { api } = await setup({ saved: "de" });
  const root = element("H1", { "data-i18n": "nav.home" });
  api.translate(root);
  assert.equal(root.textContent, "Start");
});
