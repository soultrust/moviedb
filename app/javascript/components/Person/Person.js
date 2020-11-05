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

  // const extractArtists = (included) => {
  //   return included.filter(record => {
  //     return record.type === 'artist'
  //   })
  // }

  // const separateAlbumsAndArtists = (included) => {
  //   const albums = []
  //   const artists = []

  //   included.forEach(record => {
  //     if (record.type === 'artist') {
  //       artists.push(record)
  //     } else {
  //       albums.push(record)
  //     }
  //   })
  //   setAlbums(albums)
  //   setArtists(artists)
  // }

  useEffect(() => {
    axios.get(`/api/v1/persons/${personId}`)
      .then((resp) => {
        // separateAlbumsAndArtists(resp.data.included)
        setPerson(resp.data.data)
      })
      .catch(resp => console.log(resp))
  }, [props.match.params.id])

  const artistList = artists.map(artist => {
    return <li key={artist.id}>{artist.attributes.first_name} {artist.attributes.last_name}</li>
  })

  const albumList = albums.map(album => {
    return <li key={album.id}>{album.attributes.title}</li>
  })

  return (
    <div>
      <Typography variant="h4">{person.attributes.first_name} {person.attributes.last_name}</Typography><br />
      <Typography variant="h6">Members</Typography>
      <ul className="generic">
        {artistList}
      </ul>
      <Typography variant="h6">Albums</Typography>
      <ul className="generic">
        {albumList}
      </ul>
      <Link to={`/persons/${personId}/edit`}>edit</Link>
    </div>
  )
}

export default Person