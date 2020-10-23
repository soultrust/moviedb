import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Persons = () => {
  const [persons, setPersons] = useState([])

  useEffect(() => {
    axios.get('/api/v1/persons.json')
      .then(resp => {
        setPersons(resp.data.data)
      })
      .catch(resp => console.log(resp))
  }, [persons.length])

  const list = persons.map(item => {
    return (
      <li key={item.id}>
        <a href="">{item.attributes.first_name} {item.attributes.last_name}</a>
      </li>
    )
  })

  return (
    <div>
      <div className="header">
        <h1>Persons</h1>
      </div>
      <ul>
        {list}
      </ul>
    </div>
  )
}

export default Persons