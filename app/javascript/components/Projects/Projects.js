import React from 'react'
import { Route, Switch } from 'react-router-dom'
import ProjectNew from '../ProjectNew/ProjectNew'
import Project from '../Project/Project'
import ProjectEdit from '../ProjectEdit/ProjectEdit'
import ProjectList from '../ProjectList/ProjectList'
import { Typography } from '@material-ui/core'

const Projects = () => {
  return (

    <div className="layout-2-col">
        <div className="list-container">
          <Typography variant="h5" className="section-title">Recently Saved</Typography>
          <ProjectList />
        </div>
        <div className="record-detail">
        <Switch>
          <Route exact path="/" component={ProjectEdit} />
          <Route exact path="/projects/:id" component={Project} />
          <Route exact path="/projects/:id/edit" component={ProjectEdit} />
        </Switch>
        </div>
      </div>

  )
}

export default Projects