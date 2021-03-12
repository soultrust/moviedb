require 'rails_helper'

describe 'Authentication', type: :request do
  describe 'POST /authenticate' do
    let(:user) { FactoryBot.create(:user, email: 'tomo@soultrust.com', password: 'Password1') }

    it 'authenticates the client' do
      post '/api/v1/authenticate', params: { email: user.email, password: 'Password1' }

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)).to eq({
        'token' => 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.DiPWrOKsx3sPeVClrm_j07XNdSYHgBa3Qctosdxax3w'
      })
    end

    it 'returns error when email is missing' do
      post '/api/v1/authenticate', params: { password: 'Password1' }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)).to eq({
        'error' => 'param is missing or the value is empty: email'
      })
    end

    it 'returns error when password is missing' do
      post '/api/v1/authenticate', params: { email: 'tomo@soultrust.com' }
      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)).to eq({
        'error' => 'param is missing or the value is empty: password'
      })
    end

    it 'returns error when password is incorrect' do
      post '/api/v1/authenticate', params: { email: user.email, password: 'incorrect' }

      expect(response).to have_http_status(:unauthorized)
    end
  end
end