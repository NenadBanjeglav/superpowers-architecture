export const APPROVAL_POLICIES = Object.freeze(['Autonomous', 'Review-gated']);

const ISO_8601_TIMESTAMP = /^(?<year>\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

export function resolveApprovalPolicy(value, { defaultPolicy = 'Review-gated' } = {}) {
  const policy = value ?? defaultPolicy;
  if (!APPROVAL_POLICIES.includes(policy)) {
    throw new Error(`Approval Policy must be Autonomous or Review-gated; received ${JSON.stringify(value)}.`);
  }
  return policy;
}

export function policyAcceptsReady(value) {
  return resolveApprovalPolicy(value) === 'Autonomous';
}

export function isIso8601Timestamp(value) {
  if (typeof value !== 'string') return false;
  const match = value.match(ISO_8601_TIMESTAMP);
  if (!match) return false;
  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1] && !Number.isNaN(Date.parse(value));
}
