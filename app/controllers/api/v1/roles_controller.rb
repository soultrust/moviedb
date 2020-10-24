module Api
  module V1
    class RolesController < ApplicationController
      protect_from_forgery with: :null_session

      def index
        roles = Role.all

        render json: RoleSerializer.new(roles).serializable_hash
      end

      def show
        role = Role.find(params[:id])
        render json: RoleSerializer.new(role).serializable_hash
      end

      def create
        role = Role.new(role_params)

        if role.save
          render json: RoleSerializer.new(role).serializable_hash
        else
          render json: { error: role.errors.messages }, status: 422
        end
      end

      def update
        role = Role.find(params[:id])

        if role.update(role_params)
          render json: roleSerializer.new(role).serializable_hash
        else
          render json: { error: role.errors.messages }, status: 422
        end
      end

      def destroy
        role = Role.find(params[:id])

        if role.destroy
          head :no_content
        else
          render json: { error: role.errors.messages }, status: 422
        end
      end

      private

      def role_params
        params.require(:role).permit(:person_id, :project_id, :role_type, :character_name)
      end

      # def options
      #   @options ||= { include: %i[reviews] }
      # end
    end
  end
end
