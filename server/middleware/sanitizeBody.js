// Strips Mongo operator keys ($gt, $ne, ...) and dotted keys from request bodies
const clean = (v) => {
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v)
        .filter(([k]) => !k.startsWith('$') && !k.includes('.'))
        .map(([k, x]) => [k, clean(x)])
    );
  }
  return v;
};

export default (req, res, next) => {
  if (req.body && typeof req.body === 'object') req.body = clean(req.body);
  next();
};