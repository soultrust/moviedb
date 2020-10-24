class Person < ApplicationRecord
  self.table_name = 'persons'

  has_many :projects, through: :roles
end
