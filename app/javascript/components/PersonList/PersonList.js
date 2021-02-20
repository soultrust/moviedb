import React, { Fragment } from 'react'
import { Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'

const PersonList = (props) => {
  const list = props.persons.map(item => {
    return (
      <li key={item.id}>
        <Link to={`/persons/${item.id}`}>{item.attributes.full_name}</Link>
      </li>
    )
  })

  return (
    <Fragment>
      <ul className="generic">
        {list}
      </ul>
    </Fragment>
  )
}

export default PersonList