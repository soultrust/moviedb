class Person < ApplicationRecord
  self.table_name = 'persons'
  has_many :roles
  has_many :projects, through: :roles
  validates :full_name, presence: true

  accepts_nested_attributes_for :projects, :roles
end
