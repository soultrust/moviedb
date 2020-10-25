class Role < ApplicationRecord
  belongs_to :project
  belongs_to :person
  enum role_type: [:not_set, :actor, :director]
  validates_uniqueness_of :role_type, scope: %i[person_id project_id character_name]
end
