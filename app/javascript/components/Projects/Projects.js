import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Projects = () => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    console.log('got it')
    axios.get('/api/v1/projects')
      .then(resp => {
        setProjects(resp.data)
      })
      .catch(resp => console.log(resp))
  }, [projects.length])

  const list = projects.map(item => {
    return (
      <li key={item.id}>
        <a href={`/projects/${item.id}`}>{item.attributes.title}</a>
      </li>
    )
  })

  return (
    <div>
      <div className="header">
        <h1>Projects</h1>
      </div>
      <ul>
        {list}
      </ul>
    </div>
  )
}

export default Projects