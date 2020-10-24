class ChangeColumnNameRoleType < ActiveRecord::Migration[6.0]
  def change
    rename_column :roles, :role, :role_type
  end
end
