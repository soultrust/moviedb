import React, { Fragment, useState, useEffect } from 'react'
import { Route, Switch, useHistory } from 'react-router-dom'
import axios from 'axios'
import PersonEdit from '../PersonEdit/PersonEdit'
import PersonList from '../PersonList/PersonList'
import Person from '../Person/Person'

const Persons = () => {
  const [persons, setPersons] = useState([]);
  const history = useHistory();

  useEffect(() => {
    axios.get('/api/v1/persons')
      .then(resp => {
        setPersons(resp.data.data)
      })
      .catch(resp => console.log(resp))
  }, []);

  const updatePersons = (updatedPerson) => {
    const updatedPersonIndex = persons.findIndex(person => person.id === updatedPerson.id)

    if (updatedPersonIndex > -1) {
      setPersons(prevPersons => {
        const personListClone = prevPersons.slice()
        personListClone[updatedPersonIndex].attributes = {
          ...personListClone[updatedPersonIndex].attributes,
          ...updatedPerson.attributes
        }
        return personListClone
      })
      history.push(`/persons/${updatedPerson.id}`)
      return false
    }
    setPersons([updatedPerson, ...persons])
    history.push(`/persons/${updatedPerson.id}`)
  }

  return (
    <Fragment>
      <div className="list-container">
        <h3>Recently Saved</h3>
        <PersonList persons={persons} />
      </div>
      <main className="main-panel">
        <Switch>
          <Route exact path="/persons" component={props => <PersonEdit {...props} onPersonUpdated={updatePersons} />} />
          <Route exact path="/persons/:id/edit" render={props => <PersonEdit {...props} onPersonUpdated={updatePersons} />} />
          <Route exact path="/persons/:id" render={routeProps => <Person {...routeProps} />} />
        </Switch>
      </main>
    </Fragment>
  )
}

export default Persons