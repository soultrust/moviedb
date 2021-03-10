# https://www.youtube.com/watch?v=2evHteUQsBY&list=PLKa6CHS-K-stiPlzkZW6XO-S6I1WVd3hW&index=2

require 'rails_helper'

describe 'Authentication', type: :request do
  describe 'POST /authenticate' do
    it 'authenticates the client' do
      post '/api/v1/authenticate'
    end
  end
end

