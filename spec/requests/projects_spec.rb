require 'rails_helper'

describe 'Projects API', type: :request do
  let(:user) { FactoryBot.create(:user, email: 'tomo@soultrust.com', password: 'Password1') }

  describe 'POST /projects' do
    it 'creates a new project' do
      expect {
        post '/api/v1/projects', params: {
          data: {
            attributes: {
              title: 'Blade Runner'
            }
          }
        }, headers: { "Authorization" => "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMSJ9.M1vu6qDej7HzuSxcfbE6KAMekNUXB3EWtxwS0pg4UGg" }
      }.to change { Project.count }.from(0).to(1)


    end
  end
end