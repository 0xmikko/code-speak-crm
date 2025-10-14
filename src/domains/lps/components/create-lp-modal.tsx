'use client';

import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { LPWithDetails, LPStatus } from '../types';
import { LP_STATUS_LABELS } from '../types';

interface CreateLPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lp: Omit<LPWithDetails, 'id' | 'createdAt' | 'contacts' | 'chainAddresses'>) => Promise<boolean>;
}

interface FormData {
  name: string;
  contactEmail: string;
  status: LPStatus;
  notes: string;
}

export function CreateLPModal({ isOpen, onClose, onSubmit }: CreateLPModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contactEmail: '',
    status: 'unknown',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      contactEmail: '',
      status: 'unknown',
      notes: '',
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
      newErrors.name = 'LP name is required';
    }

    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const lpData = {
        name: formData.name.trim(),
        contactEmail: formData.contactEmail.trim() || null,
        status: formData.status,
        notes: formData.notes.trim() || null,
      };

      const success = await onSubmit(lpData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating LP:', error);
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
                      Add New LP
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                          LP Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.name ? 'ring-red-300' : 'ring-gray-300'
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                          placeholder="e.g., Alameda Research, Jump Trading"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="contactEmail" className="block text-sm font-medium leading-6 text-gray-900">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          id="contactEmail"
                          value={formData.contactEmail}
                          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                          className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.contactEmail ? 'ring-red-300' : 'ring-gray-300'
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                          placeholder="contact@example.com"
                        />
                        {errors.contactEmail && (
                          <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                          Status
                        </label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as LPStatus })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                        >
                          {Object.entries(LP_STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                          placeholder="Additional notes about this LP..."
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 sm:ml-3 sm:w-auto"
                        >
                          {loading ? 'Adding...' : 'Add LP'}
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