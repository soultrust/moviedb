import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'

const ProjectList = (props) => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    setProjects(props.projects)



    setTimeout(() => {
      const highlighted = document.querySelector('.line-item-highlight')
      if (highlighted) {
        highlighted.classList.remove('line-item-highlight')
      }
    }, 5000)
    // console.log('hello');
  }, [props.projects])

  const list = projects.map(item => {

    return (
      <li key={item.id} className={item.id === props.updatedProjectId ? 'line-item-highlight':null}>
        <Link to={`/projects/${item.id}`}>{item.attributes.title}</Link>
      </li>
    )
  })

  return (
    <div className="recently-saved">
      <ul className="generic">
        {list}
      </ul>
    </div>
  )
}

export default ProjectList