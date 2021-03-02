import React from 'react'
import { NavLink } from 'react-router-dom'

const Nav = () => {
  return (
    <nav className="nav-main">
      <NavLink
        exact
        to="/"
        isActive={(match, loc) => {
          return loc && loc.pathname.includes('projects') || match;
        }}
      >
        Projects
      </NavLink>
      <NavLink to="/persons">People</NavLink>
    </nav>
  )
}

export default Nav