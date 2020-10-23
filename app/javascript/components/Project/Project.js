import React, { useState, useEffect, Fragment } from 'react'
import axios from 'axios'

const Project = (props) => {
  const [project, setProject] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    console.log(props)
    const projectId = props.match.params.id
    const url = `/api/v1/projects/${projectId}`

    axios.get(url)
      .then(resp => {
        setProject(resp.data.data)
        setLoaded(true)
      })
      .catch(resp => console.log(resp))
  }, [])

  return (
    <Fragment>
      {
        loaded &&
        <div>
          <h1>{project.attributes.title}</h1>
          <a href={`/projects/${project.id}/edit`}>edit</a>
        </div>
      }
    </Fragment>
  )
}

export default Project