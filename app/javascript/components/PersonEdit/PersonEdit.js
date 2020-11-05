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

const GroupEdit = (props) => {
  const classes = useStyles()
  const history = useHistory()
  const [group, setGroup] = useState({
    attributes: {
      name: '',
      notes: null
    }
  })

  const [artists, setArtists] = useState([])
  const [albums, setAlbums] = useState([])
  const editMode = !!props.location.pathname.match(/edit$/)
  const groupId = props.match.params.id

  const separateAlbumsAndArtists = (included) => {
    const albums = []
    const artists = []

    included.forEach(record => {
      if (record.type === 'artist') {
        artists.push(record)
      } else {
        albums.push(record)
      }
    })
    setAlbums(albums)
    setArtists(artists)
  }

  useEffect(() => {
    if (editMode) {
      axios.get(`/api/v1/groups/${groupId}`)
        .then((resp) => {
          separateAlbumsAndArtists(resp.data.included)

          setGroup(resp.data.data)
        })
        .catch(resp => console.log(resp))
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    const csrfToken = document.querySelector('[name=csrf-token]').content
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken

    const payload = {
      group: {
        ...group,
        roles_attributes: artists.map(artist => {
          return { artist_id: artist.id }
        }),
        album_ids: albums.map(album => album.id) // title removed
      }
    }

    if (editMode) {
      axios.put(`/api/v1/groups/${groupId}`, payload)
        .then(resp => {
          props.onGroupUpdated(resp.data.data)
        })
        .catch(resp => {
          console.log(resp)
        })
      return false
    }
    axios.post('/api/v1/groups', payload)
      .then(resp => {
        props.onGroupUpdated(resp.data.data)
      })
      .catch(resp => console.log(resp))
  }

  const handleNameChange = (e) => {
    setGroup({ attributes: { ...group.attributes, name: e.target.value } })
  }

  const handleDateChange = (date) => {
    setGroup({ ...group, release_date: date })
  }

  const handleReleaseDateAccuracyChange = (e) => {
    setGroup({ ...group, release_date_accuracy: e.target.value })
  }

  const handleArtistAdded = (addedArtist) => {
    setArtists([...artists, addedArtist])
  }

  const artistList = artists.map(artist => {
    return <li key={artist.id}>{artist.attributes.first_name} {artist.attributes.last_name}</li>
  })

  const handleAlbumAdded = (addedAlbum) => {
    setAlbums([...albums, addedAlbum])
  }

  const albumList = albums.map(album => {
    return <li key={album.id}>{album.attributes.title}</li>
  })

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h4">{ editMode ? group.attributes.name : 'Add a Person' }</Typography><br />
      <TextField label="First Name" onChange={handleNameChange} value={group.attributes.name} /><br /><br />
      <Typography variant="h6">Groups</Typography>
      <ul className="generic">
        {artistList}
      </ul>
      {/* <AddArtistToGroup onItemAdded={handleArtistAdded} /><br /><br /> */}

      {/* <AddAlbumToGroup
        onItemAdded={handleAlbumAdded}
        url="/api/v1/albums"
        label="Search for Albums"
      /><br /><br /> */}
      <Button variant="outlined" size="small" type="submit" style={{ display: 'block' }}>
        Add Group
      </Button>
    </form>
  )
}

export default GroupEdit