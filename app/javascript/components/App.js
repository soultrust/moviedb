import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Projects from './Projects/Projects'
import Project from './Project/Project'

const App = () => {
  return (
    <Switch>
      <Route exact path="/" component={Projects} />
      <Route exact path="/projects/:id" component={Project} />
    </Switch>
  )
}

export default App