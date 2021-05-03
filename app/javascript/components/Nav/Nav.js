import React, { Fragment, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const Nav = () => {
  return (
    <Fragment>
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
    </Fragment>
  )
}

export default Nav