class AuthenticationTokenService
  ACCESS_SECRET = ENV['ACCESS_TOKEN_SECRET']
  REFRESH_SECRET = ENV['REFRESH_TOKEN_SECRET']
  ALGORITHM_TYPE = 'HS256'
  HMAC_SECRET = 'my$ecretK3y'

  def self.call(user_id)
    payload = { user_id: user_id, exp: 7.days.from_now.to_i }
    JWT.encode payload, HMAC_SECRET, ALGORITHM_TYPE
  end

  def self.refresh(user_id)
    payload = { user_id: user_id }
    JWT.encode payload, REFRESH_SECRET, ALGORITHM_TYPE
  end

  def self.decode(token)
    decoded_token = JWT.decode token, HMAC_SECRET, true, { algorithm: ALGORITHM_TYPE }
    decoded_token[0]['user_id']
  end
end