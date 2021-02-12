class PersonSerializer
  include JSONAPI::Serializer
  attributes :full_name
end
