import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const items = [
  { icon: Truck, title: 'Free delivery', text: 'On every order' },
  { icon: ShieldCheck, title: 'Secure checkout', text: 'Your data stays safe' },
  { icon: RotateCcw, title: 'Easy cancellations', text: 'Cancel before it ships' },
  { icon: Headphones, title: 'Support', text: "We're here to help" },
];

export default function TrustStrip() {
  return (
    <div className="border-b bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-4 md:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3">
            <Icon size={28} className="shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-gray-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}