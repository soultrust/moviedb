Person.delete_all
Project.delete_all

# projects = Project.create([
#   {
#     title: 'Blade Runner'
#   },
#   {
#     title: 'Star Wars'
#   }
# ])

# persons = Person.create([
#   {
#     first_name: 'Harrison',
#     last_name: 'Ford'
#   },
#   {
#     first_name: 'Ridley',
#     last_name: 'Scott'
#   }
# ])

1_000.times do |i|
  Person.create!(
    first_name: Faker::Name.first_name,
    last_name: Faker::Name.last_name
  )
  Project.create!(
    title: Faker::Movie.title
  )
end
puts
