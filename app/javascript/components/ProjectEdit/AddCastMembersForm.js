import React, { Component, Fragment } from 'react'
import axios from 'axios'
import { Button, TextField, Typography } from '@material-ui/core'
import NnAutosuggest from '../Forms/NnAutosuggest'

const getSuggestions = value => {
  return new Promise(resolve => {
    axios.get(`/api/v1/persons?keywords=${value}`)
      .then(resp => !resp || resp.data.error ? resolve([]) : resolve(resp.data.data))
      .catch(resp => console.log(resp))
  })
}
class AddCastMembersForm extends Component {
  constructor() {
    super()
    this.state = {
      value: '',
      suggestions: [],
      role: {
        character_name: '',
        project_id: null,
        person_id: null,
        full_name: ''
      }
    }
  }

  componentDidMount() {
    this.setState({ role: { ...this.state.role, project_id: this.props.projectId } })
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
        full_name: suggestion.attributes.full_name
      })
    }}>
      {suggestion.attributes.full_name}
    </span>
  )

  handleCastMemberSelection = (person) => {
    console.log('handle cast member selected: ', person)
    this.setState({
      role: { ...this.state.role, person_id: person.id },
      full_name: person.full_name
    })
  }

  handleSubmit = () => {
    this.props.onCastMemberSaved(this.state.role)
    console.log('submitted')
    this.setState({
      role: {
        character_name: '',
        project_id: null,
        person_id: null,
        full_name: ''
      }
    })
  }

  handleCharacterNameChange = (e) => {
    this.setState({ role: { ...this.state.role, character_name: e.target.value } })
  }

  getSuggestionValue = (suggestion) => {
    const { full_name } = suggestion.attributes

    this.setState({
      role: { ...this.state.role, person_id: suggestion.id },
      full_name
    })
    return `${full_name}`;
  }

  handleChange = () => (event, { newValue }) => {
    this.setState(state => {
      return {
        role: { ...state.role, full_name: newValue }
      }
    })
  }

  createSuggestionLabel = (suggestion) => {
    return `${suggestion.attributes.full_name}`
  }

  render() {
    return (
      <Fragment>
        <h3>Add Cast Members</h3>
        <div className="add-cast-member">
          <NnAutosuggest
            value={this.state.role.full_name}
            onChange={this.handleChange}
            label="Cast Member"
            onItemSelected={this.handleCastMemberSelection}
            url="/api/v1/persons"
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

export default AddCastMembersForm
