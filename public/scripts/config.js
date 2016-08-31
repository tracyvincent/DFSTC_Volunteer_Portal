angular
  .module('DfstcSchedulingApp')
  .config(uiRouter)
  .factory('Excel',function($window){
        var uri='data:application/vnd.ms-excel;base64,',
            template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
            base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));},
            format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
        return {
            tableToExcel:function(tableId,worksheetName){
                var table = document.getElementById(tableId),
                    ctx = {worksheet:worksheetName,table:table.innerHTML},
                    href=uri+base64(format(template,ctx));
                return href;
            }
        };
    });

function uiRouter($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('/', {
      url: '/',
      templateUrl: '../views/landingPage.html',
      resolve: {
        userCheck: function(UserService, $state) {
          UserService.checkLoggedIn().then(function(response) {
            if(response) {
              $state.go('dashboard')
            }
          })
        }
      }
    })
    .state('register', {
      url: '/register',
      templateUrl: '../views/register.html'
    })
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: '../views/dashboard.html',
      controller: 'DashboardController',
      controllerAs: 'dash',
      resolve: {
        userCheck: function(UserService, $state) {
          UserService.checkLoggedIn().then(function(response) {
            if(!response) {
              $state.go('/');
            }
          });
        }
      }
    })
    .state('admin', {
      url: '/admin',
      abstract: true,
      templateUrl: '../views/admin.html',
      controller: 'AdminController',
      controllerAs: 'admin',
      resolve: {
        userCheck: function(UserService, $state) {
          UserService.checkLoggedIn().then(function(response) {
            if(!response) {
              //user not logged in, send to login
              $state.go('/');
            } else if(!response.isAdmin) {
              //user not admin, send to dashboard
              $state.go('dashboard');
            }
          });
        },
        volunteerList: function(AdminService) {
          return AdminService.getVolunteers();
        }
      }
    })
    .state('admin.volunteers', {
      url: '/volunteers',
      templateUrl: '../views/adminVolunteers.html'
    })
    .state('admin.registerClient', {
      url: '/registerClient',
      templateUrl: '../views/registerClient.html'
    })
    .state('admin.reports', {
      url:'/reports',
      templateUrl: '../views/adminReports.html'
    })
    .state('admin.users', {
      url:'/users',
      templateUrl: '../views/adminUsers.html',
      controller: 'SuperAdminController',
      controllerAs: 'sa',
      resolve: {
        users: function(AdminService) {
          return AdminService.getAllUsers();
        }
      }
    });

    $locationProvider.html5Mode(true);
}
