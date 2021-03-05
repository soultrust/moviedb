import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { sortIncluded } from '../Helpers';

const Person = (props) => {
  const personId = props.match.params.id
  const [person, setPerson] = useState({
    attributes: {
      full_name: ''
    }
  })
  const [actingProjects, setActingProjects] = useState([]);
  const [crewProjects, setCrewProjects] = useState([]);

  useEffect(() => {
    axios.get(`/api/v1/persons/${personId}`)
      .then((resp) => {
        setPerson(resp.data.data.attributes);
        const { actingProjectsTemp, crewProjectsTemp } = sortIncluded(resp.data.included);
        setActingProjects([...actingProjects, ...actingProjectsTemp]);
        setCrewProjects([...crewProjects, ...crewProjectsTemp]);
      })
      .catch(resp => console.log(resp));

    return () => {
      setActingProjects(prevProjs => {
        prevProjs.length = 0;
        return prevProjs;
      });
      setCrewProjects(prevProjs => {
        prevProjs.length = 0;
        return prevProjs;
      });
    }
  }, [props.match.params.id]);

  const actingList = actingProjects.map(proj => {
    return <li key={proj.id}>{proj.title} - {proj.characterName}</li>
  });

  const crewList = crewProjects.map(proj => {
    return <li key={proj.id}>{proj.title} - {proj.roleType}</li>
  });

  return (
    <div>
      <Typography variant="h4">{person.full_name}</Typography><br />
      { !!actingList.length &&
        <h3>Projects as Actor</h3>
      }
      {actingList}

      { !!crewList.length &&
        <h3>Projects as Crew</h3>
      }
      {crewList}
      <Link to={`/persons/${personId}/edit`}>edit</Link>
    </div>
  )
}

export default Person