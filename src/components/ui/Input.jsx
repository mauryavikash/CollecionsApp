
import React from "react";

const Input = ({
  label,
  error,
  icon,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            {icon}
          </div>
        )}

        <input
          className={`w-full rounded-lg border px-4 py-2 text-sm transition text-black focus:outline-hidden focus:ring-0
            ${icon ? "pl-10" : ""}
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-500 focus:ring-blue-500"
            }
            ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
