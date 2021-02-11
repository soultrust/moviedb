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

Person.create([
  {
    first_name: 'Harrison',
    last_name: 'Ford'
  },
  {
    first_name: 'Ridley',
    last_name: 'Scott'
  },
  {
    first_name: 'Ryan',
    last_name: 'Gosling'
  },
  {
    first_name: 'Dave',
    last_name: 'Bautista'
  },
  {
    first_name: 'Anya',
    last_name: 'Taylor-Joy'
  },
  {
    first_name: 'Akira',
    last_name: 'Kurosawa'
  },
  {
    first_name: 'Winona',
    last_name: 'Ryder'
  },
  {

  }
])

300.times do |i|
  Person.create!(
    first_name: Faker::Name.first_name,
    last_name: Faker::Name.last_name
  )
  Project.create!(
    title: Faker::Movie.title
  )
end
puts
