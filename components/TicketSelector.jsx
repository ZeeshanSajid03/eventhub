"use client";

export default function TicketSelector({ quantity, setQuantity, max }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-medium"
        >
          -
        </button>
        <span className="text-lg font-semibold text-gray-800 w-6 text-center">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(Math.min(max, quantity + 1))}
          className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-medium"
        >
          +
        </button>
        <span className="text-xs text-gray-400">max {max}</span>
      </div>
    </div>
  );
}