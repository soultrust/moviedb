import React, { useState, useEffect, Fragment } from 'react'
import axios from 'axios'
import AddCastMembersForm from '../Project/AddCastMembersForm'
import { Link } from 'react-router-dom'
import { Button, TextField } from '@material-ui/core'

const ProjectEdit = (props) => {
  const [loaded, setLoaded] = useState(false)
  console.log('props: ', props)
  const projectId = props.match.params.id
  const [project, setProject] = useState({
    title: ''
  })
  const [cast, setCast] = useState([])

  const extractActors = (projectInclResult) => {

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
        id: actor.id,
        full_name: member.attributes.full_name,
        character_name: actor.attributes.character_name
      }
    })
    setCast(actors)
  }

  useEffect(() => {
    const url = `/api/v1/projects/${projectId}`

    axios.get(url)
      .then(resp => {
        console.log(resp.data.data)
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

  const handleCastMemberSaved = (actor) => {
    console.log('handleCastMemberSaved: ', actor);
    setCast([...cast, actor])
  }

  const castList = cast.map(member => {
    return <li key={member.id}>{member.full_name} -- {member.character_name}</li>
  })

  return (
    <Fragment>
      { loaded &&
        <Fragment>
          <form onSubmit={saveTitle} className="form-project-edit">
            <TextField
              label="Title"
              onChange={handleTitleChange}
            value={project.title}
              className="title"
            /><br />
            <Button variant="outlined" className="btn-add-title" size="small" type="submit">Add Title</Button>
          </form>
          <AddCastMembersForm projectId={projectId} onCastMemberSaved={handleCastMemberSaved} />
          <ul>
            {castList}
          </ul>
          <Link to={`/projects/${projectId}`}>&lt;-- Read-Only View</Link>
        </Fragment>
      }
    </Fragment>
  )
}

export default ProjectEdit