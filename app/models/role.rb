class Role < ApplicationRecord
  belongs_to :project
  belongs_to :person
  enum role: [:not_set, :actor, :director]
end
