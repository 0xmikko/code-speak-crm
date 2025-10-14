'use client';

import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Asset, AssetSource } from '../types';

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (asset: Omit<Asset, 'id' | 'createdAt' | 'currentStage'>) => Promise<boolean>;
}

interface FormData {
  assetSymbol: string;
  assetAddress: string;
  chainId: string;
  protocolId: string;
  source: AssetSource;
}

export function CreateAssetModal({ isOpen, onClose, onSubmit }: CreateAssetModalProps) {
  const [formData, setFormData] = useState<FormData>({
    assetSymbol: '',
    assetAddress: '',
    chainId: '1',
    protocolId: '',
    source: 'partner',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const resetForm = () => {
    setFormData({
      assetSymbol: '',
      assetAddress: '',
      chainId: '1',
      protocolId: '',
      source: 'partner',
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

    if (!formData.assetSymbol.trim()) {
      newErrors.assetSymbol = 'Asset symbol is required';
    }

    if (!formData.assetAddress.trim()) {
      newErrors.assetAddress = 'Asset address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.assetAddress)) {
      newErrors.assetAddress = 'Invalid Ethereum address format';
    }

    if (!formData.chainId || isNaN(Number(formData.chainId))) {
      newErrors.chainId = 'Valid chain ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const assetData = {
        assetSymbol: formData.assetSymbol.trim(),
        assetAddress: formData.assetAddress.trim().toLowerCase(),
        chainId: parseInt(formData.chainId),
        protocolId: formData.protocolId || null,
        source: formData.source,
        ownerUserId: null,
      };

      const success = await onSubmit(assetData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating asset:', error);
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
                      Create New Asset
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="assetSymbol" className="block text-sm font-medium leading-6 text-gray-900">
                          Asset Symbol *
                        </label>
                        <input
                          type="text"
                          id="assetSymbol"
                          value={formData.assetSymbol}
                          onChange={(e) => setFormData({ ...formData, assetSymbol: e.target.value })}
                          className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.assetSymbol ? 'ring-red-300' : 'ring-gray-300'
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                          placeholder="e.g., ETH, USDC, WBTC"
                        />
                        {errors.assetSymbol && (
                          <p className="mt-1 text-sm text-red-600">{errors.assetSymbol}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="assetAddress" className="block text-sm font-medium leading-6 text-gray-900">
                          Asset Address *
                        </label>
                        <input
                          type="text"
                          id="assetAddress"
                          value={formData.assetAddress}
                          onChange={(e) => setFormData({ ...formData, assetAddress: e.target.value })}
                          className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.assetAddress ? 'ring-red-300' : 'ring-gray-300'
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                          placeholder="0x..."
                        />
                        {errors.assetAddress && (
                          <p className="mt-1 text-sm text-red-600">{errors.assetAddress}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="chainId" className="block text-sm font-medium leading-6 text-gray-900">
                          Chain ID *
                        </label>
                        <input
                          type="number"
                          id="chainId"
                          value={formData.chainId}
                          onChange={(e) => setFormData({ ...formData, chainId: e.target.value })}
                          className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.chainId ? 'ring-red-300' : 'ring-gray-300'
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                          placeholder="1"
                        />
                        {errors.chainId && (
                          <p className="mt-1 text-sm text-red-600">{errors.chainId}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="source" className="block text-sm font-medium leading-6 text-gray-900">
                          Source *
                        </label>
                        <select
                          id="source"
                          value={formData.source}
                          onChange={(e) => setFormData({ ...formData, source: e.target.value as AssetSource })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                        >
                          <option value="partner">Partner</option>
                          <option value="analyst">Analyst</option>
                        </select>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 sm:ml-3 sm:w-auto"
                        >
                          {loading ? 'Creating...' : 'Create Asset'}
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