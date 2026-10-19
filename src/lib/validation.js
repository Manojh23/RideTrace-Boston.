import { HttpError } from './http.js';

export function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Please provide a valid JSON object.');
  }
}

export function string(value, label, max = 100, min = 1) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
    throw new HttpError(400, `${label} must contain ${min}–${max} characters.`);
  }
  return value.trim();
}

export function optionalString(value, label, max = 600) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string' || value.length > max) {
    throw new HttpError(400, `${label} is too long.`);
  }
  return value.trim();
}

export function minutes(value, label, max = 480) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > max) {
    throw new HttpError(400, `${label} must be a whole number from 1 to ${max}.`);
  }
  return value;
}

export function dateString(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, `${label} must be YYYY-MM-DD.`);
  }
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, `${label} is not a valid date.`);
  }
  const today = new Date().toISOString().slice(0, 10);
  if (value > today || value < '2000-01-01') {
    throw new HttpError(400, `${label} cannot be in the future or before 2000.`);
  }
  return value;
}

export function allowed(value, label, options) {
  if (!options.includes(value)) throw new HttpError(400, `Invalid ${label}.`);
  return value;
}

export function allowedKeys(input, keys) {
  for (const key of Object.keys(input)) {
    if (!keys.includes(key)) throw new HttpError(400, `Unknown field: ${key}.`);
  }
}
