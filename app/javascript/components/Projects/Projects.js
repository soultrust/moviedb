import React, { useContext, useState, useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import axios from 'axios'

import Project from '../Project/Project'
import ProjectEdit from '../ProjectEdit/ProjectEdit'
import ProjectList from '../ProjectList/ProjectList'
import Nav from '../Nav/Nav'
import { AppContext } from '../AppContext';

const Projects = (props) => {
  const [global] = useContext(AppContext);
  const [projects, setProjects] = useState([]);
  const [updatedProjectId, setUpdatedProjectId] = useState('');
  let firstProjectId;

  useEffect(() => {
    axios.get('/api/v1/projects')
      .then((resp) => {
        setProjects(resp.data.data);
        if (!global.isAuthenticated) {
          const randomNum = Math.floor((Math.random() * 10) + 1);
          firstProjectId = resp.data.data[randomNum].id;
          props.history.push(`/projects/${firstProjectId}`);
        }
      })
      .catch(resp => console.log(resp))
  }, []);

  const handleProjectUpdated = (project) => {
    setUpdatedProjectId(project.id)
    const index = projects.findIndex(proj => proj.id === project.id)

    if (index > -1) {
      const projectsClone = projects.slice();
      projectsClone.splice(index, 1, project);
      setProjects(projectsClone);
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

        { global.isAuthenticated ?
          <Switch>
            <Route exact path="/" render={() => <ProjectEdit projectUpdated={handleProjectUpdated} />} />
            <Route exact
              path="/projects/:id/edit"
              render={routeProps => <ProjectEdit {...routeProps} projectUpdated={handleProjectUpdated} />} />
            <Route><div>404 Not Found</div></Route>
          </Switch>
          :
          <Switch>
            <Route exact path="/" render={routeProps => <Project {...routeProps} />} />
            <Route path="/projects/:id" component={Project} />
            <Route><div>404 Not Found</div></Route>
          </Switch>
        }

      </div>
    </div>
  )
}

export default Projects