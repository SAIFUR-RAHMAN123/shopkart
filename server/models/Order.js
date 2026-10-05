import mongoose from 'mongoose';

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const req = { type: String, required: true, trim: true };

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        _id: false,
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        image: String,
        price: Number, // MRP at time of order
        discount: Number,
        finalPrice: Number, // unit price paid
        quantity: Number,
      },
    ],
    shippingAddress: {
      fullName: req,
      phone: req,
      street: req,
      city: req,
      state: req,
      pincode: req,
    },
    paymentMethod: { type: String, enum: ['cod', 'demo'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    paidAt: Date,
    itemsPrice: Number, // sum of MRP
    discount: Number,
    totalPrice: Number,
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending', index: true },
    statusHistory: [{ _id: false, status: String, at: { type: Date, default: Date.now } }],
    deliveredAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);