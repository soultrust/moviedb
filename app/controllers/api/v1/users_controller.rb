module Api
  module V1
    class AuthenticationController < ApplicationController
      def create
        user = User.new(user_params)

        if user.save
          'saved'
        else
          render json: { error: role.errors.messages }, status: 422
        end

        private

        def user_params
          params.require(:user).permit(:username, :password_digest)
        end
      end
    end
  end
end
