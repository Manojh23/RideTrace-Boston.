import { HttpError } from '../../lib/http.js';
import {
  object,
  allowedKeys,
  string,
  dateString,
  minutes,
  allowed,
  optionalString,
} from '../../lib/validation.js';

export const DAYPARTS = ['Morning', 'Afternoon', 'Evening', 'Night'];

export function validateTransfer(input) {
  object(input);
  allowedKeys(input, [
    'stopName',
    'fromRoute',
    'toRoute',
    'observedAt',
    'daypart',
    'transferMinutes',
    'missedConnection',
    'notes',
  ]);
  if (typeof input.missedConnection !== 'boolean') {
    throw new HttpError(400, 'Missed connection must be true or false.');
  }
  return {
    stopName: string(input.stopName, 'Interchange stop', 110),
    fromRoute: string(input.fromRoute, 'From route', 70),
    toRoute: string(input.toRoute, 'To route', 70),
    observedAt: dateString(input.observedAt, 'Transfer date'),
    daypart: allowed(input.daypart, 'time of day', DAYPARTS),
    transferMinutes: minutes(input.transferMinutes, 'Transfer time', 180),
    missedConnection: input.missedConnection,
    notes: optionalString(input.notes, 'Notes', 600),
  };
}
