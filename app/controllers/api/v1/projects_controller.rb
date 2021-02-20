module Api
  module V1
    class ProjectsController < ApplicationController
      protect_from_forgery with: :null_session

      def index
        projects = Project.order(created_at: :desc).limit(20)
        render json: ProjectSerializer.new(projects).serializable_hash
      end

      def show
        project = Project.find(params[:id])
        render json: ProjectSerializer.new(project, options).serializable_hash
      end

      def create
        project = Project.new(project_params)

        if project.save
          render json: ProjectSerializer.new(project).serializable_hash
        else
          render json: { error: project.errors.messages }, status: 422
        end
      end

      def update
        project = Project.find(params[:id])

        if project.update(project_params)
          render json: ProjectSerializer.new(project, options).serializable_hash
        else
          render json: { error: project.errors.messages }, status: 422
        end
      end

      def destroy
        project = Project.find(params[:id])

        if project.destroy
          head :no_content
        else
          render json: { error: project.errors.messages }, status: 422
        end
      end

      private

      def project_params
        params.require(:data)
          .permit(
            attributes: [:title, :notes],
            roles_attributes: [:project_id, :person_id, :role_type, :character_name]
          )
      end

      def options
        @options ||= { include: [:roles, :persons] }
      end
    end
  end
end
