module Api
  module V1
    class PersonsController < ApplicationController
      protect_from_forgery with: :null_session

      def index
        if params[:keywords].present?
          keywords = params[:keywords]
          person_search_term = PersonSearchTerm.new(keywords)
          persons = Person.where(
            person_search_term.where_clause,
            person_search_term.where_args
          )
          .order(person_search_term.order)
          .limit(20)
        else
          persons = Person.all.limit(10)
        end
        render json: PersonSerializer.new(persons).serializable_hash
      end

      def create
        person = Person.new(person_params)

        if person.save
          render json: PersonSerializer.new(person).serializable_hash
        else
          render json: { error: person.errors.messages }, status: 422
        end
      end

      def show
        person = Person.find(params[:id])
        render json: PersonSerializer.new(person, options).serializable_hash
      end

      def edit
        @person = Person.find(params[:id])
      end

      def update
        person = Person.find(params[:id])

        if person.update(person_params)
          render json: PersonSerializer.new(person, options).serializable_hash
        else
          render json: { error: person.errors.messages }, status: 422
        end
      end

      def destroy
        person = Person.find_by(params[:id])

        if person.save
          head :no_content
        else
          render json: { error: person.errors.messages }, status: 422
        end
      end

      private

      def person_params
        params.require(:data)
          .permit(
            attributes: [:full_name, :notes],
            roles_attributes: [:project_id, :role_type, :character_name]
          )
      end

      def options
        @options ||= { include: [:roles, :projects] }
      end
    end
  end
end
