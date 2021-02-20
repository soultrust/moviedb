import React, { useState, useEffect, Fragment } from 'react'
import axios from 'axios'

import AddCastMembersForm from './AddCastMembersForm'
import { Link, useHistory } from 'react-router-dom'
import { Button, TextField } from '@material-ui/core'

const ProjectEdit = (props) => {
  const [loaded, setLoaded] = useState(false)
  const [project, setProject] = useState({
    title: ''
  })
  const [existingCast, setExistingCast] = useState([])
  const [castToBeSaved, setCastToBeSaved] = useState([])
  const history = useHistory()
  const projectId = props.match && props.match.params.id

  const extractActors = (projectInclResult) => {
    console.log('projectInclResult: ', projectInclResult)

    // Filter actors
    const actorObjects = projectInclResult.filter(inc => {
      return inc.type === 'role' && inc.attributes.role_type === 'actor'
    })

    // Filter persons
    const personObjects = projectInclResult.filter(inc => {
      return inc.type === 'person'
    })

    const actors = actorObjects.map((actor) => {
      const member = personObjects.find(person => {
        return +actor.attributes.person_id === +person.id
      })
      return {
        person_id: actor.attributes.person_id,
        full_name: member.attributes.full_name,
        character_name: actor.attributes.character_name
      }
    })
    setExistingCast(actors)
  }

  useEffect(() => {
    if (!projectId) {
      setLoaded(true)
      return
    }
    const url = `/api/v1/projects/${projectId}`

    axios.get(url)
      .then(resp => {
        extractActors(resp.data.included)
        setProject(resp.data.data.attributes)
        setLoaded(true)
      })
      .catch(resp => console.log(resp))
  }, [projectId])

  const handleTitleChange = (e) => {
    setProject({
      title: e.target.value
    })
  }

  const saveProject = (e) => {
    e.preventDefault()

    let castPreSave;

    if (castToBeSaved.length) {
      castPreSave = castToBeSaved.map(actor => {
        const {
          person_id, project_id, character_name
        } = actor

        return {
          person_id, project_id, character_name, role_type: 1
        }
      })
    }

    if (projectId) {
      axios
        .put(`/api/v1/projects/${projectId}`, {
          data: {
            attributes: project,
            roles_attributes: castPreSave
          }
        })
        .then(resp => {
          props.projectUpdated(resp.data.data)
          history.push(`/projects/${projectId}`)
        })
        return
      }
      axios
        .post('/api/v1/projects/', {
          data: {
            attributes: project,
            roles_attributes: castPreSave
          }
        })
        .then(resp => {
          props.projectUpdated(resp.data.data)
          history.push(`/projects/${resp.data.data.id}`)
        })
  }

  const handleCastMemberSaved = (actor) => {
    setCastToBeSaved([...castToBeSaved, actor])
  }

  const existingCastList = existingCast.map(member => {
    return <li key={member.person_id + '-' + member.character_name}>{member.full_name} -- {member.character_name}</li>
  })

  const castToSavedList = castToBeSaved.map(member => {
    return <li key={member.person_id + '-' + member.character_name}>{member.full_name} -- {member.character_name}</li>
  })

  return (
    <Fragment>
      { loaded &&
        <Fragment>
          <form onSubmit={saveProject} className="form-project-edit">
            <TextField
              label="Title"
              onChange={handleTitleChange}
              value={project.title}
              className="title"
            /><br />
            <AddCastMembersForm projectId={projectId} onCastMemberSaved={handleCastMemberSaved} />
            <ul>
              {existingCastList}
              {castToSavedList}
            </ul>
            <Button variant="outlined" className="btn-add-title" size="small" type="submit">Update Project</Button>
            <br />
          </form>

          <Link to={`/projects/${projectId}`}>&lt;-- Read-Only View</Link>
        </Fragment>
      }
    </Fragment>
  )
}

export default ProjectEdit