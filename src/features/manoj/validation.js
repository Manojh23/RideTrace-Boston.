import {
  object,
  allowedKeys,
  string,
  dateString,
  minutes,
  allowed,
  optionalString,
} from '../../lib/validation.js';

export const DELAY_REASONS = [
  'No delay',
  'Traffic',
  'Late vehicle',
  'Crowding',
  'Weather',
  'Missed connection',
  'Other',
];

export function validateCommute(input) {
  object(input);
  allowedKeys(input, ['route', 'date', 'expectedMinutes', 'actualMinutes', 'delayReason', 'notes']);
  return {
    route: string(input.route, 'Route', 70),
    date: dateString(input.date, 'Commute date'),
    expectedMinutes: minutes(input.expectedMinutes, 'Expected travel time'),
    actualMinutes: minutes(input.actualMinutes, 'Actual travel time'),
    delayReason: allowed(input.delayReason, 'delay reason', DELAY_REASONS),
    notes: optionalString(input.notes, 'Notes', 600),
  };
}
