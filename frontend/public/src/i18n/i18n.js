import { en } from "./en.js";
import { de } from "./de.js";

// Add a dictionary import and an entry here to support another language.
const registry = [
  { code: "en", label: "English", short: "EN", dictionary: en },
  { code: "de", label: "Deutsch", short: "DE", dictionary: de },
];

export const languages = registry.map(({ code, label, short }) => ({
  code,
  label,
  short,
}));

const dictionaries = new Map(registry.map(({ code, dictionary }) => [code, dictionary]));
const defaultLanguage = "en";
const storageKey = "language";
const textParams = new WeakMap();
const translatedAttributes = [
  ["data-i18n-placeholder", "placeholder"],
  ["data-i18n-title", "title"],
  ["data-i18n-aria-label", "aria-label"],
];
const selector = ["[data-i18n]", ...translatedAttributes.map(([attribute]) => `[${attribute}]`)].join(",");

function readLanguage() {
  try {
    const saved = globalThis.localStorage?.getItem(storageKey);
    return dictionaries.has(saved) ? saved : defaultLanguage;
  } catch {
    // The interface still works when browser settings disable localStorage.
    return defaultLanguage;
  }
}

let currentLanguage = readLanguage();

function lookup(dictionary, key) {
  if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
    return dictionary[key];
  }

  return key.split(".").reduce((value, segment) => {
    if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, segment)) {
      return value[segment];
    }
    return undefined;
  }, dictionary);
}

export function getLanguage() {
  return currentLanguage;
}

export function t(key, params = {}) {
  const translated = lookup(dictionaries.get(currentLanguage), key);
  const fallback = lookup(dictionaries.get(defaultLanguage), key);
  const template = typeof translated === "string"
    ? translated
    : typeof fallback === "string" ? fallback : key;

  return template.replace(/\{(\w+)\}/g, (token, name) => (
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name] ?? "") : token
  ));
}

function applyTranslation(element) {
  const key = element.getAttribute("data-i18n");
  // Editable content belongs to the user; translate only its placeholder/label.
  const editable = ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.isContentEditable;
  if (key && !editable) {
    element.textContent = t(key, textParams.get(element));
  }

  for (const [binding, attribute] of translatedAttributes) {
    const attributeKey = element.getAttribute(binding);
    if (attributeKey) element.setAttribute(attribute, t(attributeKey));
  }
}

export function translate(root = globalThis.document) {
  if (!root) return;
  if (root.matches?.(selector)) applyTranslation(root);
  root.querySelectorAll(selector).forEach(applyTranslation);
}

export function setText(element, key, params = {}) {
  if (key == null) {
    element.removeAttribute("data-i18n");
    textParams.delete(element);
    element.textContent = "";
    return;
  }

  element.setAttribute("data-i18n", key);
  textParams.set(element, { ...params });
  applyTranslation(element);
}

export function setLanguage(language) {
  if (!dictionaries.has(language)) return false;
  currentLanguage = language;

  try {
    globalThis.localStorage?.setItem(storageKey, language);
  } catch {
    // A blocked preference store must not prevent switching languages.
  }

  const document = globalThis.document;
  if (document) {
    document.documentElement.lang = language;
    translate(document);
    document.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
  }
  return true;
}

if (globalThis.document) {
  globalThis.document.documentElement.lang = currentLanguage;
}
