'use client';

import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Asset } from '../types';
import { STAGE_LABELS } from '../types';

interface AssetDetailsDrawerProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (asset: Asset) => Promise<void>;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function AssetDetailsDrawer({ asset, isOpen, onClose, onUpdate }: AssetDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: 'Overview', key: 'overview' },
    { name: 'Business DD', key: 'business_dd' },
    { name: 'Tech DD', key: 'tech_dd' },
    { name: 'Integration Build', key: 'integration_build' },
  ];

  useEffect(() => {
    // Reset tab when asset changes
    setActiveTab(0);
  }, [asset.id]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                      {/* Header */}
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Dialog.Title className="text-lg font-medium text-gray-900">
                              {asset.assetSymbol}
                            </Dialog.Title>
                            <p className="text-sm text-gray-500">
                              {STAGE_LABELS[asset.currentStage]}
                            </p>
                          </div>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              onClick={onClose}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="px-4 sm:px-6">
                        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mt-4">
                            {tabs.map((tab) => (
                              <Tab
                                key={tab.key}
                                className={({ selected }) =>
                                  classNames(
                                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                    selected
                                      ? 'bg-white shadow'
                                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                                  )
                                }
                              >
                                {tab.name}
                              </Tab>
                            ))}
                          </Tab.List>

                          <Tab.Panels className="mt-6">
                            <Tab.Panel>
                              <OverviewTab asset={asset} />
                            </Tab.Panel>
                            <Tab.Panel>
                              <BusinessDDTab asset={asset} onUpdate={onUpdate} />
                            </Tab.Panel>
                            <Tab.Panel>
                              <TechDDTab asset={asset} onUpdate={onUpdate} />
                            </Tab.Panel>
                            <Tab.Panel>
                              <IntegrationBuildTab asset={asset} onUpdate={onUpdate} />
                            </Tab.Panel>
                          </Tab.Panels>
                        </Tab.Group>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function OverviewTab({ asset }: { asset: Asset }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Asset Details</h3>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Symbol</dt>
            <dd className="text-sm text-gray-900">{asset.assetSymbol}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="text-sm text-gray-900 font-mono">{asset.assetAddress}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Chain ID</dt>
            <dd className="text-sm text-gray-900">{asset.chainId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Source</dt>
            <dd className="text-sm text-gray-900 capitalize">{asset.source}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Current Stage</dt>
            <dd className="text-sm text-gray-900">{STAGE_LABELS[asset.currentStage]}</dd>
          </div>
          {asset.protocolName && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Protocol</dt>
              <dd className="text-sm text-gray-900">{asset.protocolName}</dd>
            </div>
          )}
          {asset.ownerName && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="text-sm text-gray-900">{asset.ownerName}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function BusinessDDTab({ asset, onUpdate }: { asset: Asset; onUpdate: (asset: Asset) => Promise<void> }) {
  const [notes, setNotes] = useState('');
  const [loading, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/assets/${asset.id}/business-dd`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        const updatedAsset = await response.json();
        await onUpdate(updatedAsset);
      }
    } catch (error) {
      console.error('Error saving business DD:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Business Due Diligence</h3>
        <div className="mt-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Add business due diligence notes..."
          />
        </div>
        <div className="mt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TechDDTab({ asset, onUpdate }: { asset: Asset; onUpdate: (asset: Asset) => Promise<void> }) {
  const [techData, setTechData] = useState({
    priceOracleNeeded: false,
    adapterNeeded: false,
    phantomTokenNeeded: false,
    developerUserId: '',
    auditEta: '',
  });
  const [loading, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/assets/${asset.id}/tech-dd`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(techData),
      });

      if (response.ok) {
        const updatedAsset = await response.json();
        await onUpdate(updatedAsset);
      }
    } catch (error) {
      console.error('Error saving tech DD:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Technical Due Diligence</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input
              id="priceOracle"
              type="checkbox"
              checked={techData.priceOracleNeeded}
              onChange={(e) => setTechData({ ...techData, priceOracleNeeded: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="priceOracle" className="ml-2 block text-sm text-gray-900">
              Price Oracle Needed
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="adapter"
              type="checkbox"
              checked={techData.adapterNeeded}
              onChange={(e) => setTechData({ ...techData, adapterNeeded: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="adapter" className="ml-2 block text-sm text-gray-900">
              Adapter Needed
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="phantomToken"
              type="checkbox"
              checked={techData.phantomTokenNeeded}
              onChange={(e) => setTechData({ ...techData, phantomTokenNeeded: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="phantomToken" className="ml-2 block text-sm text-gray-900">
              Phantom Token Needed
            </label>
          </div>

          <div>
            <label htmlFor="auditEta" className="block text-sm font-medium text-gray-700">
              Audit ETA
            </label>
            <input
              type="date"
              id="auditEta"
              value={techData.auditEta}
              onChange={(e) => setTechData({ ...techData, auditEta: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function IntegrationBuildTab({ asset, onUpdate }: { asset: Asset; onUpdate: (asset: Asset) => Promise<void> }) {
  const [buildData, setBuildData] = useState({
    buildStatus: 'not_started' as const,
    aiAuditStatus: 'not_started' as const,
    internalAuditStatus: 'not_started' as const,
  });
  const [loading, setSaving] = useState(false);

  const statusOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/assets/${asset.id}/integration-build`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildData),
      });

      if (response.ok) {
        const updatedAsset = await response.json();
        await onUpdate(updatedAsset);
      }
    } catch (error) {
      console.error('Error saving integration build:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Integration Build</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="buildStatus" className="block text-sm font-medium text-gray-700">
              Build Status
            </label>
            <select
              id="buildStatus"
              value={buildData.buildStatus}
              onChange={(e) => setBuildData({ ...buildData, buildStatus: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="aiAuditStatus" className="block text-sm font-medium text-gray-700">
              AI Audit Status
            </label>
            <select
              id="aiAuditStatus"
              value={buildData.aiAuditStatus}
              onChange={(e) => setBuildData({ ...buildData, aiAuditStatus: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="internalAuditStatus" className="block text-sm font-medium text-gray-700">
              Internal Audit Status
            </label>
            <select
              id="internalAuditStatus"
              value={buildData.internalAuditStatus}
              onChange={(e) => setBuildData({ ...buildData, internalAuditStatus: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}