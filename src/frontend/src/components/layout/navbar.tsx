import { useState } from 'react'
import { Link } from "react-router-dom";
import { Dialog, DialogPanel, PopoverGroup } from '@headlessui/react'
import { Bars3Icon, XMarkIcon,UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from "../../context/authContext";
import logo from "../../assets/logo.png";
import ProfileModal from "@/components/layout/ProfileModal"; 

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false) 
  const { accessToken, logout } = useAuth()

  return (
    <header className="bg-gray-50">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between py-2 px-6 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">ReYapp</span>
            <img src={logo} className="h-12 w-auto"/>
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <a href="/" className="text-sm/6 font-semibold text-gray-900">Search</a>
          <a href="/feed" className="text-sm/6 font-semibold text-gray-300">Feed</a>
        </PopoverGroup>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {accessToken ? (
            <button
              onClick={() => setProfileOpen(true)}
              className="text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Open profile"
            >
              <UserCircleIcon className="size-7" />
            </button>
          ) : (
            <Link to="/login" className="text-sm/6 font-semibold text-gray-900">
              Log in / Sign up
            </Link>
          )}
        </div>
      </nav>

      {profileOpen && (
        <ProfileModal onClose={() => setProfileOpen(false)} />
      )}

      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">ReYapp</span>
              <img src={logo} className="h-8 w-auto"/>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <a href="/" className="-mx-3 block rounded-lg px-3 py-2 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50">
                  Search
                </a>
                <a className="-mx-3 block rounded-lg px-3 py-2 text-sm/6 font-semibold text-gray-300">
                  Feed
                </a>
              </div>
              <div className="py-6">
                {accessToken ? (
                  <button
                    onClick={() => { setMobileMenuOpen(false); setProfileOpen(true); }}
                    className="-mx-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    <UserCircleIcon className="size-5" />
                    Profile
                  </button>
                ) : (
                  <Link to="/login" className="-mx-3 block rounded-lg px-3 py-2 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50">
                    Log in / Sign up
                  </Link>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}