class AddIndexToRoles < ActiveRecord::Migration[6.0]
  def change
    add_index :roles,
     [:person_id, :project_id, :role_type, :character_name],
     :unique => true,
     :name => 'uniqueness_index'
  end
end
