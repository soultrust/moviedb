module Jwt
  module Authenticator
    module_function

    def call(headers:, access_token:)
      token = access_token || Jwt::Authenticator.authenticate_header(
        headers
      )
      raise StandardError.new 'Missing token' unless token.present?

      decoded_token = Jwt::Decoder.decode!(token)
      user = Jwt::Authenticator.authenticate_user_from_token(decoded_token)
      raise Errors::Unauthorized unless user.present?

      [user, decoded_token]
    end

    def authenticate_header(headers)
      headers['Authorization']&.split('Bearer ')&.last
    end

    def authenticate_user_from_token(decoded_token)
      raise StandardError.new 'Invalid token' unless decoded_token[:jti].present? && decoded_token[:user_id].present?

      user = User.find(decoded_token.fetch(:user_id))
      valid_issued_at = Jwt::Authenticator.valid_issued_at?(user, decoded_token)

      return user if valid_issued_at
    end

    def valid_issued_at?(user, decoded_token)
      !user.token_issued_at || decoded_token[:iat] >= user.token_issued_at.to_i
    end

    module Helpers
      extend ActiveSupport::Concern

      def logout!(user:, decoded_token:)
        Jwt::Revoker.revoke(
          decoded_token: decoded_token,
          user: user
        )
      end
    end
  end
end