const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const check = require('../libs/checkLib')

const emailLib = require('../libs/emailLib');

/* Models */
const MeetingModel = mongoose.model('Meeting')
const UserModel = mongoose.model('User')
// start createMeetingFunction 
/* params: meetingTopic,hostId,hostName,participantId,participantName,participantEmail,
           meetingStartDate,meetingEndDate,meetingDescription,meetingPlace
*/

let createMeetingFunction = (req, res) => {    
    let validateInputFromUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.meetingTopic && req.body.hostId && req.body.hostName &&
                req.body.participantId && req.body.participantName && req.body.meetingStartDate &&
                req.body.meetingEndDate && req.body.meetingDescription && req.body.meetingPlace) {
                resolve(req)
            } else {
                logger.error('Expecting More Fields During Meeting Creation', 'meetingController: createMeeting()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input

    let createMeeting = () => {
        return new Promise((resolve, reject) => {

            let newMeeting = new MeetingModel({
                meetingId: shortid.generate(),
                meetingTopic: req.body.meetingTopic,
                hostId: req.body.hostId,
                hostName: req.body.hostName,
                participantId: req.body.participantId,
                participantName: req.body.participantName,
                participantEmail: req.body.emailAddress,
                meetingStartDate: req.body.meetingStartDate,
                meetingEndDate: req.body.meetingEndDate,
                meetingDescription: req.body.meetingDescription,
                meetingPlace: req.body.meetingPlace,
                createdOn: time.now()
            })

            newMeeting.save((err, newMeeting) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'meetingController: createMeeting', 10)
                    let apiResponse = response.generate(true, 'Failed to add new Meeting', 500, null)
                    reject(apiResponse)
                } else {
                    let newMeetingObj = newMeeting.toObject();                    
                   // Creating object for sending welcome email
                    let sendEmailOptions = {
                        email: newMeetingObj.participantEmail,
                        name: newMeetingObj.participantName,
                        subject: `Meeting Confirmed: ${newMeetingObj.meetingTopic}`,
                        html: `<h3> Your meeting is planned! </h3>
                              <br> Hi , ${newMeetingObj.hostName} has scheduled a meeting via MeetUp App.
                              <br>  

                            <div class="card" style="width: 15rem;">
                              <div class="card-body">
                                  <h4 class="card-title">Meetinng Description</h4>
                                  <p class="card-text">${newMeetingObj.meetingDescription}</p>
                              </div>
                            </div>

                              
                            <div class="card" style="width: 15rem;">
                                <div class="card-body">
                                    <h5 class="card-title">Meeting Time</h5>
                                    <p class="card-text">${newMeetingObj.meetingStartDate}</p>
                                </div>
                            </div>
                            
                            <div class="card" style="width: 15rem;">
                                <div class="card-body">
                                    <h5 class="card-title">Meeting Place</h5>
                                    <p class="card-text">${newMeetingObj.meetingPlace}</p>
                                </div>
                            </div>

                            `
                    }

                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 2000);

                    resolve(newMeetingObj)
                }
            })

        })
    }// end createMeeting function


    validateInputFromUser(req, res)
        .then(createMeeting)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Meeting Created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end createMeetingFunction 

/* Start fetchAllMeetingFunction */
/* params: userId
*/

let fetchAllMeetingFunction = (req, res) => {

    let getUserDetails = () => {
        return new Promise((resolve, reject) => {
            console.log(req.params.userId);
            UserModel.findOne({ 'userId': req.params.userId })
                .select()
                .lean()
                .exec((err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'Meeting Controller: getUserDetails', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.info('No User Found', 'Meeting  Controller:v')
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse)
                    } else {
                        response.generate(false, 'User Details Found', 200, userDetails)
                        resolve(userDetails)
                    }
                })
        })
    }// end getUserDetails

    let getMeetings = (userDetails) => {
        return new Promise((resolve, reject) => {            

            if (userDetails.isAdmin) {                
                MeetingModel.find({ 'hostId': req.params.userId })
                    .select()
                    .lean()
                    .exec((err, meetingDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'Meeting Controller: getMeetings', 10)
                            let apiResponse = response.generate(true, 'Failed To Find Meetings', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(meetingDetails)) {
                            logger.info('No Meeting Found', 'Meeting  Controller:getMeetings')
                            let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                            reject(apiResponse)
                        } else {
                            let apiResponse = response.generate(false, 'Meetings Found and Listed', 200, meetingDetails)
                            resolve(apiResponse)
                        }
                    })
            
            }
            else {
                MeetingModel.find({ 'participantId': req.params.userId })
                    .select()
                    .lean()
                    .exec((err, meetingDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'Meeting Controller: getMeetings', 10)
                            let apiResponse = response.generate(true, 'Failed To Find Meetings', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(meetingDetails)) {
                            logger.info('No Meeting Found', 'Meeting  Controller:findParticipant Meetings')
                            let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                            reject(apiResponse)
                        } else {
                            let apiResponse = response.generate(false, 'Meetings Found and Listed', 200, meetingDetails)
                            resolve(apiResponse)
                        }
                    })

            }

        })
    }// end getMeetings


    getUserDetails(req, res)
        .then(getMeetings)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Meetings Found and Listed', 200, resolve)
            res.send(resolve)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end fetchAllMeetingFunction 


