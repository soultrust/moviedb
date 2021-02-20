import React from 'react'
import { NavLink } from 'react-router-dom'

const Nav = () => {
  return (
    <nav className="nav-main">
      <NavLink
        to="/"
        isActive={({ path }) => ['/', '/projects'].includes(path)}
      >
        Projects
      </NavLink>
      <NavLink to="/persons">People</NavLink>
    </nav>
  )
}

export default Nav