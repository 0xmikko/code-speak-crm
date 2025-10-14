'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { LPWithDetails, LPContact, LPChainAddress } from '../types';

interface LPDetailsRowProps {
  lp: LPWithDetails;
  onUpdate: (lp: LPWithDetails) => Promise<void>;
}

export function LPDetailsRow({ lp, onUpdate }: LPDetailsRowProps) {
  const [activeTab, setActiveTab] = useState<'contacts' | 'addresses'>('contacts');
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    phone: '',
    telegram: '',
    github: '',
    avatarUrl: '',
  });
  const [newAddress, setNewAddress] = useState({
    chainId: '',
    address: '',
    label: '',
  });
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddContact = async () => {
    if (!newContact.name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/lps/${lp.id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newContact.name.trim(),
          role: newContact.role.trim() || null,
          phone: newContact.phone.trim() || null,
          telegram: newContact.telegram.trim() || null,
          github: newContact.github.trim() || null,
          avatarUrl: newContact.avatarUrl.trim() || null,
        }),
      });

      if (response.ok) {
        const contact = await response.json();
        const updatedLP = {
          ...lp,
          contacts: [...lp.contacts, contact],
        };
        await onUpdate(updatedLP);
        setNewContact({
          name: '',
          role: '',
          phone: '',
          telegram: '',
          github: '',
          avatarUrl: '',
        });
        setIsAddingContact(false);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.address.trim() || !newAddress.chainId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/lps/${lp.id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainId: parseInt(newAddress.chainId),
          address: newAddress.address.trim(),
          label: newAddress.label.trim() || null,
        }),
      });

      if (response.ok) {
        const address = await response.json();
        const updatedLP = {
          ...lp,
          chainAddresses: [...lp.chainAddresses, address],
        };
        await onUpdate(updatedLP);
        setNewAddress({
          chainId: '',
          address: '',
          label: '',
        });
        setIsAddingAddress(false);
      }
    } catch (error) {
      console.error('Error adding address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lps/${lp.id}/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedLP = {
          ...lp,
          contacts: lp.contacts.filter(c => c.id !== contactId),
        };
        await onUpdate(updatedLP);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lps/${lp.id}/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedLP = {
          ...lp,
          chainAddresses: lp.chainAddresses.filter(a => a.id !== addressId),
        };
        await onUpdate(updatedLP);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* LP Notes */}
      {lp.notes && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
          <p className="text-sm text-gray-600 bg-white p-3 rounded-md border">{lp.notes}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contacts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contacts ({lp.contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'addresses'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Chain Addresses ({lp.chainAddresses.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'contacts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Contacts</h4>
            <button
              onClick={() => setIsAddingContact(true)}
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Contact
            </button>
          </div>

          {lp.contacts.map((contact) => (
            <div key={contact.id} className="flex items-start justify-between bg-white p-3 rounded-md border">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  {contact.avatarUrl ? (
                    <img className="h-8 w-8 rounded-full" src={contact.avatarUrl} alt={contact.name} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                    {contact.role && <p className="text-sm text-gray-500">{contact.role}</p>}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {contact.phone && <p>Phone: {contact.phone}</p>}
                  {contact.telegram && <p>Telegram: @{contact.telegram}</p>}
                  {contact.github && <p>GitHub: {contact.github}</p>}
                </div>
              </div>
              <button
                onClick={() => handleDeleteContact(contact.id)}
                disabled={loading}
                className="text-red-400 hover:text-red-500 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}

          {isAddingContact && (
            <div className="bg-white p-3 rounded-md border">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Add New Contact</h5>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Name *"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Role"
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Telegram"
                  value={newContact.telegram}
                  onChange={(e) => setNewContact({ ...newContact, telegram: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="GitHub"
                  value={newContact.github}
                  onChange={(e) => setNewContact({ ...newContact, github: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  type="url"
                  placeholder="Avatar URL"
                  value={newContact.avatarUrl}
                  onChange={(e) => setNewContact({ ...newContact, avatarUrl: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleAddContact}
                  disabled={loading || !newContact.name.trim()}
                  className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
                <button
                  onClick={() => setIsAddingContact(false)}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {lp.contacts.length === 0 && !isAddingContact && (
            <p className="text-sm text-gray-500 text-center py-4">No contacts added yet.</p>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Chain Addresses</h4>
            <button
              onClick={() => setIsAddingAddress(true)}
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Address
            </button>
          </div>

          {lp.chainAddresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between bg-white p-3 rounded-md border">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">{address.chainId}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">{address.address}</p>
                    {address.label && <p className="text-sm text-gray-500">{address.label}</p>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteAddress(address.id)}
                disabled={loading}
                className="text-red-400 hover:text-red-500 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}

          {isAddingAddress && (
            <div className="bg-white p-3 rounded-md border">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Add New Address</h5>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    placeholder="Chain ID *"
                    value={newAddress.chainId}
                    onChange={(e) => setNewAddress({ ...newAddress, chainId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address *"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddAddress}
                    disabled={loading || !newAddress.address.trim() || !newAddress.chainId}
                    className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    onClick={() => setIsAddingAddress(false)}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {lp.chainAddresses.length === 0 && !isAddingAddress && (
            <p className="text-sm text-gray-500 text-center py-4">No chain addresses added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}