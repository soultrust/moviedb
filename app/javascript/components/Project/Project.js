import React, { Fragment, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import classes from './Project.module.css';
import AppContext from '../AppContext';

const Project = (props) => {
  const [project, setProject] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [cast, setCast] = useState([]);
  const appCtx = useContext(AppContext);

  const extractActors = (projectInclResult) => {

    // Filter actors
    const actorObjects = projectInclResult.filter(inc => {
      return inc.type === 'role' && inc.attributes.role_type === 'actor';
    })

    // Filter persons
    const personObjects = projectInclResult.filter(inc => {
      return inc.type === 'person';
    })

    const actors = actorObjects.map((actor) => {
      const member = personObjects.find(person => {
        return +actor.attributes.person_id === +person.id;
      })
      return {
        id: member.id,
        full_name: member.attributes.full_name,
        character_name: actor.attributes.character_name
      }
    })
    setCast(actors);
  }

  useEffect(() => {
    const projectId = props.match.params.id || props.firstProjectId;

    if (projectId) {
      const url = `/api/v1/projects/${projectId}`;
      axios.get(url)
        .then(resp => {
          extractActors(resp.data.included);
          setProject(resp.data);
          setLoaded(true);
        })
        .catch(resp => console.log(resp));
    }
  }, [props.match.params.id, props.firstProjectId])

  return (
    <Fragment>
      {
        loaded &&
        <Fragment>
          <h2 className="record-detail-title">{project.data.attributes.title}</h2>
          <div className={classes['cast-crew']}>
            <div>
              <Typography variant="h5">Cast</Typography>
              <ul className={classes['list-actors']}>
                {cast.map(actor => {
                  return (
                    <li key={actor.id}>
                      <Link to={`/persons/${actor.id}`} className="name-actor">{actor.full_name}</Link>
                      <div className="name-character">{actor.character_name}</div>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div>
              <Typography variant="h5">Crew</Typography>
              <ul className={classes['list-crew']}>

              </ul>
            </div>
          </div>
          {
            appCtx.isLoggedIn &&
            <Link to={`/projects/${project.data.id}/edit`}>edit</Link>
          }
        </Fragment>
      }
    </Fragment>
  )
}

export default Project