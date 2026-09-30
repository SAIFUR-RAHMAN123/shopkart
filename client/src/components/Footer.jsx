import { Link } from 'react-router-dom';

const columns = [
  { title: 'Shop', links: [['All Products', '/products'], ['Deals', '/products?minDiscount=20'], ['Mobiles', '/products?category=mobiles'], ['Laptops', '/products?category=laptops']] },
  { title: 'Account', links: [['My Orders', '/orders'], ['Profile', '/profile'], ['Cart', '/cart']] },
];

export default function Footer() {
  return (
    <footer className="mt-10 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-xl font-extrabold italic text-white">ShopKart</h3>
          <p className="mt-2 text-sm">Electronics, fashion, home and more, delivered across India.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 font-semibold text-white">{col.title}</h4>
            <ul className="space-y-2 text-sm">
              {col.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="mb-3 font-semibold text-white">Help</h4>
          <ul className="space-y-2 text-sm">
            <li>Shipping &amp; Delivery</li>
            <li>Returns &amp; Refunds</li>
            <li>Contact Us</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs">
        © {new Date().getFullYear()} ShopKart. Demo project.
      </div>
    </footer>
  );
}