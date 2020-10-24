class ProjectSerializer
  include JSONAPI::Serializer
  attributes :title

  has_many :roles
  has_many :persons
end
