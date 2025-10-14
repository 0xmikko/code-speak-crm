'use client';

import { Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChartBarIcon, BuildingOfficeIcon } from '@heroicons/react/20/solid';

interface SearchResult {
  id: string;
  type: 'asset' | 'protocol';
  title: string;
  subtitle: string | null;
  currentStage?: string;
}

interface SearchResultsProps {
  query: string;
  results: {
    assets: SearchResult[];
    protocols: SearchResult[];
  };
  onSelect: (result: SearchResult) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function SearchResults({ query, results, onSelect }: SearchResultsProps) {
  const allResults = [
    ...results.assets,
    ...results.protocols,
  ];

  if (!query || allResults.length === 0) {
    return null;
  }

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Combobox.Options
        static
        className="absolute left-0 z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        {results.assets.length > 0 && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-gray-900 uppercase tracking-wide bg-gray-50">
              Assets
            </div>
            {results.assets.map((result) => (
              <Combobox.Option
                key={result.id}
                value={result}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-primary-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active }) => (
                  <div className="flex items-center">
                    <ChartBarIcon className={classNames(
                      'h-5 w-5 flex-shrink-0',
                      active ? 'text-white' : 'text-gray-400'
                    )} />
                    <div className="ml-3 truncate">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className={classNames(
                          'ml-2 text-sm',
                          active ? 'text-primary-200' : 'text-gray-500'
                        )}>
                          {result.subtitle}
                        </span>
                      )}
                      {result.currentStage && (
                        <div className={classNames(
                          'text-xs mt-1',
                          active ? 'text-primary-200' : 'text-gray-500'
                        )}>
                          Stage: {result.currentStage.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Combobox.Option>
            ))}
          </>
        )}

        {results.protocols.length > 0 && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-gray-900 uppercase tracking-wide bg-gray-50">
              Protocols
            </div>
            {results.protocols.map((result) => (
              <Combobox.Option
                key={result.id}
                value={result}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-primary-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active }) => (
                  <div className="flex items-center">
                    <BuildingOfficeIcon className={classNames(
                      'h-5 w-5 flex-shrink-0',
                      active ? 'text-white' : 'text-gray-400'
                    )} />
                    <div className="ml-3 truncate">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className={classNames(
                          'ml-2 text-sm',
                          active ? 'text-primary-200' : 'text-gray-500'
                        )}>
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Combobox.Option>
            ))}
          </>
        )}
      </Combobox.Options>
    </Transition>
  );
}