'use client';

import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Protocol } from '../types';

interface CreateProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (protocol: Omit<Protocol, 'id' | 'createdAt'>) => Promise<boolean>;
}

interface FormData {
  name: string;
  logoUrl: string;
  summary: string;
}

export function CreateProtocolModal({ isOpen, onClose, onSubmit }: CreateProtocolModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    logoUrl: '',
    summary: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      logoUrl: '',
      summary: '',
    });
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Protocol name is required';
    }

    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      newErrors.logoUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const protocolData = {
        name: formData.name.trim(),
        logoUrl: formData.logoUrl.trim() || null,
        summary: formData.summary.trim() || null,
      };

      const success = await onSubmit(protocolData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating protocol:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Add New Protocol
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                          Protocol Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.name ? 'ring-red-300' : 'ring-gray-300'
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                          placeholder="e.g., Uniswap, Aave, Compound"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="logoUrl" className="block text-sm font-medium leading-6 text-gray-900">
                          Logo URL
                        </label>
                        <input
                          type="url"
                          id="logoUrl"
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                          className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.logoUrl ? 'ring-red-300' : 'ring-gray-300'
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                          placeholder="https://..."
                        />
                        {errors.logoUrl && (
                          <p className="mt-1 text-sm text-red-600">{errors.logoUrl}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="summary" className="block text-sm font-medium leading-6 text-gray-900">
                          Summary
                        </label>
                        <textarea
                          id="summary"
                          rows={3}
                          value={formData.summary}
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                          placeholder="Brief description of the protocol..."
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 sm:ml-3 sm:w-auto"
                        >
                          {loading ? 'Adding...' : 'Add Protocol'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}