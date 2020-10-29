import React, { Component, Fragment } from 'react'
import axios from 'axios'
import AddCastMembersForm from '../Project/AddCastMembersForm'

class ProjectNew extends Component {
  state = {
    project: null,
    loaded: false,
    cast: []
  }

  componentDidMount() {
    const projectId = this.props.match.params.id
    const url = `/api/v1/projects/${projectId}`

    axios.get(url)
      .then(resp => {
        this.setState({ project: resp.data })
        extractActors(resp.data.included)
      })
      .catch(resp => console.log(resp))

    console.log('props: ', this.props)
  }

  extractActors = (projectResult) => {
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

  render() {
    return (
      <Fragment>
        { this.state.project &&
          <Fragment>
            <div>
              <h1>{this.state.project.data.attributes.title}</h1>
              <a href={`/projects/${this.state.project.data.id}`}>&lt;-- Read-Only View</a>
            </div>
            <AddCastMembersForm projectId={this.state.project.data.id} />
          </Fragment>
        }
      </Fragment>
    )
  }
}

export default Project