class Role < ApplicationRecord
  belongs_to :project
  belongs_to :person
  enum role_type: [:not_set, :actor, :director]
end
