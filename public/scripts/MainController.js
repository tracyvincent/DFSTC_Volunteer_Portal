angular.module('DfstcSchedulingApp').controller('MainController', MainController);

function MainController($http, $state, $window, UserService, Upload) {
  var vm = this;
  vm.login = login;
  vm.register = register;
  vm.logout = logout;
  //temp for QOL testing
  vm.loginUser = {};
  vm.loginUser.email = 'test';
  vm.loginUser.password = 'test';

  function register(role) {
    console.log(role);
    if(role === 'trainee') {
      vm.registerUser.isTrainee = true;
      console.log(vm.registerUser);
      UserService.register(vm.registerUser).then(function() {
        UserService.login(vm.registerUser).then(function(response) {
          vm.registerUser = {};
          vm.loginUser = {};
          vm.currentUser = response;
          $state.go('dashboard');
        });
      });
    }
    if(role === 'client') {
      vm.registerUser.isClient = true;
      UserService.register(vm.registerUser).then(function() {
        vm.registerUser = {};
        UserService.login(vm.registerUser).then(function(response) {
          vm.loginUser = {};
          vm.currentUser = response;
          $state.go('dashboard');
        });
      });
    }
    if(role === 'caseworker') {
      vm.registerUser.isCaseWorker = true;
      UserService.register(vm.registerUser).then(function() {
        vm.registerUser = {};
        UserService.login(vm.registerUser).then(function(response) {
          vm.loginUser = {};
          vm.currentUser = response;
          $state.go('dashboard');
        });
      });
    }
  }

  function login() {
    UserService.login(vm.loginUser).then(function(response) {
      vm.loginUser = {};
      vm.currentUser = response;
      $state.go('dashboard');
    }, function() {
      vm.currentUser = null;
    });
  }

  function logout() {
    UserService.logout().then(function(response) {
      vm.currentUser = null;
      $state.go('/');
    })
  }

    //checks if user is currently logged in on page load
  UserService.checkLoggedIn().then(function(response) {
    console.log(response);
    vm.currentUser = response;
  });
} //end Main Controller
