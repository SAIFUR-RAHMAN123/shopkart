# ShopKart QA Checklist

Run with a fresh seed (`npm run seed`) and the admin account (`npm run seed:admin`).

## Auth
- [ ] Register with invalid data shows field errors; valid data logs in and redirects home
- [ ] Duplicate email shows an error toast
- [ ] Login / logout work; session survives a page refresh
- [ ] Protected pages (cart, checkout, orders, profile) redirect to login and return after login
- [ ] Normal user visiting /admin is redirected to /
- [ ] Deactivated user is logged out on the next request and cannot log in

## Browsing
- [ ] Home loads: carousel, categories, trust strip, 4 product sections
- [ ] Category tile / navbar category opens a filtered listing
- [ ] Search from the navbar shows matching products and an empty state for no results
- [ ] Filters (category, brand, price, rating), sort and pagination work and persist in the URL
- [ ] Product details: gallery, price/discount, stock label, quantity limits, specs, similar products
- [ ] Unknown product slug shows "Product not found"; unknown URL shows the 404 page

## Cart and checkout
- [ ] Add to cart (logged out redirects to login; logged in updates the navbar badge)
- [ ] Quantity +/- respects stock and the max of 10; remove and clear (with confirm) work
- [ ] Cart persists after refresh and logout/login
- [ ] Checkout validation (phone, pincode); COD and Demo orders both succeed
- [ ] Stock decreases after an order; cart is emptied; success page shows the order

## Orders
- [ ] My Orders lists orders newest first; details show items, address, payment, history
- [ ] Cancelling a Pending order restocks the items
- [ ] Another user's order URL shows "Order not found"

## Admin
- [ ] Dashboard stats, recent orders, low-stock list match the data
- [ ] Products: search, filters, add (validation), edit, inline stock, active toggle, delete (confirm)
- [ ] Categories: add, rename, delete (blocked when it still has products)
- [ ] Orders: filter, search, status updates only offer valid next steps; Delivered marks COD paid
- [ ] Users: search, deactivate / activate; admin rows have no action

## Profile
- [ ] Update name/phone/address; checkout form is prefilled from the saved address
- [ ] Wrong current password shows an error and keeps you logged in; correct change works

## Resilience
- [ ] Stop the API: lists show an error with "Try again"; actions show a toast
- [ ] Slow/offline network does not leave buttons stuck in a loading state
- [ ] A thrown render error shows the "Something went wrong" screen

## Responsive (375px, 768px, 1280px)
- [ ] No horizontal page scroll; admin tables scroll inside their container
- [ ] Mobile menu, search row, filter drawer and sticky product action bar work