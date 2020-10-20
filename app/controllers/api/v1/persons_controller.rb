module Api
  module V1
    class PersonsController < ApplicationController
      protect_from_forgery with: :null_session

      def index
        persons = Person.all

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
