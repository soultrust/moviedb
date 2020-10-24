import React, { Component, Fragment } from 'react'
import Autosuggest from 'react-autosuggest'
import axios from 'axios'

const getSuggestions = value => {
  return new Promise(resolve => {
    axios.get(`/api/v1/persons?keywords=${value}`)
      .then(resp => !resp || resp.data.error ? resolve([]) : resolve(resp.data.data))
      .catch(resp => console.log(resp))
  })
}

const getSuggestionValue = suggestion => `${suggestion.attributes.first_name} ${suggestion.attributes.last_name}`;

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
      }
    }
  }

  componentDidMount() {
    this.setState({ role: { ...this.state.role, project_id: this.props.projectId } })
  }

  onChange = (event, { newValue }) => {
    console.log('new value: ', newValue)
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
    <span onClick={() => { this.handleSelection(suggestion.id) }}>
      {suggestion.attributes.first_name} {suggestion.attributes.last_name}
    </span>
  )

  handleSelection = (personId) => {
    this.setState({ role: { ...this.state.role, person_id: personId } })
  }

  handleSubmit = (e) => {
    e.preventDefault()

    axios.post('/api/v1/roles', this.state.role)
      .then(resp => console.log('role save: ', resp))
      .catch(resp => console.log(resp))
  }

  handleCharacterNameChange = (e) => {
    this.setState({ role: { ...this.state.role, character_name: e.target.value } })
  }

  render() {
    const { value, suggestions } = this.state
    const inputProps = {
      placeholder: 'Search for members',
      value,
      onChange: this.onChange
    }

    return (
      <Fragment>
        <h2>Add Cast Members</h2>
        <form onSubmit={this.handleSubmit}>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={this.renderSuggestion}
            inputProps={inputProps}
          />
          <input type="text" onChange={this.handleCharacterNameChange} value={this.state.role.character_name} />
          <button type="submit">Add</button>
        </form>
      </Fragment>
    )
  }
}

export default AddCastMembersForm
