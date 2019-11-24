const express = require('express');
const router = express.Router();
const meetingController = require("./../../app/controllers/meetingController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/meetings`;

    app.post(`${baseUrl}/createMeeting`, auth.isAuthorized, meetingController.createMeetingFunction);
    /**
     * @apiGroup Meetings
     * @apiVersion  1.0.0
     * @api {post} /api/v1/meetings/addMeeting  Add Meeting.
     *
     * @apiParam {string} authToken Authentication Token. (body/header/query params) (required)
     * @apiParam {string} eventTopic Topic of the Meeting. (body params) (required)
     * @apiParam {string} hostId User Id of the user hosting Meeting. (body params) (required)
     * @apiParam {string} hostName User Name of the user hosting Meeting. (body params) (required)
     * @apiParam {string} participantId User Id of the participant. (body params) (required)
     * @apiParam {string} participantName User Name of the participant. (body params) (required)
     * @apiParam {string} participantEmail Email of the participant. (body params) (required)
     * @apiParam {string} eventStartDate Start date/time of Meeting. (body params) (required)
     * @apiParam {string} eventEndDate end date/time of Meeting. (body params) (required)
     * @apiParam {string} eventDescription Description of Meeting. (body params) (required)
     * @apiParam {string} meetingPlace Place of Meeting. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Meeting Created Successfully",
            "status": 200,
            "data": {
                "__v": 0,
                "_id": "5b9a2581d1508e15f402fb36",
                "createdOn": "2019-11-13T08:53:21.000Z",
                "meetingPlace": "Manimangalam Palace",
                "meetingDescription": "My First Event for Checking",
                "meetingEndDate": "2019-12-12T19:57:50.382Z",
                "meetingStartDate": "2019-12-12T20:30:00.000Z",
                "participantEmail": "blikesekhar2@gmail.com",
                "participantName": "Chandra Sekhar",
                "participantId": "B2hdd90sh",
                "hostName": "Pavan Kumar",
                "hostId": "B2hdd90sh",
                "meetingTopic": "My First Event",
                "meetingId": "rJttBsw_m"
            }
        }
        @apiErrorExample {json} Error-Response:
        *
        * {
        *   "error": true,
        *   "message": "Failed To Create Meeting Details",
        *   "status": 500,
        *   "data": null
        * }

    */

   app.get(`${baseUrl}/view/all/meetings/:userId`, auth.isAuthorized, meetingController.fetchAllMeetingFunction);
   /**
    * @apiGroup Meetings
    * @apiVersion  1.0.0
    * @api {get} /api/v1/meetings/view/all/meetings/:userId  Meetings of User.
    *
    * @apiParam {string} userId userId of the user. (query params) (required)
    * @apiParam {string} authToken Authentication Token. (body/header/query params) (required)
    * 
    * @apiSuccess {object} myResponse shows error status, message, http status code, result.
    * 
    * @apiSuccessExample {object} Success-Response:
       {
           "error": false,
           "message": "Meetings Found",
           "status": 200,
           "data": [
               {
                   "_id": "5b9a2581d1508e15f402fb36",
                   "createdOn": "2019-11-23T08:53:21.000Z",
                   "meetingPlace": "Marina Beach",
                   "meetingDescription": "Marina Beach Team Outing",
                   "meetingEndDate": "2019-12-23T17:57:50.382Z",
                   "meetingStartDate": "2019-12-23T20:30:00.000Z",
                   "participantEmail": "blikesekhar2@gmail.com",
                   "participantName": "blikesekhar2 Tesrte",
                   "participantId": "B2hdd90sh",
                   "hostName": "Minto Tesrte",
                   "hostId": "B2hdd90sh",
                   "meetingTopic": "My First Event",
                   "meetingId": "rJttBsw_m",
                   "__v": 0
               }
           ]
       }
       @apiErrorExample {json} Error-Response:
        *
        * {
        *   "error": true,
        *   "message": "Failed To Get All Meeting Details",
        *   "status": 500,
        *   "data": null
        * }
   */

   // params: meetingId.
   app.put(`${baseUrl}/:meetingId/updateMeeting`, auth.isAuthorized, meetingController.updateMeetingFunction);
   /**
    * @apiGroup Meetings
    * @apiVersion  1.0.0
    * @api {put} /api/v1/meetings/:meetingId/updateMeeting  Update Meeting Details.
    *
    * @apiParam {string} authToken Authentication Token. (body/header/query params) (required)
    * @apiParam {string} meetingId Id of the Meeting. (query params) (required)
    * @apiParam {string} meetingTopic Topic of the Meeting. (body params) (required)
    * @apiParam {string} meetingStartDate Start date/time of Meeting. (body params) (required)
    * @apiParam {string} meetingEndDate end date/time of Meeting. (body params) (required)
    * @apiParam {string} meetingDescription Description of Meeting. (body params) (required)
    * @apiParam {string} meetingPlace Place of Meeting. (body params) (required)
    *
    * @apiSuccess {object} myResponse shows error status, message, http status code, result.
    * 
    * @apiSuccessExample {object} Success-Response:
       {
           "error": false,
           "message": "Meeting Updated",
           "status": 200,
           "data": {
               "error": false,
               "message": "Meeting details Updated",
               "status": 200,
               "data": "None"
           }
       }

       @apiErrorExample {json} Error-Response:
        *
        * {
        *   "error": true,
        *   "message": "Failed To Update Meeting Details",
        *   "status": 500,
        *   "data": null
        * }
   */
    
   // params: meetingId.
   app.post(`${baseUrl}/:meetingId/delete`, auth.isAuthorized, meetingController.deleteMeetingFromCalendar);

   /**
    * @apiGroup Meetings
    * @apiVersion  1.0.0
    * @api {post} /api/v1/meetings/:meetingId/delete  Delete Meeting.
    *
    * @apiParam {string} meetingId meetingId of the Meeting to be deleted. (query params) (required)
    * @apiParam {string} authToken Authentication Token. (body/header/query params) (required)
    * @apiSuccess {object} myResponse shows error status, message, http status code, result.
    * 
    * @apiSuccessExample {object} Success-Response:
       {
           "error": false,
           "message": "Meeting Deleted",
           "status": 200,
           "data": {
               "error": false,
               "message": "Deleted the Meeting successfully",
               "status": 200,
               "data": {
                   "_id": "5b9a2dac036ca203dc49534f",
                   "__v": 0,
                   "createdOn": "2019-11-13T09:28:12.000Z",
                   "meetingPlace": "Marina Beach",
                   "meetingDescription": "Marina Beach Team Outing",
                   "meetingEndDate": "2018-09-12T17:57:50.382Z",
                   "meetingStartDate": "2018-09-11T20:30:00.000Z",
                   "participantEmail": "blikesekhar2@gmail.com",
                   "participantName": "blikesekhar2 Tesrte",
                   "participantId": "B2hdd90sh",
                   "hostName": "Minto Tesrte",
                   "hostId": "B2hdd90sh",
                   "meetingTopic": "My First Event",
                   "meetingId": "rkHhTovdm"
               }
           }
       }
       @apiErrorExample {json} Error-Response:
        *
        * {
        *   "error": true,
        *   "message": "Failed To Delete Meeting Details",
        *   "status": 500,
        *   "data": null
        * }
   */
}

