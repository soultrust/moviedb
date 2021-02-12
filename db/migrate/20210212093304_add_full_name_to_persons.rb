class AddFullNameToPersons < ActiveRecord::Migration[6.0]
  def change
    add_column :persons, :full_name, :string
  end
end
