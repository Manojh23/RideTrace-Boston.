import {
  api,
  clearNotice,
  dateToday,
  el,
  formatDate,
  qs,
  searchParams,
  showNotice,
} from '../js/api.js';

const form = qs('transfer-form');
const saveButton = qs('save-transfer');
const cancelButton = qs('cancel-transfer');
const state = { editing: null, page: 1, pages: 1 };
qs('observedAt').max = dateToday();
qs('observedAt').value = dateToday();

function resetForm() {
  state.editing = null;
  form.reset();
  qs('observedAt').value = dateToday();
  qs('transfer-form-heading').textContent = 'Share an experience';
  saveButton.firstChild.textContent = 'Publish report ';
  cancelButton.hidden = true;
}
function formValues() {
  const formData = new FormData(form);
  return {
    stopName: formData.get('stopName').trim(),
    fromRoute: formData.get('fromRoute').trim(),
    toRoute: formData.get('toRoute').trim(),
    observedAt: formData.get('observedAt'),
    daypart: formData.get('daypart'),
    transferMinutes: Number(formData.get('transferMinutes')),
    missedConnection: qs('missedConnection').checked,
    notes: formData.get('notes').trim(),
  };
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  saveButton.disabled = true;
  clearNotice();
  try {
    const path = state.editing ? `/transfers/${state.editing}` : '/transfers';
    const method = state.editing ? 'PUT' : 'POST';
    await api(path, { method, body: JSON.stringify(formValues()) });
    const message = state.editing
      ? 'Transfer report updated.'
      : 'Your transfer experience is now visible to other riders.';
    resetForm();
    state.page = 1;
    await reloadBoard();
    showNotice(message);
  } catch (error) {
    showNotice(error.message, true);
  } finally {
    saveButton.disabled = false;
  }
});
cancelButton.addEventListener('click', resetForm);

const filterFields = ['filter-stop', 'filter-from', 'filter-to', 'filter-daypart'];
function currentFilters() {
  return {
    stop: qs('filter-stop').value.trim(),
    from: qs('filter-from').value.trim(),
    to: qs('filter-to').value.trim(),
    daypart: qs('filter-daypart').value,
  };
}
qs('transfer-filters').addEventListener('submit', (event) => {
  event.preventDefault();
  state.page = 1;
  reloadBoard();
});
qs('clear-transfer-filters').addEventListener('click', () => {
  for (const id of filterFields) qs(id).value = '';
  state.page = 1;
  reloadBoard();
});
qs('transfer-prev').addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    loadReports();
  }
});
qs('transfer-next').addEventListener('click', () => {
  if (state.page < state.pages) {
    state.page += 1;
    loadReports();
  }
});

function editReport(record) {
  state.editing = record._id;
  for (const field of [
    'stopName',
    'fromRoute',
    'toRoute',
    'observedAt',
    'daypart',
    'transferMinutes',
    'notes',
  ]) {
    qs(field).value = record[field];
  }
  qs('missedConnection').checked = record.missedConnection;
  qs('transfer-form-heading').textContent = 'Edit transfer report';
  saveButton.firstChild.textContent = 'Update report ';
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  qs('stopName').focus({ preventScroll: true });
}

async function deleteReport(record) {
  if (!window.confirm(`Delete your transfer report at ${record.stopName}? This cannot be undone.`))
    return;
  try {
    await api(`/transfers/${record._id}`, { method: 'DELETE' });
    if (state.editing === record._id) resetForm();
    await reloadBoard();
    showNotice('Transfer report deleted.');
  } catch (error) {
    showNotice(error.message, true);
  }
}

