class ApplicationController < ActionController::Base
  # before_action :authenticate
  protect_from_forgery with: :null_session

  private

  def authenticate
    # https://gist.github.com/jesster2k10/e626ee61d678350a21a9d3e81da2493e
    # current_user, decoded_token = Jwt::Authenticator.call(
    #   headers: request.headers,
    #   access_token: params[:access_token] # authenticate from header OR params
    # )

    # @current_user = current_user
    # @decoded_token = decoded_token
  end
end
