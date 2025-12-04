import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import Welcome from './components/blocks/Welcome.tsx'
import React from 'react';



export default function App() {
  return (
    <header>
      <Welcome />
      <SignedOut>
        <SignInButton forceRedirectUrl={'/landing'} signUpForceRedirectUrl={'/landing'} />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
