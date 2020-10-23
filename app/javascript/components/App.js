import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Projects from './Projects/Projects'
import Project from './Project/Project'
import ProjectEdit from './ProjectEdit/ProjectEdit'
import Persons from './Persons/Persons'

const App = () => {
  return (
    <Switch>
      <Route exact path="/" component={Projects} />
      <Route exact path="/projects/:id/edit" component={ProjectEdit} />
      <Route exact path="/projects/:id" component={Project} />
      <Route exact path="/persons" component={Persons} />
      {/* <Route exact path="/persons/:id" component={Person} /> */}
    </Switch>
  )
}

export default App