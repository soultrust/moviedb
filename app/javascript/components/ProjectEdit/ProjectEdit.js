import React, { useState, useEffect, Fragment } from 'react'
import axios from 'axios'
import AddCastMembersForm from '../Project/AddCastMembersForm'
import { Link } from 'react-router-dom'
import { TextField } from '@material-ui/core'

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
    // data: {
    //   id: '',
    //   attributes: {
    //     title: ''
    //   }
    // }
    title: ''
  })

  useEffect(() => {
    const url = `/api/v1/projects/${projectId}`

    axios.get(url)
      .then(resp => {
        console.log(resp.data.data)

        // const transformedResult = {
        //   id: resp.data.data.id,
        //   title: resp.data.data.attributes.title
        // }
        setProject(resp.data.data.attributes)
        setLoaded(true)
      })
      .catch(resp => console.log(resp))
  }, [])

  const handleTitleChange = (e) => {
    setProject({
      title: e.target.value
    })
  }

  const saveTitle = (e) => {
    e.preventDefault()

    axios
      .put(`/api/v1/projects/${projectId}`, {
        data: {
          attributes: project
        }
      })
      .then(resp => console.log(resp))
  }

  return (
    <Fragment>
      { loaded &&
        <Fragment>
          <Link to={`/projects/${projectId}`}>&lt;-- Read-Only View</Link>
          <form onSubmit={saveTitle} class="form-project-edit">
            <TextField
              label="Title"
              onChange={handleTitleChange}
              value={project.title}
            />
            <button>submit title</button>
          </form>
          <AddCastMembersForm projectId={projectId} />
        </Fragment>
      }
    </Fragment>
  )
}

export default ProjectEdit