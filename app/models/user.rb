class User < ApplicationRecord
  has_secure_password
  # has_many :refresh_tokens, dependent: :delete_all
  # validates :email, presence: true, uniqueness: true
end
