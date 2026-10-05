const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><path d="M60 140l30-40 20 25 15-18 25 33z" fill="#d1d5db"/><circle cx="75" cy="75" r="12" fill="#d1d5db"/></svg>'
  );

export default function ProductImage({ src, alt = '', ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        e.currentTarget.onerror = null; // avoid loops
        e.currentTarget.src = FALLBACK;
      }}
      {...props}
    />
  );
}