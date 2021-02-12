import React, { useState, useEffect, Fragment } from 'react'
import { Button, TextField, Typography } from '@material-ui/core'
import axios from 'axios'
import { makeStyles } from '@material-ui/core/styles'
// import AddArtistToGroup from './AddArtistToGroup'
// import AddAlbumToGroup from './AddAlbumToGroup'
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
  })

  const editMode = !!props.location.pathname.match(/edit$/)
  const personId = props.match.params.id

  useEffect(() => {
    if (editMode) {
      axios.get(`/api/v1/persons/${groupId}`)
        .then((resp) => {
          console.log(resp.data.data.attributes);
          setPerson(resp.data.data.attributes)
        })
        .catch(resp => console.log(resp))
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    const csrfToken = document.querySelector('[name=csrf-token]').content
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken

    const payload = {
      data: {
        attributes: person
      }
    }

    if (editMode) {
      axios.put(`/api/v1/persons/${personId}`, payload)
        .then(resp => {
          alert('person has been created/edited!')
        })
        .catch(resp => {
          console.log(resp)
        })
      return false
    }
    axios.post('/api/v1/persons', payload)
      .then(resp => {
        props.onGroupUpdated(resp.data.data)
      })
      .catch(resp => console.log(resp))
  }

  const handleNameChange = (e) => {
    setPerson({ full_name: e.target.value })
  }

  return (
    <form onSubmit={handleSubmit} className="form-person-edit">
      <Typography variant="h4">{ editMode ? person.full_name : 'Add a Person' }</Typography><br />
      <TextField label="Name" onChange={handleNameChange} value={person.full_name} /><br /><br />

      {/* <AddArtistToGroup onItemAdded={handleArtistAdded} /><br /><br /> */}

      {/* <AddAlbumToGroup
        onItemAdded={handleAlbumAdded}
        url="/api/v1/albums"
        label="Search for Albums"
      /><br /><br /> */}
      <Button variant="outlined" size="small" type="submit" style={{ display: 'block' }}>
        Add Person
      </Button>
    </form>
  )
}

export default PersonEdit