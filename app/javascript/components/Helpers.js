export const sortIncluded = (personInclResult) => {
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

  return {
    actingProjectsTemp,
    crewProjectsTemp
  };
}