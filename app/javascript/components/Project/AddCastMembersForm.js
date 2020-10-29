import React, { Component, Fragment } from 'react'
import axios from 'axios'
import { Button, TextField, Typography } from '@material-ui/core'
import IntegrationAutosuggest from './IntegrationAutosuggest'

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
        role_type: 1
      },
      first_name: null,
      last_name: null
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
        first_name: suggestion.attributes.first_name,
        last_name: suggestion.attributes.last_name
      })
    }}>
      {suggestion.attributes.first_name} {suggestion.attributes.last_name}
    </span>
  )

  handleCastMemberSelection = (person) => {
    console.log('handle cast member selected: ', person)
    this.setState({
      role: { ...this.state.role, person_id: person.id },
      first_name: person.first_name,
      last_name: person.last_name
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()

    const csrfToken = document.querySelector('[name=csrf-token]').content
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken

    axios.post('/api/v1/roles', this.state.role)
      .then(resp => {
        const { id, attributes } = resp.data.data;
        console.log(resp.data.data)
        const memberObj = {
          id,
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          character_name: attributes.character_name
        }
        this.props.onCastMemberSaved(memberObj)
        this.setState({
          role: { ...this.state.role, character_name: '' }
        })
        document.dispatchEvent(new Event('memberAddedToProject'))
      })
      .catch(resp => console.log(resp))
  }

  handleCharacterNameChange = (e) => {
    this.setState({ role: { ...this.state.role, character_name: e.target.value } })
  }

  getSuggestionValue = (suggestion) => {
    const { first_name, last_name } = suggestion.attributes

    this.setState({
      role: { ...this.state.role, person_id: suggestion.id },
      first_name,
      last_name
    })
    return `${first_name} ${last_name}`;
  }

  render() {
    return (
      <Fragment>
        <form onSubmit={this.handleSubmit}>
          <IntegrationAutosuggest onItemSelected={this.handleCastMemberSelection} url="/api/v1/persons" getSuggestionValue={this.getSuggestionValue} />
          <TextField label="Character Name" onChange={this.handleCharacterNameChange} value={this.state.role.character_name} />
          <Button variant="outlined" size="small" type="submit">Add</Button>
        </form>
      </Fragment>
    )
  }
}

export default AddCastMembersForm
