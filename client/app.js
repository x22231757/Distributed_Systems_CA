var readlineSync = require("readline-sync")
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var readline = require('readline')

//Client specifies which service would you like to use:
var service = readlineSync.question (
  "Which service would you like to use? \n"
+ " \t 1 for Attendance Service \n"
+ " \t 2 for Educational Portal Service \n"
+ " \t 3 for Q&A Chat Service \n" )

//Parse the input to Int for comparison in if statements
service = parseInt(service)

//If statements to switch between services based on client input
if(service === 1 ) { // Attendance service start
  //Load the required proto file
  var PROTO_PATH = __dirname + "/protos/attendance.proto"
  var packageDefinition = protoLoader.loadSync(PROTO_PATH)
  var attendance_proto = grpc.loadPackageDefinition(packageDefinition).attendance
  var client = new attendance_proto.AttendanceService("0.0.0.0:40000", grpc.credentials.createInsecure());

  //Client specifies which functionality within the service they would you like to use:
  var attendance_action = readlineSync.question (
    "What would you like to do? \n"
  + " \t 1 to check in your attendance \n"
  + " \t 2 to get attendance list \n"
  + " \t 3 to get last complete month attendance stats \n" )

  //Parse the input to Int for comparison in if statements
  attendance_action = parseInt(attendance_action)
  //If check in your attendance is chosen
  if(attendance_action === 1 ) {
    //Obtain info from the client
    var studentNameRequest = readlineSync.question("What is your full name? (Name, Surname)")
    var codeRequest  = readlineSync.question("What is the attendance code made available by the teacher?")

    //Try and catch error handling
    try{
      //Call the function defined on the server
      client.checkAttendance({
        studentNameRequest: studentNameRequest,
        codeRequest: codeRequest},
        function(error, response){
          try{
            console.log(response.message)
            console.log("Your attendance is now marked as (1 for present, 0 for absent) : " + response.result)
          }catch(e){
            console.log("Could not connect to server.")
          }
        })
    }catch(e){
      console.log("An error Occured.")
    }
    //If get attendance list is chosen
  } else if(attendance_action ===2){
    //Call the function defined on the server
      var call = client.getAttendanceList({ });
      call.on('data', function(response){
          console.log( "Student Name: " + response.studentName + ". If present: (1: yes, 0: no) " +  response.present)
      });
      call.on('end', function(){});
      call.on('error', function(e){
          console.log(e)
      })
    //If get last complete month attendance stats is chosen
  }else if(attendance_action ===3){
    //Call the function defined on the server
    var call = client.getLastMonthAttendanceStats({ });
    call.on('data', function(response){
        console.log("Attendence Stats for last complete month: ");
        console.log( "Student Name: " + response.studentName + "; Days Present: " +  response.daysPresent + "; Days Absent: " +  response.daysAbsent + "; % Presence: " +  response.percentagePresent)
    });
    call.on('end', function(){});
    call.on('error', function(e){
        console.log(e)
    })
  }

} else if(service ===2){// Attendance service end; Educational portal service start
  //Load the required proto file
  var PROTO_PATH = __dirname + "/protos/education_portal.proto"
  var packageDefinition = protoLoader.loadSync(PROTO_PATH)
  var education_portal_proto = grpc.loadPackageDefinition(packageDefinition).education_portal
  var client = new education_portal_proto.EducationPortalService("0.0.0.0:40000", grpc.credentials.createInsecure());

  //Advance to the upload quiz functionality
  var education_portal_action = readlineSync.question (
    "What would you like to do? \n"
  + " \t 1 to upload a quiz \n")

  //Parse the input to Int for comparison in if statements
  education_portal_action = parseInt(education_portal_action)
  if (education_portal_action === 1) {
    //Call the function defined on the server
    var call = client.uploadQuiz(function(error, response){
       if(error){
          console.log("An error has occured")
        }else{
         console.log("Your Quiz has been uploaded into the Quiz database. Your Quiz contains: " + response.numOfQuestions + " questions.  Your code quiz unique identifying reference code : " + response.quizRefNumber)
      }
   })

   //Variable to number questions in the prompts
   var questionNumber = 0
   //While loop to allow for client defined number of inputs
   while(true){
    questionNumber +=1
    var quizQuestion = readlineSync.question("Please enter your question " + questionNumber + " (q to Quit) : ")
    //Exit condition if type q
    if(quizQuestion.toLowerCase() === "q"){
       break
    }

    call.write({
       quizQuestion : quizQuestion,
     })
   }
   call .end()
  }


} else if(service ===3){//Educational portal service ends; Chat service starts
    //Load the required proto file
    var PROTO_PATH = __dirname + "/protos/chat.proto"
    var packageDefinition = protoLoader.loadSync(PROTO_PATH)
    var chat_proto = grpc.loadPackageDefinition(packageDefinition).chat
    var client = new chat_proto.ChatService ("0.0.0.0:40000", grpc.credentials.createInsecure());

    //Prompt for the client
    var name = readlineSync.question("What is your name? ")
    //Call the function defined on the server
    var call = client.sendMessage();

    //On data stream output the name and the message
    call.on('data', function(resp){
       console.log(resp.name + ': ' + resp.message )
    }) ;
    //Do nothing when stream ends
    call.on('end', function(){
     })
     // Error handling
    call.on('error', function(e){
       console.log("Cannot connect to chat server")
     })

    call.write({
      message : name + " joined the chat .",
      name : name
    })
    //Creating the interface
    var rl = readline.createInterface({
       input :process.stdin,
       output : process.stdout
    })

    rl.on("line", function(message){
      if(message.toLowerCase() === 'quit'){
        call.write({
          message: name + " left the chatroom.",
          name:name
        });
        call.end();
        rl.close();
      }else{
        call.write({
          message: message,
          name:name
        })
      }
    })


}//Chat service ends;
