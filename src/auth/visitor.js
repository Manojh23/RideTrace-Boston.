import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const COOKIE = 'ridetrace_visitor';
const MAX_AGE = 60 * 60 * 24 * 365;

function sign(id, secret) {
  return createHmac('sha256', secret).update(id).digest('hex');
}

export function readVisitorCookie(rawCookie, secret) {
  const cookies = String(rawCookie || '').split(';');
  const cookie = cookies.find((item) => item.trim().startsWith(`${COOKIE}=`));
  if (!cookie) return null;
  const value = cookie.trim().slice(COOKIE.length + 1);
  const [id, signature, ...extra] = value.split('.');
  if (extra.length || !/^[a-f0-9]{32}$/.test(id || '') || !/^[a-f0-9]{64}$/.test(signature || '')) {
    return null;
  }
  const actual = Buffer.from(signature, 'hex');
  const expected = Buffer.from(sign(id, secret), 'hex');
  return timingSafeEqual(actual, expected) ? id : null;
}

export function attachVisitor(secret, secure = false) {
  return (req, res, next) => {
    let id = readVisitorCookie(req.headers.cookie, secret);
    if (!id) {
      id = randomBytes(16).toString('hex');
      const value = `${COOKIE}=${id}.${sign(id, secret)}`;
      res.append(
        'Set-Cookie',
        `${value}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`,
      );
    }
    req.visitorId = id;
    next();
  };
}
