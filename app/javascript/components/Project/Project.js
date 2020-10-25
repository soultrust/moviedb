import React, { useState, useEffect, Fragment } from 'react'
import axios from 'axios'
import AddCastMembersForm from './AddCastMembersForm'
import { Typography } from '@material-ui/core'
import classes from './Project.css'

const Project = (props) => {
  const [project, setProject] = useState({})
  const [loaded, setLoaded] = useState(false)
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
        first_name: member.attributes.first_name,
        last_name: member.attributes.last_name,
        character_name: actor.attributes.character_name
      }
    })
    setCast(actors)
  }

  useEffect(() => {
    const projectId = props.match.params.id
    const url = `/api/v1/projects/${projectId}`

    axios.get(url)
      .then(resp => {
        extractActors(resp.data.included)
        setProject(resp.data)
        setLoaded(true)
      })
      .catch(resp => console.log(resp))
  }, [])

  const handleCastMemberSaved = (actor) => {
    setCast([...cast, actor])
  }

  return (
    <Fragment>
      {
        loaded &&
        <div>
          <Typography variant="h4">{project.data.attributes.title}</Typography><br /><br />
          <a href={`/projects/${project.data.id}/edit`} style={{display: 'none'}}>edit</a>
          <Typography variant="h5">Cast</Typography>
          <ul class="generic">
            {cast.map(actor => {
              return (
                <li key={actor.id}>
                  {actor.first_name} {actor.last_name}: {actor.character_name}
                </li>
              )
            })}
          </ul>
          <AddCastMembersForm projectId={project.data.id} onCastMemberSaved={handleCastMemberSaved} />
        </div>
      }
    </Fragment>
  )
}

export default Project