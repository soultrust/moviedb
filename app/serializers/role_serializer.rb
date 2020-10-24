class RoleSerializer
  include FastJsonapi::ObjectSerializer
  attributes :person_id, :project_id, :role, :character_name
end
