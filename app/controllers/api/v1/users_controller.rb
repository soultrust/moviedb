module Api
  module V1
    class UsersController < ApplicationController
      def create
        user = User.create!(
          username: params['user']['username'],
          password: params['user']['password'],
          password_confirmation: params['user']['password_confirmation']
        )

        if user
          render json: {
            status: :created,
            user: user
          }
        else
          render json: { status: 500 }
        end
      end
    end
  end
end
