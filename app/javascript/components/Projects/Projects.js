import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Projects = () => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    axios.get('/api/v1/projects.json')
      .then(resp => {
        setProjects(resp.data.data)
      })
      .catch(resp => console.log(resp))
  }, [projects.length])

  const list = projects.map(item => {
    return (<li key={item.id}>{item.attributes.title}</li>)
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