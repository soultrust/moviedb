import React, { Component, Fragment } from 'react';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import classes from '../PersonEdit/AddProjectsSubForm.css';

class AddProjectsSubForm extends Component {
  constructor() {
    super()
    this.state = {
      value: '',
      suggestions: [],
      selectedText: ''
    };
  }

  handleProjectSelection = (project) => {
    console.log('handle project selected: ', project)
    this.setState({
      role: { ...this.state.role, project_id: project.id },
      title: project.title
    })
  }

  getSuggestionValue = (suggestion) => {
    const selectedText = suggestion.attributes.title || suggestion.attributes.full_name;
    this.setState({ selectedText });
    return selectedText;
  }

  handleChange = () => (event, { newValue }) => {
    this.setState({ selectedText: newValue });
  }

  createSuggestionLabel = (suggestion) => {
    return `${suggestion.attributes.title || suggestion.attributes.full_name}`
  }

  render() {
    return (
      <Fragment>
        <h3>Add Projects</h3>
        <div className="add-project-subform">
          <div className="form-section">
            <NnAutosuggestGroups
              value={this.state.selectedText}
              onChange={this.handleChange}
              label="Search projects and people"
              onItemSelected={this.handleProjectSelection}
              urls={['/api/v1/projects', '/api/v1/persons']}
              getSuggestionValue={this.getSuggestionValue}
              createSuggestionLabel={this.createSuggestionLabel}
            />
          </div>
        </div>
      </Fragment>
    )
  }
}

export default AddProjectsSubForm;
