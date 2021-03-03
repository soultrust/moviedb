import React, { useState, useEffect, Fragment } from 'react'
import { Button, TextField, Typography } from '@material-ui/core'
import axios from 'axios'
import { makeStyles } from '@material-ui/core/styles'
import AddProjectsSubForm from './AddProjectsSubForm';
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}))

const PersonEdit = (props) => {
  const history = useHistory()
  const [person, setPerson] = useState({
    full_name: '',
    notes: null
  });
  const [projectsToBeSaved, setProjectsToBeSaved] = useState([]);
  const personId = props.match.params.id

  useEffect(() => {
    if (personId) {
      axios.get(`/api/v1/persons/${personId}`)
        .then((resp) => {
          console.log(resp.data.data.attributes);
          setPerson(resp.data.data.attributes)
        })
        .catch(resp => console.log(resp))
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault()

    const csrfToken = document.querySelector('[name=csrf-token]').content
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

    const projectsToSave = projectsToBeSaved.map(project => {
      const { character_name, project_id, role_type } = project;
      return { character_name, project_id, role_type };
    })

    const payload = {
      data: {
        attributes: person,
        roles_attributes: projectsToSave
      }
    }

    if (personId) {
      axios.put(`/api/v1/persons/${personId}`, payload)
        .then(resp => {
          props.onPersonUpdated(resp.data.data);
          history.push(`/persons/${personId}`);
        })
        .catch(resp => {
          console.log(resp)
        })
      return false
    }
    axios.post('/api/v1/persons', payload)
      .then(resp => {
        props.onPersonUpdated(resp.data.data);
        history.push(`/persons/${personId}`);
      })
      .catch(resp => console.log(resp));
  }

  const handleNameChange = (e) => {
    setPerson({ full_name: e.target.value });
  }

  const handleProjectAdded = (role) => {
    console.log(role)
    setProjectsToBeSaved([...projectsToBeSaved, role]);
  }

  const projectsToSaveList = projectsToBeSaved.map(project => {
    return (
      <li key={project.person_id + '-' + project.character_name}>
        <span>{project.title}</span>
        <span>{project.character_name}</span>
        <Button variant="outlined" className="btn-add-title" size="small">X</Button>
      </li>
    )
  });

  return (
    <form onSubmit={handleSubmit} className="form-person-edit">
      <Typography variant="h4">{ personId ? person.full_name : 'Add a Person' }</Typography><br />
      <TextField label="Name" onChange={handleNameChange} value={person.full_name} /><br /><br />
      <AddProjectsSubForm onProjectAdded={handleProjectAdded} />
      <ul className="cast-list">
        {projectsToSaveList}
      </ul>
      <Button variant="outlined" size="small" type="submit" style={{ display: 'block' }}>
        Add Person
      </Button>
    </form>
  )
}

export default PersonEdit