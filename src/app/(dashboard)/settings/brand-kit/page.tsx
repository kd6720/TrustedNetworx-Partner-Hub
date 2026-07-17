"use client";

import { Upload, Fingerprint } from "lucide-react";

export default function BrandKitPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Brand & Company Card */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Company Brand
        </h3>

        {/* Logo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Drag and drop your logo here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, or SVG up to 5MB
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              defaultValue="Carter Dewey Partners"
              disabled
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Contact your rep to change
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              defaultValue="trustednetworx.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              defaultValue="305-498-7530"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              defaultValue="carter@trustednetworx.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Contact for Co-Branded Materials
          </label>
          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
            <option>Carter Dewey</option>
          </select>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Partner Profile
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Lines Under Management
              </label>
              <input
                type="number"
                defaultValue={350}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Agent Team Size
              </label>
              <input
                type="number"
                defaultValue={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Current Voice Platform
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. RingCentral, 8x8"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Verticals Served
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. Senior Living, Hospitality"
              />
            </div>
          </div>
        </div>

        <button className="mt-6 inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
          Save Company Info
        </button>
      </div>

      {/* Passkey Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Fingerprint size={18} />
              Passkey Authentication
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Sign in faster and more securely using Touch ID, Face ID, or a
              device PIN.
            </p>
          </div>
          <button className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Set up Passkey
          </button>
        </div>
      </div>
    </div>
  );
}
