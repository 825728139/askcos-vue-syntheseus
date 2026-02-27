/*
 * ASKCOS utility functions
 */

function copyToClipboard(text, parent) {
  const dummy = document.createElement("textarea");
  parent.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  dummy.remove();
}

function num2str(n, round = true, sigfigs = 2, exp = false, threshold = -4) {
  // Converts a number to a string based on the requested number of significant figures if round is true
  // Automatically uses exponential notation for small numbers, can be forced if exp is true
  if (n == null || Number.isNaN(n)) return "N/A";
  if (!round) return n.toString();
  if (exp) return n.toExponential(sigfigs - 1);

  const magnitude = n ? Math.floor(Math.log10(Math.abs(n))) : 0;
  if (magnitude <= threshold) return n.toExponential(sigfigs - 1);

  const digits = sigfigs - magnitude - 1;
  const power = 10 ** digits;
  return (Math.round(n * power) / power).toFixed(Math.max(digits, 0));
}

function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.code === 22 ||
        e.code === 1014 ||
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      storage &&
      storage.length !== 0
    );
  }
}

function getFromStorage(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(decodeURIComponent(value)) : {};
}

function updateObj(dest, src) {
  // take properties of src and overwrite matching properties of dest
  // ignores properties in src if they do not exist in dest
  // modifies dest object in place
  Object.keys(src).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(dest, key)) {
      if (typeof dest[key] === "object" && !Array.isArray(dest[key])) {
        updateObj(dest[key], src[key]);
      } else {
        dest[key] = src[key];
      }
    }
  });
}

export {
  copyToClipboard,
  num2str,
  storageAvailable,
  getFromStorage,
  updateObj,
};
