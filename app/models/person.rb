class Person < ApplicationRecord
  self.table_name = 'persons'
  has_many :roles
  has_many :projects, through: :roles
end
