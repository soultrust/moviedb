import React from 'react'
import { Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'

const PersonList = (props) => {
  const list = props.persons.map(item => {
    return (
      <li key={item.id}>
        <Link to={`/persons/${item.id}`}>{item.attributes.first_name} {item.attributes.last_name}</Link>
      </li>
    )
  })

  return (
    <div>
      <ul className="generic">
        {list}
      </ul>
    </div>
  )
}

export default PersonList