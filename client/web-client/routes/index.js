var express = require('express');
var router = express.Router();
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = __dirname + '/../../protos/attendance.proto'

var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var attendance_proto = grpc.loadPackageDefinition(packageDefinition).attendance
var client = new attendance_proto.AttendanceService("0.0.0.0:40000", grpc.credentials.createInsecure());

/* GET home page. */
router.get('/', function(req, res, next) {
  var studentNameRequest = req.query.studentNameRequest
  var codeRequest = req.query.codeRequest
  var result
  var message

  if(studentNameRequest.length != 0 && codeRequest.length != 0) {
    try {
      client.checkAttendance({ studentNameRequest: studentNameRequest, codeRequest: codeRequest }, function (error, response) {
        try {
          res.render('index', { title: 'Check Attendence : Check In', error: error, result: response.result, message: response.result  });
        } catch (error) {
          console.log(error)
          res.render('index', { title: 'Check Attendence : Check In', error: "Check Attendence Service is not available at the moment please try again later", result: null });
        }
      });

    } catch (error) {
      console.log(error)
      res.render('index', { title: 'Check Attendence : Check In', error: "Check Attendence Service is not available at the moment please try again later", result: null });
    }
  } else {
    res.render('index', { title: 'Check Attendence : Check In', error: null, result: response.result, message: response.result })
  }
});

router.get('/getAttendanceList', function(req, res, next) {
  var studentName
  var present

    try {
      client.getAttendanceList({}, function (error, response) {
        try {
          res.render('getAttendanceList', { title: 'getAttendanceList', error: error, studentName: response.studentName, present: response.present });
        } catch (error) {
          console.log(error)
          res.render('getAttendanceList', { title: 'getAttendanceList', error: "getAttendanceList Service is not available at the moment please try again later", result: null });
        }
      });

    } catch (error) {
      console.log(error)
      res.render('getAttendanceList', { title: 'getAttendanceList', error: "getAttendanceList Service is not available at the moment please try again later", result: null });
    }
});

router.get('/getLastMonthAttendanceStats', function(req, res, next) {
  var studentName
  var daysPresent
  var daysAbsent
  var percentagePresent

    try {
      client.getLastMonthAttendanceStats({}, function (error, response) {
        try {
          res.render('getLastMonthAttendanceStats', { title: 'GRPC Calculator', error: error, studentName: response.studentName, daysPresent: response.daysPresent, daysAbsent: response.daysAbsent, percentagePresent: response.percentagePresent });
        } catch (error) {
          console.log(error)
          res.render('getLastMonthAttendanceStats', { title: 'GRPC Calculator', error: "Calculator Service is not available at the moment please try again later", result: null });
        }
      });

    } catch (error) {
      console.log(error)
      res.render('getLastMonthAttendanceStats', { title: 'GRPC Calculator', error: "Calculator Service is not available at the moment please try again later", result: null });
    }

});



module.exports = router;
