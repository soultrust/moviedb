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
  const [actingProjects, setActingProjects] = useState([]);
  const [crewProjects, setCrewProjects] = useState([]);

  const sortIncluded = (personInclResult) => {
    const projs = [];
    const roles = [];
    const actingProjectsTemp = [];
    const crewProjectsTemp = [];

    personInclResult.forEach(inc => {
      if (inc.type === 'project') {
        const obj = {
          id: inc.id,
          attributes: inc.attributes
        };
        projs.push(obj);
      } else if (inc.type === 'role') {
        const obj = {
          id: inc.id,
          projId: inc.attributes.project_id,
          roleType: inc.attributes.role_type,
          characterName: inc.attributes.character_name
        };
        roles.push(obj);
      }
    });

    projs.forEach(proj => {
      roles.forEach(role => {
        if (+proj.id === role.projId) {
          if (role.roleType === 'actor') {
            const obj = {
              id: proj.id,
              title: proj.attributes.title,
              characterName: role.characterName
            };
            actingProjectsTemp.push(obj);
          } else if (role.roleType === 'director') {
            const obj = {
              id: proj.id,
              title: proj.attributes.title,
              roleType: role.roleType
            };
            crewProjectsTemp.push(obj);
          }
        }
      });
    });

    setActingProjects([...actingProjects, ...actingProjectsTemp]);
    setCrewProjects([...crewProjects, ...crewProjectsTemp]);
  }

  useEffect(() => {
    axios.get(`/api/v1/persons/${personId}`)
      .then((resp) => {
        setPerson(resp.data.data.attributes);
        sortIncluded(resp.data.included);
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
  }, [props.match.params.id])

  const actingList = actingProjects.map(proj => {
    return <li key={proj.id}>{proj.title} - {proj.characterName}</li>
  });

  const crewList = crewProjects.map(proj => {
    return <li key={proj.id}>{proj.title} - {proj.roleType}</li>
  })

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