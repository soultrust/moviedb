class Project < ApplicationRecord
  has_many :roles
  has_many :persons, through: :roles
end
