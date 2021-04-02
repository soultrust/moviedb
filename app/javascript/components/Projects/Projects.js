import React, { useState, useEffect } from 'react'
import { Route, Switch, Link } from 'react-router-dom'
import axios from 'axios'

import Project from '../Project/Project'
import ProjectEdit from '../ProjectEdit/ProjectEdit'
import ProjectList from '../ProjectList/ProjectList'
import Nav from '../Nav/Nav'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [updatedProjectId, setUpdatedProjectId] = useState('')

  useEffect(() => {
    axios.get('/api/v1/projects')
      .then((resp) => {
        setProjects(resp.data.data)
      })
      .catch(resp => console.log(resp))
  }, [projects.length])

  const list = projects.map(item => {
    return (
      <li key={item.id} className={item.id === updatedProjectId ? 'line-item-highlight':null}>
        <Link to={`/projects/${item.id}`}>{item.attributes.title}</Link>
      </li>
    )
  })

  const handleProjectUpdated = (project) => {
    setUpdatedProjectId(project.id)
    const index = projects.findIndex(proj => proj.id === project.id)

    if (index > -1) {
      const projectsClone = projects.slice()
      projectsClone.splice(index, 1, project)
      setProjects(projectsClone)
    } else {
      // Couldn't find index, therefore must be
      // a new project. Add to top of "Recently Saved Projects"
      setProjects([project, ...projects])
    }
  }

  return (
    <div className="layout-2-col">
      <div className="list-container">
        <Nav />
        <h3>Recently Saved Projects</h3>
        <ProjectList projects={projects} updatedProjectId={updatedProjectId} />
      </div>
      <div className="record-detail">
      <Switch>
        <ProjectEdit exact path="/" projectUpdated={handleProjectUpdated} />
        <Route exact path="/projects/:id" component={Project} />
        <Route exact
          path="/projects/:id/edit"
          render={routeProps => <ProjectEdit {...routeProps} projectUpdated={handleProjectUpdated} />}
        />
      </Switch>
      </div>
    </div>
  )
}

export default Projects