function renderReport(record) {
  const ageDays = Math.floor((new Date(dateToday()) - new Date(record.observedAt)) / 86400000);
  const old = ageDays > 30;
  const card = el('article', { className: 'transfer-card' });
  const top = el('div', { className: 'transfer-card-top' }, [
    el('div', {}, [
      el('div', { className: 'transfer-station', text: record.stopName }),
      el('div', {
        className: 'transfer-when',
        text: `${formatDate(record.observedAt)} · ${record.daypart}`,
      }),
    ]),
    el('span', { className: 'unverified-tag', text: 'Unverified' }),
  ]);
  const routes = el('div', { className: 'transfer-route' }, [
    el('span', { className: 'route-pill', text: record.fromRoute }),
    el('span', { className: 'route-connector', text: '→' }),
    el('span', { className: 'route-pill', text: record.toRoute }),
  ]);
  const metrics = el('div', { className: 'transfer-metrics' }, [
    el('span', {
      className: 'metric-pill',
      text: `◷ ${record.transferMinutes} min actual transfer`,
    }),
  ]);
  if (record.missedConnection)
    metrics.append(el('span', { className: 'metric-pill missed', text: 'Missed connection' }));
  if (old) metrics.append(el('span', { className: 'metric-pill old', text: 'Older than 30 days' }));
  card.append(top, routes, metrics);
  if (record.notes) card.append(el('p', { className: 'report-note', text: record.notes }));
  const footer = el('div', { className: 'report-footer' }, [
    el('span', {
      text: record.isMine
        ? 'Your report · You can edit or remove it'
        : 'Shared by an anonymous rider',
    }),
  ]);
  if (record.isMine) {
    const buttons = el('div', { className: 'report-buttons' });
    const edit = el('button', { type: 'button', text: 'Edit' });
    edit.addEventListener('click', () => editReport(record));
    const remove = el('button', { type: 'button', className: 'danger', text: 'Delete' });
    remove.addEventListener('click', () => deleteReport(record));
    buttons.append(edit, remove);
    footer.append(buttons);
  }
  card.append(footer);
  return card;
}

async function loadReports() {
  const board = qs('transfer-feed');
  try {
    const query = searchParams({ ...currentFilters(), page: state.page, limit: 6 });
    const response = await api(`/transfers?${query}`);
    if (state.page > response.pages) {
      state.page = response.pages;
      return loadReports();
    }
    state.page = response.page;
    state.pages = response.pages;
    board.replaceChildren();
    if (!response.records.length)
      board.append(
        el('p', {
          className: 'feed-empty',
          text: 'No matching transfer reports yet. Be the first to share your experience!',
        }),
      );
    for (const record of response.records) board.append(renderReport(record));
    qs('transfer-pagination-label').textContent =
      `${response.total} report${response.total === 1 ? '' : 's'} · Page ${response.page} of ${response.pages}`;
    qs('transfer-prev').disabled = state.page <= 1;
    qs('transfer-next').disabled = state.page >= state.pages;
  } catch (error) {
    board.replaceChildren(
      el('p', { className: 'feed-empty', text: 'Could not load transfer reports.' }),
    );
    showNotice(error.message, true);
  }
}

async function loadStats() {
  try {
    const result = await api(`/transfers/stats?${searchParams(currentFilters())}`);
    qs('stat-count').textContent = result.count;
    qs('stat-median').textContent = result.medianMinutes ?? '—';
    qs('stat-missed').textContent = result.missedPercent;
    qs('stat-recent').textContent = result.recentCount;
  } catch (error) {
    showNotice(error.message, true);
  }
}
async function reloadBoard() {
  await Promise.all([loadReports(), loadStats()]);
}

let stopTimer;
qs('stopName').addEventListener('input', () => {
  clearTimeout(stopTimer);
  const search = qs('stopName').value.trim();
  if (search.length < 2) return;
  stopTimer = setTimeout(async () => {
    try {
      const response = await api(`/stops?search=${encodeURIComponent(search)}&limit=40`);
      const list = qs('stop-suggestions');
      list.replaceChildren();
      const names = new Set(response.records.map((r) => r.stopName));
      for (const name of names) list.append(el('option', { value: name }));
    } catch {
      /* Free text works even when the MBTA catalog has not yet been imported. */
    }
  }, 250);
});

await reloadBoard();
