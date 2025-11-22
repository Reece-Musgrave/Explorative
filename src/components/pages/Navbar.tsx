import { UserButton } from '@clerk/clerk-react'
import './navbar.css'

export default function Navbar() {
    return (
      <div className='navbar'>
        <div className='navbar-left'>
          
        </div>
        <div className='navbar-centre'>
          <a href='/landing'>ReYapp</a>
        </div>
        <div className='navbar-right'>
          <UserButton />
        </div>
        
      </div>
    );
  };