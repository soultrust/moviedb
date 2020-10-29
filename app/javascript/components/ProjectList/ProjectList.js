import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'

const GroupList = () => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    axios.get('/api/v1/projects')
      .then((resp) => {
        setProjects(resp.data.data)
      })
      .catch(resp => console.log(resp))
  }, [])

  const list = projects.map(item => {
    return (
      <li key={item.id}>
        <Link to={`/projects/${item.id}`}>{item.attributes.title}</Link>
      </li>
    )
  })

  return (
    <div className="recently-saved">
      <Typography variant="h6" className="recently-saved-title">Recently Saved projects</Typography>
      <ul className="generic">
        {list}
      </ul>
    </div>
  )
}

export default GroupList