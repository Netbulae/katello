# encoding: utf-8

require "katello_test_helper"

module Katello
  class Api::V2::SystemErrataControllerTest < ActionController::TestCase
    include Support::ForemanTasks::Task

    def permissions
      @view_permission = :view_content_hosts
      @create_permission = :create_content_hosts
      @update_permission = :edit_content_hosts
      @destroy_permission = :destroy_content_hosts
    end

    def setup
      setup_controller_defaults_api
      login_user(User.find(users(:admin)))
      @request.env['HTTP_ACCEPT'] = 'application/json'

      @system = katello_systems(:simple_server)
      @errata_system = katello_systems(:errata_server)
      permissions
    end

    def test_index
      get :index, :system_id => @errata_system.uuid

      assert_response :success
      assert_template 'api/v2/system_errata/index'
    end

    def test_index_other_env
      get :index, :system_id => @errata_system.uuid, :content_view_id => @errata_system.organization.default_content_view.id,
          :environment_id => @errata_system.organization.library.id

      assert_response :success
      assert_template 'api/v2/system_errata/index'
    end

    def test_apply
      assert_async_task ::Actions::Katello::System::Erratum::Install do |system, errata|
        system.id == @system.id && errata == %w(RHSA-1999-1231)
      end

      put :apply, :system_id => @system.uuid, :errata_ids => %w(RHSA-1999-1231)

      assert_response :success
    end

    def test_apply_unknown_errata
      put :apply, :system_id => @system.uuid, :errata_ids => %w(non-existant-errata)
      assert_response 404
    end

    def test_apply_protected
      good_perms = [@update_permission]
      bad_perms = [@view_permission, @create_permission, @destroy_permission]

      assert_protected_action(:apply, good_perms, bad_perms) do
        put :apply, :system_id => @system.uuid, :errata_ids => %w(RHSA-1999-1231)
      end
    end
  end
end
