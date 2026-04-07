function setPublicCache(req, res, next) {
  const maxAge = Number(process.env.PUBLIC_CACHE_MAX_AGE || 300);
  const sMaxAge = Number(process.env.PUBLIC_CACHE_S_MAX_AGE || 1800);
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=60`);
  next();
}

function setPrivateNoStore(req, res, next) {
  res.setHeader('Cache-Control', 'private, no-store');
  next();
}

module.exports = {
  setPublicCache,
  setPrivateNoStore,
};
