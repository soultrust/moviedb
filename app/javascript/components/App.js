import React from 'react'
import { Route, Switch, Link } from 'react-router-dom'
import Projects from './Projects/Projects'
import Project from './Project/Project'
import ProjectEdit from './ProjectEdit/ProjectEdit'
import Persons from './Persons/Persons'
import { Container, ThemeProvider, Typography } from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles'
import classes from './App.css'

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      'Lato',
      'Arial',
      'sans-serif'
    ].join(','),
  },
})

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Link to="/" className="title">
          <Typography>Soultrust Film Database</Typography>
        </Link>
        <Switch>
          <Route exact path="/" component={Projects} />
          <Route path="/projects/" component={Projects} />
          <Route exact path="/persons" component={Persons} />
          {/* <Route exact path="/persons/:id" component={Person} /> */}
        </Switch>
      </Container>
    </ThemeProvider>
  )
}

export default App