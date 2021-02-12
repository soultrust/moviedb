import React, { useState, useEffect, Fragment } from 'react'
import axios from 'axios'
import AddCastMembersForm from '../Project/AddCastMembersForm'
import { Button, TextField, Typography } from '@material-ui/core'

const ProjectNew = (props) => {
  const [loaded, setLoaded] = useState(false)
  const [project, setProject] = useState({
    data: {
      attributes: {
        title: ''
      }
    }
  })
  // state = {
  //   project: null,
  //   loaded: false,
  //   cast: []
  // }

  // const list = projects.map(item => {
  //   return (
  //     <li key={item.id}>
  //       <a href={`/projects/${item.id}`}>{item.attributes.title}</a>
  //     </li>
  //   )
  // })
  const handleSubmit = (e) => {
    e.preventDefault()

    axios.post('/api/v1/projects', project)
      .then(resp => {
        console.log('resp: ', resp)
        extractActors(resp.data.included)
      })
      .catch(resp => console.log(resp))
  }

  const handleTitleChange = (e) => {
    setProject({
      data: {
        attributes: {
          title: e.target.value
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} class="form-project-new">
      <Typography variant="h4" className="record-detail-title">Add a Project</Typography>
      <TextField label="Title" onChange={handleTitleChange} value={project.data.attributes.title} />
      <Button variant="outlined" size="small" type="submit" style={{ display: 'block' }}>
        Add Project
      </Button>
    </form>
  )
}

export default ProjectNew