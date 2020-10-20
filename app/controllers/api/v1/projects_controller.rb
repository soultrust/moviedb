module Api
  module V1
    class ProjectsController < ApplicationController
      protect_from_forgery with: :null_session

      def index
        projects = Project.all

        render json: ProjectSerializer.new(projects).serialized_json
      end

      def show
        project = Project.find(params[:id])
        render json: ProjectSerializer.new(project).serialized_json
      end

      def create
        project = Project.new(project_params)

        if project.save
          render json: ProjectSerializer.new(project).serialized_json
        else
          render json: { error: project.errors.messages }, status: 422
        end
      end

      def update
        project = Project.find(params[:id])

        if project.update(project_params)
          render json: ProjectSerializer.new(project).serialized_json
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
        params.require(:project).permit(:title)
      end

      # def options
      #   @options ||= { include: %i[reviews] }
      # end
    end
  end
end
