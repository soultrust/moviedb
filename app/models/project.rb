class Project < ApplicationRecord
  has_many :roles
  has_many :persons, through: :roles
  validates :title, presence: true

  accepts_nested_attributes_for :persons, :roles
end
