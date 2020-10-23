import React, { Component, Fragment } from 'react'
import axios from 'axios'
import AddProjectMembersForm from './AddProjectMembersForm'

class Project extends Component {
  state = {
    project: null
  }

  componentDidMount() {
    const projectId = this.props.match.params.id
    const url = `/api/v1/projects/${projectId}`

    axios.get(url)
      .then(resp => {
        this.setState({ project: resp.data.data })
      })
      .catch(resp => console.log(resp))
  }

  render() {
    return (
      <Fragment>
        { this.state.project &&
          <Fragment>
            <div>
              <h1>{this.state.project.attributes.title}</h1>
              <a href={`/projects/${this.state.project.id}`}>&lt;-- Read-Only View</a>
            </div>
            <AddProjectMembersForm />
          </Fragment>
        }
      </Fragment>
    )
  }
}

export default Project