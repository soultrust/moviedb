import React, { Component, Fragment } from 'react'
import axios from 'axios'
import { Button, TextField, Typography } from '@material-ui/core'
import NnAutosuggest from '../Forms/NnAutosuggest'

const getSuggestions = value => {
  return new Promise(resolve => {
    axios.get(`/api/v1/projects?keywords=${value}`)
      .then(resp => !resp || resp.data.error ? resolve([]) : resolve(resp.data.data))
      .catch(resp => console.log(resp))
  })
}
class AddProjectsSubForm extends Component {
  constructor() {
    super()
    this.state = {
      value: '',
      suggestions: [],
      role: {
        character_name: '',
        project_id: null,
        title: ''
      }
    };
  }

  componentDidMount() {
    // this.setState({ role: { ...this.state.role, project_id: this.props.projectId } })
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    })
  }

  onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await getSuggestions(value)
    this.setState({
      suggestions: suggestions
    })
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  }

  renderSuggestion = suggestion => (
    <span onClick={() => {
      this.handleSelection({
        id: suggestion.id,
        title: suggestion.attributes.title
      })
    }}>
      {suggestion.attributes.title}
    </span>
  )

  handleProjectSelection = (project) => {
    console.log('handle project selected: ', project)
    this.setState({
      role: { ...this.state.role, project_id: project.id },
      title: project.title
    })
  }

  handleSubmit = () => {
    this.props.onProjectAdded(this.state.role);
    this.setState({
      role: {
        character_name: '',
        project_id: null,
        person_id: null,
        title: ''
      }
    });
  }

  handleCharacterNameChange = (e) => {
    this.setState({ role: { ...this.state.role, character_name: e.target.value } })
  }

  getSuggestionValue = (suggestion) => {
    const { title } = suggestion.attributes

    this.setState({
      role: { ...this.state.role, project_id: suggestion.id },
      title
    })
    return `${title}`;
  }

  handleChange = () => (event, { newValue }) => {
    this.setState(state => {
      return {
        role: { ...state.role, title: newValue }
      }
    })
  }

  createSuggestionLabel = (suggestion) => {
    return `${suggestion.attributes.title}`
  }

  render() {
    return (
      <Fragment>
        <h3>Add Projects - As Actor</h3>
        <div className="subform-add-project">
          <NnAutosuggest
            value={this.state.role.title}
            onChange={this.handleChange}
            label="Project"
            onItemSelected={this.handleProjectSelection}
            url="/api/v1/projects"
            getSuggestionValue={this.getSuggestionValue}
            createSuggestionLabel={this.createSuggestionLabel}
          />
          <TextField label="Character Name" onChange={this.handleCharacterNameChange} value={this.state.role.character_name} />
          <Button onClick={this.handleSubmit} variant="outlined" className="btn-add" size="small">Add</Button>
        </div>
      </Fragment>
    )
  }
}

export default AddProjectsSubForm;
