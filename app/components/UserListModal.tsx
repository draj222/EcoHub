"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiSearch, FiUser } from "react-icons/fi";

interface User {
  id: string;
  name: string;
  image: string | null;
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: User[];
  isLoading?: boolean;
  onRemove?: (userId: string) => void;
  isFollowing?: boolean;
}

export default function UserListModal({
  isOpen,
  onClose,
  title,
  users,
  isLoading = false,
  onRemove,
  isFollowing = false
}: UserListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter((user) => 
          user.name?.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  }, [searchQuery, users]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <FiX className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Search input */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-pulse">Loading...</div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    {searchQuery.trim() !== "" 
                      ? "No users found matching your search"
                      : "No users found"}
                  </div>
                ) : (
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <li key={user.id} className="py-3">
                          <div className="flex items-center justify-between">
                            <Link 
                              href={`/profile/${user.id}`}
                              className="flex items-center group"
                              onClick={onClose}
                            >
                              <div className="relative w-10 h-10 mr-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {user.image ? (
                                  <Image
                                    src={user.image}
                                    alt={user.name || "User"}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <FiUser className="text-gray-400" size={20} />
                                  </div>
                                )}
                              </div>
                              <span className="text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                                {user.name || "Anonymous User"}
                              </span>
                            </Link>
                            
                            {onRemove && (
                              <button
                                type="button"
                                className="ml-2 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                onClick={() => onRemove(user.id)}
                              >
                                {isFollowing ? "Unfollow" : "Remove"}
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 