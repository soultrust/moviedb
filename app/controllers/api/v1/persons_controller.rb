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
          .limit(30)
        else
          persons = Person.all.limit(50)
        end
        render json: PersonSerializer.new(persons).serialized_json
      end

      def create
        person = Person.new(person_params)

        if person.save
          render json: PersonSerializer.new(person).serialized_json
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
        params.require(:person).permit(:first_name, :last_name)
      end
    end
  end
end
