import React, { useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { sortIncluded } from '../Helpers';
import AppContext from '../AppContext';

const Person = (props) => {
  const personId = props.match.params.id
  const [person, setPerson] = useState({
    attributes: {
      full_name: ''
    }
  })
  const [actingProjects, setActingProjects] = useState([]);
  const [crewProjects, setCrewProjects] = useState([]);
  const appCtx = useContext(AppContext);

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
    return (
      <li key={proj.id}>
        <Link to={`/projects/${proj.id}`}>{proj.title}</Link> &mdash; {proj.characterName}
      </li>
    );
  });

  const crewList = crewProjects.map(proj => {
    return <li key={proj.id}>{proj.title} &mdash; {proj.roleType}</li>
  });

  return (
    <div>
      <Typography variant="h4">{person.full_name}</Typography><br />
      { !!actingList.length &&
        <div>
          <h3>Projects as Actor</h3>
          <ul className="generic-list">{actingList}</ul>
        </div>
      }
      { !!crewList.length &&
        <div>
          <h3>Projects as Crew</h3>
          <ul className="generic-list">{crewList}</ul>
        </div>
      }
      <br />
      <br />
      {
        appCtx.isLoggedIn &&
        <Link to={`/persons/${personId}/edit`}>edit</Link>
      }
    </div>
  )
}

export default Person