export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Could not contact the server. Check your connection and try again.');
  }
  if (response.status === 204) return null;
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Request failed (HTTP ${response.status}).`);
  return result;
}

export function qs(id) {
  return document.getElementById(id);
}

export function showNotice(message, error = false) {
  const notice = qs('notice');
  notice.textContent = message;
  notice.classList.toggle('error', error);
  notice.hidden = false;
  notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function clearNotice() {
  qs('notice').hidden = true;
}

export function el(name, options = {}, children = []) {
  const element = document.createElement(name);
  for (const [key, value] of Object.entries(options)) {
    if (key === 'className') element.className = value;
    else if (key === 'text') element.textContent = value;
    else if (key === 'title') element.title = value;
    else element.setAttribute(key, value);
  }
  for (const child of children) element.append(child);
  return element;
}

export function formatDate(value) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function dateToday() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function searchParams(filter) {
  return new URLSearchParams(
    Object.entries(filter).filter(([, val]) => val !== '' && val !== undefined),
  ).toString();
}
