import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'

const Person = (props) => {
  const personId = props.match.params.id
  const [person, setPerson] = useState({
    attributes: {
      name: ''
    }
  })
  const [artists, setArtists] = useState([])
  const [albums, setAlbums] = useState([])


  useEffect(() => {
    axios.get(`/api/v1/persons/${personId}`)
      .then((resp) => {
        console.log(resp.data.data)
        setPerson(resp.data.data.attributes)
      })
      .catch(resp => console.log(resp))
  }, [props.match.params.id])

  const artistList = artists.map(artist => {
    return <li key={artist.id}>{artist.attributes.full_name}</li>
  })

  const albumList = albums.map(album => {
    return <li key={album.id}>{album.attributes.title}</li>
  })

  return (
    <div>
      <Typography variant="h4">{person.full_name}</Typography><br />


      <Link to={`/persons/${personId}/edit`}>edit</Link>
    </div>
  )
}

export default Person