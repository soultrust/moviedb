import React, { useState, useEffect, Fragment } from 'react'
import axios from 'axios'
import AddCastMembersForm from '../Project/AddCastMembersForm'
import { Link } from 'react-router-dom'
import { Typography } from '@material-ui/core'

const ProjectEdit = (props) => {
  const [loaded, setLoaded] = useState(false)
  console.log('props: ', props)
  const projectId = props.match.params.id
  // state = {
  //   project: null,
  //   loaded: false,
  //   cast: []
  // }
  const [project, setProject] = useState({
    data: {
      id: '',
      attributes: {
        title: ''
      }
    }
  })

  useEffect(() => {
    const url = `/api/v1/projects/${projectId}`

    axios.get(url)
      .then(resp => {
        console.log(resp.data)
        setProject(resp.data)
        setLoaded(true)
      })
      .catch(resp => console.log(resp))
  }, [])

  return (
    <Fragment>
      { loaded &&
        <Fragment>
          <div>
            <Typography variant="h4">{project.data.attributes.title}</Typography><br /><br />
            <Link to={`/projects/${project.data.id}`}>&lt;-- Read-Only View</Link>
          </div>
          <AddCastMembersForm projectId={project.data.id} />
        </Fragment>
      }
    </Fragment>
  )
}

export default ProjectEdit