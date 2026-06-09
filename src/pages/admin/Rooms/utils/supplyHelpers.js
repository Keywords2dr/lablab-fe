export const RE_NOTE_ALLOWED = /[^a-zA-Z0-9À-ỹ\s.,\-_]/g;
export const sanitizeNote = (val) => val.replace(RE_NOTE_ALLOWED, "");

export const RE_SEARCH = /^[\p{L}\p{N}\s]*$/u;
export const filterSearchInput = (val) =>
  [...val].filter((ch) => RE_SEARCH.test(ch)).join("");

export function validatePackageCount(val) {
  const n = Number(val);
  if (!val && val !== 0) return "Bắt buộc";
  if (!Number.isInteger(n) || n < 1) return "≥ 1 gói";
  return "";
}

export const getMaxPackages = (maxQuantity, amountPerPackage) => {
  const amt = amountPerPackage ? Number(amountPerPackage) : 1;
  const maxPkgs = Math.ceil(Number(maxQuantity) / amt);
  return maxPkgs > 0 ? maxPkgs : 0;
};