/* Update Meeting details */
/* params: meetingId
   body : meetingTopic,meetingStartDate,meetingEndDate,meetingDescription,meetingPlace
*/

let updateMeetingFunction = (req, res) => {

    let getMeetingsDetails = () => {
        return new Promise((resolve, reject) => {
            MeetingModel.findOne({ 'meetingId': req.params.meetingId })
                .select()
                .lean()
                .exec((err, meetingDetails) => {
                    if (err) {                        
                        logger.error(err.message, 'Meeting Controller: getMeetingsDetails', 10)
                        let apiResponse = response.generate(true, 'Failed To Find Meeting Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(meetingDetails)) {
                        logger.info('No Meeting Found', 'Meeting  Controller:getMeetingsDetails')
                        let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                        reject(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'Meeting Details Found', 200, meetingDetails)
                        resolve(meetingDetails)
                    }
                })
        })
    }// end getMeetingsDetails

    let updateMeeting = (meetingDetails) => {
        return new Promise((resolve, reject) => {
            let meetingUpdateetails = req.body;
            MeetingModel.update({ 'meetingId': req.params.meetingId }, meetingUpdateetails).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Meeting Controller:updateMeeting', 10)
                    let apiResponse = response.generate(true, 'Failed To Update Meeting details', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No Meeting Found', 'Meeting Controller:updateMeeting')
                    let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                    reject(apiResponse)
                } else {

                    let newMeetingObj = meetingDetails;
                    let sendEmailOptions = {
                        email: newMeetingObj.participantEmail,
                        name: newMeetingObj.participantName,
                        subject: `Your Meeting Has Been Updated: ${meetingUpdateetails.meetingTopic}`,
                        html: `<h3> Your meeting has been modified! </h3>
                              <br> Hi , ${newMeetingObj.participantName} .
                              <br> ${newMeetingObj.hostName} Updated the meeting: ${meetingUpdateetails.meetingTopic}.
                              <br>
                                      
                              <div class="card" style="width: 15rem;">
                                  <div class="card-body">
                                      <h5 class="card-title">Meeting Topic</h5>
                                      <p class="card-text">${meetingUpdateetails.meetingDescription}</p>
                                  </div>
                              </div>

                              <div class="card" style="width: 15rem;">
                                  <div class="card-body">
                                      <h5 class="card-title">Meeting Start Date</h5>
                                      <p class="card-text">${meetingUpdateetails.meetingStartDate}</p>
                                  </div>
                              </div>
                              
                              <div class="card" style="width: 15rem;">
                                  <div class="card-body">
                                      <h5 class="card-title">Meeting Venue</h5>
                                      <p class="card-text">${meetingUpdateetails.meetingPlace}</p>
                                  </div>
                              </div>
        
                              `
                    }

                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 2000);


                    let apiResponse = response.generate(false, 'Meeting details Updated', 200, result)
                    resolve(result)
                }
            });// end meeting model update

        })
    }// end updateMeeting function


    getMeetingsDetails(req, res)
        .then(updateMeeting)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Meeting Updated', 200, "None")
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end updateMeetingFunction 
/* Start Delete Meeting  */
/* params : meetingId
*/
let deleteMeetingFromCalendar = (req, res) => {

    let getMeetingsDetails = () => {
        return new Promise((resolve, reject) => {
            MeetingModel.findOne({ 'meetingId': req.params.meetingId })
                .select()
                .lean()
                .exec((err, meetingDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'Meeting Controller: getMeetingsDetails', 10)
                        let apiResponse = response.generate(true, 'Failed To Find Meeting Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(meetingDetails)) {
                        logger.info('No Meeting Found', 'Meeting  Controller:getMeetingsDetails')
                        let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                        reject(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'Meeting Details Found', 200, meetingDetails)
                        resolve(meetingDetails)
                    }
                })
        })
    }// end validate user input

    let deleteMeeting = (meetingDetails) => {
        return new Promise((resolve, reject) => {

            MeetingModel.findOneAndRemove({ 'meetingId': req.params.meetingId }).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Meeting Controller: deleteMeeting', 10)
                    let apiResponse = response.generate(true, 'Failed To delete Meeting', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No Meeting Found', 'Meeting Controller: deleteMeeting')
                    let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                    reject(apiResponse)
                } else {
                    let newMeetingObj = meetingDetails;

                    let sendEmailOptions = {
                        email: newMeetingObj.participantEmail,
                        name: newMeetingObj.participantName,
                        subject: `Your Meeting Has Been Canceled: ${newMeetingObj.meetingTopic}`,
                        html: `<h3> Meeting Canceled </h3>
                              <br> Hi , ${newMeetingObj.participantName} .
                              <br> ${newMeetingObj.hostName} canceled the meeting: ${newMeetingObj.meetingTopic}.
                            `
                    }

                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 2000);


                    let apiResponse = response.generate(false, 'Deleted the Meeting successfully', 200, result)
                    resolve(result)
                }
            });// end meeting model find and remove

        })
    }// end deleteMeeting function


    getMeetingsDetails(req, res)
        .then(deleteMeeting)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Deleted the Meeting successfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end deleteMeetingFromCalendar 


module.exports = {
    createMeetingFunction: createMeetingFunction,
    fetchAllMeetingFunction: fetchAllMeetingFunction,
    updateMeetingFunction:updateMeetingFunction,
    deleteMeetingFromCalendar: deleteMeetingFromCalendar
}// end exports