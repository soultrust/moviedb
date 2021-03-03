class PersonSerializer
  include JSONAPI::Serializer
  attributes :full_name

  has_many :roles
  has_many :projects
end
