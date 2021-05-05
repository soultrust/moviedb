Rails.application.routes.draw do
  root 'pages#index'

  namespace :api do
    namespace :v1 do
      resources :projects
      resources :persons  #, only: [:create, :destroy]
      resources :roles
      resources :users

      post 'authenticate', to: 'authentication#create'
      get 'search', to: 'search#index'
    end
  end

  get '*path', to: 'pages#index', via: :all
end
