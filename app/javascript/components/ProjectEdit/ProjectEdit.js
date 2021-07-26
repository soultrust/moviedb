import React, { useState, useEffect, useContext, Fragment } from 'react';
import axios from 'axios';

import AddCastMembersForm from './AddCastMembersForm';
import { Link, useHistory } from 'react-router-dom';
import { Button, TextField } from '@material-ui/core';
import AppContext from '../AppContext';
import classes from './ProjectEdit.module.css';

const ProjectEdit = (props) => {
  const [loaded, setLoaded] = useState(false);
  const [project, setProject] = useState({
    title: ''
  });
  const [existingCast, setExistingCast] = useState([]);
  const [castToBeSaved, setCastToBeSaved] = useState([]);
  const [castToBeDeleted, setCastToBeDeleted] = useState([]);
  const appCtx = useContext(AppContext);
  // const isLoggedIn = appContext.isLoggedIn;

  const history = useHistory();
  const projectId = props.match && props.match.params.id;

  const extractActors = (projectInclResult) => {
    // Filter actors
    const actorObjects = projectInclResult.filter(inc => {
      return inc.type === 'role' && inc.attributes.role_type === 'actor';
    });
    // Filter persons
    const personObjects = projectInclResult.filter(inc => {
      return inc.type === 'person';
    });
    const actors = actorObjects.map((actor) => {
      const member = personObjects.find(person => {
        return +actor.attributes.person_id === +person.id;
      });
      return {
        role_id: actor.id,
        person_id: actor.attributes.person_id,
        full_name: member.attributes.full_name,
        character_name: actor.attributes.character_name
      }
    });
    setExistingCast(actors);
  }

  useEffect(() => {
    if (!projectId) {
      setLoaded(true);
      return;
    }
    const url = `/api/v1/projects/${projectId}`;

    axios.get(url)
      .then(resp => {
        extractActors(resp.data.included);
        setProject(resp.data.data.attributes);
        setLoaded(true);
      })
      .catch(resp => console.log(resp));
  }, [projectId]);

  const handleTitleChange = (e) => {
    setProject({
      title: e.target.value
    })
  }

  const saveProject = (e) => {
    e.preventDefault();

    let castPreSave;

    if (castToBeSaved.length) {
      castPreSave = castToBeSaved.map(actor => {
        const {
          person_id, project_id, character_name
        } = actor;

        return {
          person_id, project_id, character_name, role_type: 1
        }
      })
    }

    if (castToBeDeleted.length) {
      axios
        .delete(`/api/v1/roles/${castToBeDeleted.join(',')}`)
        .then(resp => {
          console.log(resp);
        })
    }

    // Updating existing project
    if (projectId) {
      axios
        .put(`/api/v1/projects/${projectId}`, {
          data: {
            attributes: project,
            roles_attributes: castPreSave
          }
        })
        .then(resp => {
          props.projectUpdated(resp.data.data);
          history.push(`/projects/${projectId}`);
        });
      return;
    }

    // Creating new project
    axios
      .post('/api/v1/projects/',
        {
          data: {
            attributes: project,
            roles_attributes: castPreSave
          }
        },
        {
          headers: {
            Authorization: `Bearer ${appCtx.token}`
          }
        }
      )
      .then(resp => {
        props.projectUpdated(resp.data.data);
        history.push(`/projects/${resp.data.data.id}`);
      })
  }

  const handleCastMemberSaved = (actor) => {
    setCastToBeSaved([...castToBeSaved, actor]);
  }

  const removeFromList = (roleId, list) => {
    console.log(roleId, list)
    if (list === 'existing') {
      const castToBeDeletedNew = castToBeDeleted.concat(roleId);
      setCastToBeDeleted(castToBeDeletedNew);

      const existingCastNew = existingCast.filter(actor => {
        console.log(actor);
        return roleId !== actor.role_id;
      });

      setExistingCast(existingCastNew);
    }
  }

  const removeFromExistingCastList = (roleId) => removeFromList(roleId, 'existing');

  const existingCastList = existingCast.map(member => {
    return (
      <li key={member.person_id + '-' + member.character_name}>
        <span>{member.full_name}</span>
        <span>{member.character_name}</span>
        <Button
          variant="outlined"
          className="btn-add-title"
          size="small"
          onClick={() => removeFromExistingCastList(member.role_id)}>
            X
        </Button>
      </li>
    )
  })

  const castToSavedList = castToBeSaved.map(member => {
    return (
      <li key={member.person_id + '-' + member.character_name}>
        <span>{member.full_name}</span>
        <span>{member.character_name}</span>
        <Button variant="outlined" className="btn-add-title" size="small">X</Button>
      </li>
    )
  })

  return (
    <Fragment>
      { loaded &&
        <Fragment>
          <h2>Add a Project Record</h2>
          <form onSubmit={saveProject} className="form-project-edit">
            <TextField
              label="Title"
              onChange={handleTitleChange}
              value={project.title}
              className={`${classes['field-title']} field-title`}
            /><br />
            <AddCastMembersForm projectId={projectId} onCastMemberSaved={handleCastMemberSaved} />
            <ul className="cast-list">
              {existingCastList}
              {castToSavedList}
            </ul>
            <Button variant="outlined" className="btn-add-title" size="small" type="submit">Update Project</Button>
            <br />
          </form>

          <Link to={`/projects/${projectId}`}>&lt;-- Read-Only View</Link>
        </Fragment>
      }
    </Fragment>
  )
}

export default ProjectEdit