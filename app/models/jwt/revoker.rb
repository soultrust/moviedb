module Jwt
  module Revoker
    module_function

    def revoke(decoded_token:, user:)
      jti = decoded_token.fetch(:jti)
      exp = decoded_token.fetch(:exp)

    rescue StandardError
      raise Errors::Jwt::InvalidToken
    end
  end
end