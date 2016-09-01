angular.module('DfstcSchedulingApp').controller('DashboardController', DashboardController);

function DashboardController($http, $state, $uibModal, $scope, UserService, AppointmentService, calendarConfig, moment, AnnouncementService) {
  var vm = this;
  for (var i = 0; i<AppointmentService.appointments.length; i++){
    console.log('Checking appointments in controller!');
    for (var j = 0; j<AppointmentService.appointments[i].volunteers.length; j++){
    if(AppointmentService.apppointments[i].volunteers[j]._id == UserService.checkLoggedIn._id){
      AppointmentService.appointments[i].color = calendarConfig.colorTypes.info;
    } else {
      AppointmentService.appointments[i].color = calendarConfig.colorTypes.warn;
    }
    }
  }

  vm.showAppointments = AppointmentService.appointments;
  vm.editAppointment = {};
  vm.editAppointment.event = AppointmentService.updateEvent.event;
  vm.currentUser = {};
  vm.currentUser.user = UserService.currentUser.user;
  vm.myAppointments = [];
  vm.myAppointments = AppointmentService.myAppointments.scheduled;

  // start calendar and form settings
  //These variables MUST be set as a minimum for the calendar to work
  vm.calendarView = 'month';
  vm.viewDate = new Date();
  var actions = [{
    label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
    onClick: function(args) {
    }
  }, {
    label: '<i class=\'glyphicon glyphicon-remove\'></i>',
    onClick: function(args) {
    }
  }];

  vm.addAppointment = function(){
    console.log(vm.appointment);
    AppointmentService.addAppointment(vm.appointment).then(function(response){
      vm.showAppointments.appointments.push(vm.appointment);
      console.log('add appointment success', response.data);
    }, function(response){
      console.log('add appointment fail', response.data);
    })
  }

  vm.appointment={
    title: "Image Coach Appointment",
    color: calendarConfig.colorTypes.special,
    startsAt: '',
    endsAt: '',
    volunteerSlots: 5,
    clientSlots: 5,
    trainingAppointment: false,
    volunteers: [],
    incrementsBadgeTotal: false
  };

  vm.today = function() {
    vm.dt = new Date();
  };
  vm.today();

  vm.clear = function() {
    vm.dt = null;
  };

  vm.inlineOptions = {
    minDate: new Date(),
    showWeeks: true
  };

  vm.dateOptions = {
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 0
  };

  vm.toggleMin = function() {
    vm.inlineOptions.minDate = vm.inlineOptions.minDate ? null : new Date();
    vm.dateOptions.minDate = vm.inlineOptions.minDate;
  };

  vm.toggleMin();

  vm.open1 = function() {
    console.log('Clicked open1');
    vm.popup1.opened = true;
    console.log(vm.popup1);
  };

  vm.open2 = function() {
    console.log('Clicked open2');
    vm.popup2.opened = true;
  };

  vm.setDate = function(year, month, day) {
    vm.dt = new Date(year, month, day);
  };

  vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  vm.format = vm.formats[0];
  vm.altInputFormats = ['M!/d!/yyyy'];
  //
  vm.popup1 = {
    opened: false
  }

  vm.popup2 = {
    opened: false
  }//end calendar and form settings

  vm.addAppointmentModal = function(){
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'addAppointmentModal.html',
      controller: 'DashboardController',
      controllerAs: 'dash',
      size: 'lg'
    })
  }

  vm.eventClicked = function(calendarEvent){
    console.log(calendarEvent);
    AppointmentService.myAppointments.scheduled = [];
    AppointmentService.updateEvent.event = calendarEvent;
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'editAppointmentModal.html',
      controller: 'DashboardController',
      controllerAs: 'dash',
      size: 'lg',
      resolve: {
        appointment: function (){
          return AppointmentService.updateEvent.event;
        }
      }
    });
  }


  vm.updateAppointment = function(info){
    console.log(info);
    AppointmentService.updateAppointment(info._id, info);
    vm.showAppointments.appointments.splice(findIndex(vm.showAppointments.appointments, '_id', info._id), 1);
    vm.showAppointments.appointments.push(info);

  }

  function findIndex(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
      if(array[i][attr] === value) {
        return i;
      }
    }
  }
  vm.deleteAppointment = function(event){
    console.log('deleting', event);
    AppointmentService.deleteAppointment(event._id);
    vm.showAppointments.appointments.splice(findIndex(vm.showAppointments.appointments, '_id', event._id), 1);
  }
  // volunteer adding themselves to appointment
  vm.claimAppointment = function(info){
    info.volunteers.push(vm.currentUser.user);
    AppointmentService.updateAppointment(info._id, info);
    vm.showAppointments.appointments.splice(findIndex(vm.showAppointments.appointments, '_id', info._id), 1);
    info.color = calendarConfig.colorTypes.info;
    vm.myAppointments.push(info);
    vm.showAppointments.appointments.push(info);
    // $scope.safeApply();

    console.log('my appointments', vm.myAppointments);
  };
  // admin removing volunteer from appointment
  vm.removeVolunteer = function(index, event){
    event.volunteers.splice(index, 1);
    for (var i = vm.showAppointments.appointments.length-1; i >= 0; i--){
      if (vm.showAppointments.appointments[i]._id == event._id){
        vm.showAppointments.appointments[i].volunteers.splice(index, 1);
      }
    }
    AppointmentService.updateAppointment(event._id, event);
  }
  // volunteer removing self from appointment
  vm.removeMe = function(event){
    event.color = calendarConfig.colorTypes.warning;
    for (var i = event.volunteers.length-1; i >= 0; i--){
      if (event.volunteers[i]._id == UserService.currentUser.user._id){
        event.volunteers.splice(i, 1);
      }
    }
    AppointmentService.updateAppointment(event._id, event);

    for (var j = vm.showAppointments.appointments.length-1; j >= 0; j--){
      if (vm.showAppointments.appointments[j]._id == event._id){
        vm.showAppointments.appointments.splice(j, 1);
        vm.showAppointments.appointments.push(event);
      }
    }
    for (var k = vm.myAppointments.length-1; k >= 0; k--){
      if (vm.myAppointments[k]._id == event._id){
        vm.myAppointments.splice(k, 1);
      }
    }
    // $scope.safeApply();

  }

  // Announcements functions

  vm.announcement={
    title: "",
    message: ''
  };

  vm.Ann={
    title: "",
    message: '',
    date:new Date()
  }

  vm.title = "test";


  vm.addAnnouncementModal = function(){
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'addAnnouncementModal.html',
      controller: 'DashboardController',
      controllerAs: 'dash',
      size: 'lg'
    })
  }

  vm.addAnnouncement = function(){
    console.log(vm.announcement);
    AnnouncementService.addAnnouncement(vm.announcement).then(function(response){
      console.log('add announcement success', response.data);
    }, function(response){
      console.log('add announcement fail', response.data);
    })
  }

  var getAnnouncement = function(){
    AnnouncementService.getAnnouncement().then(successHandle)

    function successHandle(res){
      vm.Ann.title = res[0].title;
      vm.Ann.message = res[0].message;
      vm.Ann.date = moment(res[0].date).format('MMM Do YYYY');
    };
  }
  getAnnouncement();

  AppointmentService.getAppointments(UserService.currentUser.user);
}; //end DashboardController
