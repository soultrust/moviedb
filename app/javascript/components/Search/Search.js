import React from 'react';
import NnAutosuggest from '../Forms/NnAutosuggest'

const Search = () => {
  return (
    <NnAutosuggest
      value={this.state.role.full_name}
      onChange={this.handleChange}
      label="Cast Member"
      onItemSelected={this.handleCastMemberSelection}
      url="/api/v1/persons"
      getSuggestionValue={this.getSuggestionValue}
      createSuggestionLabel={this.createSuggestionLabel}
    />
  )
}

export default Search;