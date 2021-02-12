# Role.delete_all
# Person.delete_all
# Project.delete_all

ActiveRecord::Base.establish_connection
ActiveRecord::Base.connection.tables.each do |table|
  next if table == 'schema_migrations'

  # MySQL and PostgreSQL
  ActiveRecord::Base.connection.execute("TRUNCATE #{table} CASCADE")

  # SQLite
  # ActiveRecord::Base.connection.execute("DELETE FROM #{table}")
end

projects = Project.create([
  {
    title: 'Blade Runner'
  },
  {
    title: 'Blade Runner 2049'
  },
  {
    title: 'Star Wars'
  },
  {
    title: 'Guardians of the Galaxy'
  },
  {
    title: 'Queen\'s Gambit'
  },
  {
    title: 'The Next Three Days'
  },
  {
    title: 'Homefront'
  }
])

120.times do |i|
  Person.create!(
    full_name: Faker::Name.name
  )
  Project.create!(
    title: Faker::Movie.title
  )
end
puts
