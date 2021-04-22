module Api
  module V1
    class ProjectsController < ApplicationController
      include ActionController::HttpAuthentication::Token
      before_action :authenticate_user, only: [:create, :update, :destroy]

      def index
        projects = Project.order(created_at: :desc).limit(10)

        if params[:keywords].present?
          keywords = params[:keywords]
          project_search_term = ProjectSearchTerm.new(keywords)
          projects = Project.where(
            project_search_term.where_clause,
            project_search_term.where_args
          )
          .order(project_search_term.order)
          .limit(20)
        else
          projects = Project.all.limit(10)
        end
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

      def authenticate_user
        # p request
        # Authorization: Bearer <token>
        token, _options = token_and_options(request)
        # p token
        user_id = AuthenticationTokenService.decode(token)
        # raise user_id.inspect
        # raise token.inspect
        User.find(user_id)
      rescue ActiveRecord::RecordNotFound => error
        render json: { error: error }, status: :unauthorized
      end

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
