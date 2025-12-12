import React from 'react';
import { FaPlus, FaMinus, FaTrash, FaCreditCard, FaMoneyBillWave, FaQrcode } from 'react-icons/fa';

// Add onCheckout to props
export default function CheckoutSection({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discount = 5.00; // Example fixed discount
    const taxRate = 0.10;
    const tax = (subtotal - discount) * taxRate;
    const total = subtotal - discount + tax;

    // Handler for the checkout button click
    const handleProcessPurchase = () => {
        if (cartItems.length > 0) {
            // Pass the calculated total to the handler in the Dashboard component
            onCheckout(total);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Details Items</h2>
                <span className="text-purple-600 font-semibold">{cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items</span>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto pr-2 mb-6 -mr-2">
                {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-center mt-8">Your cart is empty. Add a product to get started!</p>
                ) : (
                    cartItems.map(item => (
                        <div key={item.id} className="flex items-center bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-800">{item.name}</h3>
                                {/* Display actual category if available */}
                                <p className="text-xs text-gray-500 mb-2">Category: {item.category || 'N/A'}</p> 
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 border border-gray-300 rounded-md">
                                        <button 
                                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                            className="p-1 text-gray-600 hover:text-red-500 transition focus:outline-none"
                                        >
                                            <FaMinus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-medium">{item.quantity}</span>
                                        <button 
                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                            className="p-1 text-gray-600 hover:text-green-500 transition focus:outline-none"
                                        >
                                            <FaPlus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => onRemoveItem(item.id)}
                                className="ml-4 p-2 text-red-500 hover:text-red-700 transition focus:outline-none"
                            >
                                <FaTrash className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                <div className="flex justify-between py-1 text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-red-500">-${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                    <span className="text-gray-600">Tax ({Math.round(taxRate * 100)}%)</span>
                    <span className="font-medium text-gray-800">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 mt-2 border-t border-gray-200 text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                    <button className="flex flex-col items-center justify-center p-3 border border-purple-600 text-purple-600 rounded-lg bg-purple-50 hover:bg-purple-100 transition focus:outline-none">
                        <FaMoneyBillWave className="text-xl mb-1" />
                        <span className="text-xs">Cash</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 border border-gray-300 text-gray-600 rounded-lg bg-white hover:bg-gray-50 transition focus:outline-none">
                        <FaCreditCard className="text-xl mb-1" />
                        <span className="text-xs">Debit</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 border border-gray-300 text-gray-600 rounded-lg bg-white hover:bg-gray-50 transition focus:outline-none">
                        <FaQrcode className="text-xl mb-1" />
                        <span className="text-xs">QRS</span>
                    </button>
                </div>
            </div>

            {/* Process Purchase Button */}
            <button 
                onClick={handleProcessPurchase}
                className={`w-full text-white py-3 rounded-lg text-lg font-semibold transition focus:outline-none ${cartItems.length > 0 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}`}
                disabled={cartItems.length === 0}
            >
                Process Purchase
            </button>
        </div>
    );
}
