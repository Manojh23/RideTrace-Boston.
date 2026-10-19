export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function readPagination(query, max = 60) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 12);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) {
    throw new HttpError(400, 'Page must be a positive integer.');
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > max) {
    throw new HttpError(400, `Limit must be between 1 and ${max}.`);
  }
  return { page, limit, skip: (page - 1) * limit };
}

export function parseId(id) {
  if (!/^[a-f\d]{24}$/i.test(id)) throw new HttpError(400, 'Invalid record ID.');
  return id;
}

export function textFilter(value, maxLength = 90) {
  if (value === undefined || value === '') return '';
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new HttpError(400, 'Invalid filter.');
  }
  return value.trim();
}

export function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
