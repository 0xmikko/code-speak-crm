'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Assets', href: '/assets', icon: ChartBarIcon },
  { name: 'Protocols', href: '/protocols', icon: BuildingOfficeIcon },
  { name: 'LPs', href: '/lps', icon: UserGroupIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-semibold text-gray-900">CRM</h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href as any}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                        ${
                          isActive
                            ? 'bg-gray-200 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 ${
                          isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}