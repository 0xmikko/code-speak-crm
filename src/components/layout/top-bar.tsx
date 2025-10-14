'use client';

import { Fragment, useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu, Transition, Combobox } from '@headlessui/react';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { SearchResults } from '@/components/search/search-results';

interface SearchResult {
  id: string;
  type: 'asset' | 'protocol';
  title: string;
  subtitle: string | null;
  currentStage?: string;
}

export function TopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    assets: SearchResult[];
    protocols: SearchResult[];
  }>({ assets: [], protocols: [] });
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ assets: [], protocols: [] });
        return;
      }

      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(performSearch, 300);
    setSearchTimeout(newTimeout);

    return () => {
      if (newTimeout) {
        clearTimeout(newTimeout);
      }
    };
  }, [searchQuery]);

  const handleSearchSelect = (result: SearchResult) => {
    setSearchQuery('');
    setSearchResults({ assets: [], protocols: [] });

    if (result.type === 'asset') {
      router.push('/assets');
    } else if (result.type === 'protocol') {
      router.push('/protocols');
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          <Combobox value={null} onChange={handleSearchSelect}>
            <div className="relative w-full">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-0 ml-0"
                aria-hidden="true"
              />
              <Combobox.Input
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search assets, protocols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchResults
                query={searchQuery}
                results={searchResults}
                onSelect={handleSearchSelect}
              />
            </div>
          </Combobox>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {session?.user ? (
            <Menu as="div" className="relative">
              <Menu.Button className="-m-1.5 flex items-center p-1.5">
                <span className="sr-only">Open user menu</span>
                <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                <span className="hidden lg:flex lg:items-center">
                  <span
                    className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                    aria-hidden="true"
                  >
                    {session.user.name}
                  </span>
                </span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut()}
                        className={`block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900 ${
                          active ? 'bg-gray-50' : ''
                        }`}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <div className="text-sm text-gray-500">Not signed in</div>
          )}
        </div>
      </div>
    </div>
  );
}