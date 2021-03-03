import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'

const Person = (props) => {
  const personId = props.match.params.id
  const [person, setPerson] = useState({
    attributes: {
      full_name: ''
    }
  })
  const [projects, setProjects] = useState([]);

  const sortIncluded = (personInclResult) => {
    const projs = [];

    personInclResult.forEach(inc => {
      if (inc.type === 'project') {
        const obj = {
          id: inc.id,
          attributes: inc.attributes
        };
        projs.push(obj)
      }
    });
    setProjects([...projects, ...projs]);
  }

  useEffect(() => {
    axios.get(`/api/v1/persons/${personId}`)
      .then((resp) => {
        console.log('load: ', resp.data)
        setPerson(resp.data.data.attributes);
        sortIncluded(resp.data.included);
      })
      .catch(resp => console.log(resp))
  }, [props.match.params.id])

  const projectList = projects.map(proj => {
    return <li key={proj.id}>{proj.attributes.title}</li>
  })

  return (
    <div>
      <Typography variant="h4">{person.full_name}</Typography><br />
      {projectList}
      <Link to={`/persons/${personId}/edit`}>edit</Link>
    </div>
  )
}

export default Person