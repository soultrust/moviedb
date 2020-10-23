class AddDefaultToPersonRole < ActiveRecord::Migration[6.0]
  def change
    change_column :roles, :role, :integer, default: 0
  end
end
