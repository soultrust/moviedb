class RoleSerializer
  include JSONAPI::Serializer
  attributes :person_id, :project_id, :role_type, :character_name

  belongs_to :person
  belongs_to :project
end
