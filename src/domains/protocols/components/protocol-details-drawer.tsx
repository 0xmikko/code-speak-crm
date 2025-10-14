'use client';

import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { ProtocolWithContacts, ProtocolContact } from '../types';

interface ProtocolDetailsDrawerProps {
  protocol: ProtocolWithContacts | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (protocol: ProtocolWithContacts) => Promise<void>;
}

export function ProtocolDetailsDrawer({ protocol, isOpen, onClose, onUpdate }: ProtocolDetailsDrawerProps) {
  const [contacts, setContacts] = useState<ProtocolContact[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    phone: '',
    telegram: '',
    github: '',
    avatarUrl: '',
  });
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (protocol) {
      setContacts(protocol.contacts || []);
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
  }, [protocol]);

  const handleAddContact = async () => {
    if (!protocol || !newContact.name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/protocols/${protocol.id}/contacts`, {
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
        const updatedProtocol = {
          ...protocol,
          contacts: [...contacts, contact],
        };
        setContacts(updatedProtocol.contacts);
        await onUpdate(updatedProtocol);
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

  const handleDeleteContact = async (contactId: string) => {
    if (!protocol) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/protocols/${protocol.id}/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedContacts = contacts.filter(c => c.id !== contactId);
        const updatedProtocol = {
          ...protocol,
          contacts: updatedContacts,
        };
        setContacts(updatedContacts);
        await onUpdate(updatedProtocol);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!protocol) return null;

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
                          <div className="flex items-center space-x-3">
                            {protocol.logoUrl ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={protocol.logoUrl}
                                alt={`${protocol.name} logo`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {protocol.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <Dialog.Title className="text-lg font-medium text-gray-900">
                                {protocol.name}
                              </Dialog.Title>
                              {protocol.summary && (
                                <p className="text-sm text-gray-500">{protocol.summary}</p>
                              )}
                            </div>
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

                      {/* Contacts */}
                      <div className="px-4 sm:px-6 mt-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
                          <button
                            onClick={() => setIsAddingContact(true)}
                            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                          >
                            <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                            Add Contact
                          </button>
                        </div>

                        <div className="mt-4 space-y-4">
                          {contacts.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex items-start justify-between rounded-lg border border-gray-200 p-4"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  {contact.avatarUrl ? (
                                    <img
                                      className="h-8 w-8 rounded-full"
                                      src={contact.avatarUrl}
                                      alt={contact.name}
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-xs font-medium text-gray-700">
                                        {contact.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                                    {contact.role && (
                                      <p className="text-sm text-gray-500">{contact.role}</p>
                                    )}
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
                            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Contact</h4>
                              <div className="space-y-3">
                                <div>
                                  <input
                                    type="text"
                                    placeholder="Name *"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    placeholder="Role"
                                    value={newContact.role}
                                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    placeholder="Phone"
                                    value={newContact.phone}
                                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    placeholder="Telegram handle"
                                    value={newContact.telegram}
                                    onChange={(e) => setNewContact({ ...newContact, telegram: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    placeholder="GitHub username"
                                    value={newContact.github}
                                    onChange={(e) => setNewContact({ ...newContact, github: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="url"
                                    placeholder="Avatar URL"
                                    value={newContact.avatarUrl}
                                    onChange={(e) => setNewContact({ ...newContact, avatarUrl: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                  />
                                </div>
                                <div className="flex space-x-2">
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
                            </div>
                          )}

                          {contacts.length === 0 && !isAddingContact && (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500">No contacts added yet.</p>
                            </div>
                          )}
                        </div>
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