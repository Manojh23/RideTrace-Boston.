import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise the real frontend modules with a minimal DOM and a paginated API.
// This verifies UI state transitions; it does not emulate browser layout or MongoDB.
class Element {
  constructor(tag = 'div') {
    this.tag = tag;
    this.children = [];
    this.listeners = new Map();
    this.value = '';
    this.textContent = '';
    this.firstChild = { textContent: '' };
    this.classList = { toggle() {} };
  }
  addEventListener(name, handler) {
    this.listeners.set(name, handler);
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  append(...children) {
    this.children.push(...children);
  }
  replaceChildren(...children) {
    this.children = children;
  }
  scrollIntoView() {}
  click() {
    return this.listeners.get('click')?.();
  }
  buttons(label) {
    return [
      ...(this.tag === 'button' && this.textContent === label ? [this] : []),
      ...this.children.flatMap((child) => child.buttons?.(label) || []),
    ];
  }
}

async function checkLastPageDeletion(feature) {
  const commute = feature === 'manoj';
  const endpoint = commute ? 'commutes' : 'transfers';
  const pageSize = commute ? 8 : 6;
  const elements = new Map();
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  let records = Array.from({ length: pageSize + 1 }, (_, index) => ({
    _id: index.toString(16).padStart(24, '0'),
    route: 'Red',
    date: '2026-09-01',
    expectedMinutes: 20,
    actualMinutes: 25,
    delayReason: 'Traffic',
    stopName: 'Park Street',
    fromRoute: 'Red',
    toRoute: 'Green',
    observedAt: '2026-09-01',
    daypart: 'Morning',
    transferMinutes: 8,
    missedConnection: false,
    isMine: true,
    notes: '',
  }));
  const requestedPages = [];
  const original = {
    document: globalThis.document,
    window: globalThis.window,
    fetch: globalThis.fetch,
  };
  globalThis.document = { getElementById: get, createElement: (tag) => new Element(tag) };
  globalThis.window = { confirm: () => true };
  globalThis.fetch = async (path, options = {}) => {
    const url = new URL(path, 'http://localhost');
    if (options.method === 'DELETE') {
      const id = url.pathname.split('/').at(-1);
      records = records.filter((record) => record._id !== id);
      return { status: 204, ok: true };
    }
    if (url.pathname.endsWith('/stats')) {
      return {
        status: 200,
        ok: true,
        json: async () => ({ count: records.length, delayByDay: [], medianMinutes: 8 }),
      };
    }
    assert.equal(url.pathname, `/api/${endpoint}`);
    const page = Number(url.searchParams.get('page'));
    const limit = Number(url.searchParams.get('limit'));
    requestedPages.push(page);
    return {
      status: 200,
      ok: true,
      json: async () => ({
        records: records.slice((page - 1) * limit, page * limit),
        total: records.length,
        page,
        pages: Math.max(1, Math.ceil(records.length / limit)),
      }),
    };
  };
  try {
    const file = commute ? '../public/manoj/commutes.js' : '../public/kavya/transfers.js';
    await import(new URL(file, import.meta.url));
    const prefix = commute ? 'commute' : 'transfer';
    get(`${prefix}-next`).click();
    await new Promise((resolve) => setImmediate(resolve));
    assert.match(get(`${prefix}-pagination-label`).textContent, /Page 2 of 2/);
    const holder = get(commute ? 'commute-rows' : 'transfer-feed');
    const deleteButtons = holder.buttons('Delete');
    assert.equal(deleteButtons.length, 1);
    await deleteButtons[0].click();
    assert.equal(records.length, pageSize);
    assert.match(get(`${prefix}-pagination-label`).textContent, /Page 1 of 1/);
    assert.equal(holder.buttons('Delete').length, pageSize);
    assert.equal(get(`${prefix}-next`).disabled, true);
    assert.equal(get(`${prefix}-prev`).disabled, true);
    assert.deepEqual(requestedPages.slice(-2), [2, 1]);
  } finally {
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete globalThis[name];
      else globalThis[name] = value;
    }
  }
}

test('commute history returns to a valid page after its final-page record is deleted', async () => {
  await checkLastPageDeletion('manoj');
});

test('transfer board returns to a valid page after its final-page report is deleted', async () => {
  await checkLastPageDeletion('kavya');
});
