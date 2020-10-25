import React, { useState, useEffect, Fragment } from 'react'
import axios from 'axios'
import AddCastMembersForm from './AddCastMembersForm'

const Project = (props) => {
  const [project, setProject] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [cast, setCast] = useState([])

  const extractActors = (projectResult) => {
    const actorObjects = projectResult.filter(inc => {
      return inc.type === 'role' && inc.attributes.role_type === 'actor'
    })
    const persons = projectResult.filter(inc => {
      return inc.type === 'person'
    })
    const actors = actorObjects.map(actor => {
      const person = persons.find(p => {
        return +p.id === actor.attributes.person_id
      })
      return {
        id: person.id,
        first_name: person.attributes.first_name,
        last_name: person.attributes.last_name,
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
          <h1>{project.data.attributes.title}</h1>
          <a href={`/projects/${project.data.id}/edit`}>edit</a>
          <h2>Cast</h2>
          <ul>
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