// Basic cookie functions
function setCookie(name, value, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

function getCookie(name) {
  const cookies = document.cookie.split(";");
  const target = `${name}=`;
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(target)) {
      return decodeURIComponent(cookie.substring(target.length));
    }
  }
  return null;
}

function deleteCookie(name) {
  setCookie(name, "", -1);
}

// Array-specific functions
function setCookieArray(name, array, days = 7) {
  setCookie(name, JSON.stringify(array), days);
}

function getCookieArray(name) {
  const value = getCookie(name);
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error("Error parsing cookie value:", e);
    }
  }
  return [];
}

function addToCookieArray(name, element, days = 7) {
  const array = getCookieArray(name);
  array.push(element);
  setCookieArray(name, array, days);
}

function removeFromCookieArray(name, element, days = 7) {
  let array = getCookieArray(name);
  array = array.filter((item) => item !== element);
  setCookieArray(name, array, days);
}
