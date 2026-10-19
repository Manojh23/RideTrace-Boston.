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

const form = qs('commute-form');
const rowHolder = qs('commute-rows');
const saveButton = qs('save-commute');
const cancelButton = qs('cancel-commute');
const state = { editing: null, page: 1, pages: 1, records: [] };

qs('date').max = dateToday();
qs('date').value = dateToday();

function resetForm() {
  state.editing = null;
  form.reset();
  qs('date').value = dateToday();
  qs('form-title').textContent = 'Add a commute';
  saveButton.firstChild.textContent = 'Save commute ';
  cancelButton.hidden = true;
}

function getFormValues() {
  const formData = new FormData(form);
  return {
    route: formData.get('route').trim(),
    date: formData.get('date'),
    expectedMinutes: Number(formData.get('expectedMinutes')),
    actualMinutes: Number(formData.get('actualMinutes')),
    delayReason: formData.get('delayReason'),
    notes: formData.get('notes').trim(),
  };
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  saveButton.disabled = true;
  clearNotice();
  try {
    const path = state.editing ? `/commutes/${state.editing}` : '/commutes';
    const method = state.editing ? 'PUT' : 'POST';
    await api(path, { method, body: JSON.stringify(getFormValues()) });
    const message = state.editing
      ? 'Commute updated successfully.'
      : 'Commute saved to your private history.';
    resetForm();
    state.page = 1;
    await Promise.all([loadLogs(), loadStats()]);
    showNotice(message);
  } catch (error) {
    showNotice(error.message, true);
  } finally {
    saveButton.disabled = false;
  }
});

cancelButton.addEventListener('click', () => resetForm());
qs('clear-filters').addEventListener('click', () => {
  qs('filter-route').value = '';
  qs('filter-day').value = '';
  state.page = 1;
  loadLogs();
});
let debounce;
qs('filter-route').addEventListener('input', () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    state.page = 1;
    loadLogs();
  }, 300);
});
qs('filter-day').addEventListener('change', () => {
  state.page = 1;
  loadLogs();
});
qs('commute-prev').addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    loadLogs();
  }
});
qs('commute-next').addEventListener('click', () => {
  if (state.page < state.pages) {
    state.page += 1;
    loadLogs();
  }
});

function actionButton(label, handler, dangerous = false) {
  const btn = el('button', {
    type: 'button',
    className: `action-link${dangerous ? ' danger' : ''}`,
    text: label,
  });
  btn.addEventListener('click', handler);
  return btn;
}

function editRecord(record) {
  state.editing = record._id;
  for (const field of [
    'route',
    'date',
    'expectedMinutes',
    'actualMinutes',
    'delayReason',
    'notes',
  ]) {
    qs(field).value = record[field];
  }
  qs('form-title').textContent = 'Edit your commute';
  saveButton.firstChild.textContent = 'Update commute ';
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  qs('route').focus({ preventScroll: true });
}

async function deleteRecord(record) {
  if (
    !window.confirm(
      `Delete your ${record.route} commute from ${formatDate(record.date)}? This cannot be undone.`,
    )
  )
    return;
  try {
    await api(`/commutes/${record._id}`, { method: 'DELETE' });
    if (state.editing === record._id) resetForm();
    await Promise.all([loadLogs(), loadStats()]);
    showNotice('Commute deleted.');
  } catch (error) {
    showNotice(error.message, true);
  }
}

function renderLogs(records) {
  rowHolder.replaceChildren();
  if (!records.length) {
    rowHolder.append(
      el('tr', {}, [
        el('td', {
          colspan: '5',
          className: 'empty-state',
          text: 'No matching trips yet. Log a journey or change your filters.',
        }),
      ]),
    );
    return;
  }
  for (const record of records) {
    const delay = record.actualMinutes - record.expectedMinutes;
    const date = formatDate(record.date);
    const routeCell = el('td', {}, [
      el('span', { className: 'primary-value', text: record.route }),
      el('span', { className: 'secondary-value', text: record.delayReason }),
    ]);
    const timesCell = el('td', {
      text: `${record.expectedMinutes} min / ${record.actualMinutes} min`,
    });
    const delayCell = el('td', {}, [
      el('span', {
        className: `delay-chip ${delay <= 2 ? 'good' : 'late'}`,
        text: delay > 0 ? `+${delay} min` : `${delay} min`,
      }),
    ]);
    const buttons = el('div', { className: 'action-row' }, [
      actionButton('Edit', () => editRecord(record)),
      actionButton('Delete', () => deleteRecord(record), true),
    ]);
    const tr = el('tr', {}, [
      routeCell,
      el('td', { text: date, title: record.notes || date }),
      timesCell,
      delayCell,
      el('td', {}, [buttons]),
    ]);
    rowHolder.append(tr);
  }
}

async function loadLogs() {
  try {
    const params = searchParams({
      route: qs('filter-route').value.trim(),
      day: qs('filter-day').value,
      page: state.page,
      limit: 8,
    });
    const data = await api(`/commutes?${params}`);
    state.records = data.records;
    state.pages = data.pages;
    renderLogs(data.records);
    qs('commute-pagination-label').textContent =
      `${data.total} result${data.total === 1 ? '' : 's'} · Page ${data.page} of ${data.pages}`;
    qs('commute-prev').disabled = state.page <= 1;
    qs('commute-next').disabled = state.page >= state.pages;
  } catch (error) {
    rowHolder.replaceChildren(
      el('tr', {}, [
        el('td', {
          colspan: '5',
          className: 'empty-state',
          text: 'Could not load commute history.',
        }),
      ]),
    );
    showNotice(error.message, true);
  }
}

function renderWeekChart(days) {
  const chart = qs('week-chart');
  chart.replaceChildren();
  const maximum = Math.max(5, ...days.map((d) => d.average));
  for (const item of days) {
    const level = Math.round((item.average / maximum) * 12);
    chart.append(
      el(
        'div',
        {
          className: 'bar-column',
          title: `${item.day}: ${item.average} average delay minutes from ${item.count} trip(s)`,
        },
        [
          el('span', { className: 'bar-value', text: item.count ? `${item.average}m` : '—' }),
          el('div', { className: `bar level-${Math.max(0, level)}${item.count ? '' : ' empty'}` }),
          el('span', { className: 'bar-day', text: item.day }),
        ],
      ),
    );
  }
}

async function loadStats() {
  try {
    const stats = await api('/commutes/stats');
    qs('stat-trips').textContent = stats.count;
    qs('stat-delay').textContent = stats.averageDelay;
    qs('stat-ontime').textContent = stats.onTimePercent;
    qs('stat-buffer').textContent = stats.count < 3 ? '—' : stats.bufferMinutes;
    qs('buffer-hint').textContent =
      stats.count < 3
        ? `${3 - stats.count} more log(s) needed`
        : '80th percentile of positive delays';
    renderWeekChart(stats.delayByDay);
  } catch (error) {
    showNotice(error.message, true);
  }
}

await Promise.all([loadLogs(), loadStats()]);
