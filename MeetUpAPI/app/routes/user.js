const userController = require("./../../app/controllers/userController");
const updateController = require("./../../app/controllers/updateController");
const socialController = require("./../../app/controllers/socialController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    app.post(`${baseUrl}/signup`, userController.signUpFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login  user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "User created",
            "status": 200,
            "data": {
                "__v": 0,
                "_id": "5dda2b2dae780116265f964d",
                "validationToken": "",
                "createdOn": "2019-11-24T07:03:09.000Z",
                "mobileNumber": 917799056201,
                "type": "",
                "email": "blikesekhar2@gmail.com",
                "status": "offline",
                "lastName": "Lisa",
                "isAdmin": true,
                "userName": "cs6201-admin",
                "firstName": "Testre",
                "userId": "CpshJ5fu"
            }
            }    
            @apiErrorExample {json} Error-Response:
            *
            * {
            *   "error": true,
            *   "message": "Failed To Create User",
            *   "status": 500,
            *   "data": null
            * }
     */

    // params: email, password.
    app.post(`${baseUrl}/login`, userController.loginFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login  user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, data.
     * 
     * @apiSuccessExample {object} Success-Response:
     * {
    "error": false,
    "message": "Login Successful",
    "status": 200,
    "data": {
        "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IlRHbGFVUEZBIiwiaWF0IjoxNTc0NTc5NDA4NTg4LCJleHAiOjE1NzQ2NjU4MDgsInN1YiI6ImF1dGhUb2tlbiIsImlzcyI6ImVkQ2hhdCIsImRhdGEiOnsidmFsaWRhdGlvblRva2VuIjoiIiwibW9iaWxlTnVtYmVyIjo5MTc3OTkwNTYyMDEsInR5cGUiOiIiLCJlbWFpbCI6ImJsaWtlc2VraGFyMkBnbWFpbC5jb20iLCJzdGF0dXMiOiJvZmZsaW5lIiwibGFzdE5hbWUiOiJMaXNhIiwiaXNBZG1pbiI6dHJ1ZSwidXNlck5hbWUiOiJjczYyMDEtYWRtaW4iLCJmaXJzdE5hbWUiOiJUZXN0cmUiLCJ1c2VySWQiOiJDcHNoSjVmdSJ9fQ.dYa-GLgZDaLIv4rVe1O0DEbxCAhm7A0r0OheOTAQyr0",
        "userDetails": {
            "validationToken": "",
            "mobileNumber": 917799056201,
            "type": "",
            "email": "blikesekhar2@gmail.com",
            "status": "offline",
            "lastName": "Lisa",
            "isAdmin": true,
            "userName": "cs6201-admin",
            "firstName": "Testre",
            "userId": "CpshJ5fu"
             }
          }
        }
        
        @apiErrorExample {json} Error-Response:
        *
        * {
        *   "error": true,
        *   "message": "Failed To Find User Details",
        *   "status": 500,
        *   "data": null
        * }
     */

     
    // auth token params: userId.
    app.post(`${baseUrl}/:userId/logout`, auth.isAuthorized, userController.signOff);
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/logout Logout user.
     *
     * @apiParam {string} userId userId of the user. (auth headers) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Successfully Loggeed out",
            "status": 200,
            "data": null

        }
            @apiErrorExample {json} Error-Response:
            *
            * {
            *   "error": true,
            *   "message": "Failed To Logout ",
            *   "status": 500,
            *   "data": null
            * }


    */

     // params: email.
     app.post(`${baseUrl}/retrivePassword`, userController.retrivePasswordFunction);
     /**
      * @apiGroup users
      * @apiVersion  1.0.0
      * @api {post} /api/v1/users/retrivePassword  Password Reset.
      *
      * @apiParam {string} email email of the user. (body params) (required)
      *
      * @apiSuccess {object} myResponse shows error status, message, http status code, result.
      * 
      * @apiSuccessExample {object} Success-Response:
         {
             "error": false,
             "message": "Successfully Sent Password reset instructions",
             "status": 200,
             "data": None
         }    
            @apiErrorExample {json} Error-Response:
            *
            * {
            *   "error": true,
            *   "message": "Failed To Reset Password",
            *   "status": 500,
            *   "data": null
            * }

     */
    
     // params: validationToken,password.
     app.put(`${baseUrl}/updatePassword`, updateController.updatePasswordFunction);
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {put} /api/v1/users/retrivePassword  Updating Password after Reset.
     *
     * @apiParam {string} validationToken validationToken of the user recieved on Email. (body params) (required)
     * @apiParam {string} password new password of the user . (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Password  Successfully Updated",
            "status": 200,
            "data": "None"
            
        }

        @apiErrorExample {json} Error-Response:
        *
        * {
        *   "error": true,
        *   "message": "Failed To Update Details",
        *   "status": 500,
        *   "data": null
        * }

    */
    

    app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser);
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {get} /api/v1/users/view/all  Getting all users.
     *
     * @apiParam {string} authToken authToken of the user. (query/body/header params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "All User Details Found",
            "status": 200,
            "data": [
                {
                    "validationToken": "",
                    "createdOn": "2019-11-24T05:02:26.000Z",
                    "mobileNumber": 7799056201,
                    "type": "",
                    "email": "medineni.pavan@gmail.com",
                    "status": "offline",
                    "password": "$2b$10$L5Zbz29aAwaClEm4U4aukekkoW//uvCZya5QRlzSn8i8XxeQ2bQzq",
                    "lastName": "medineni",
                    "isAdmin": false,
                    "userName": "pavan",
                    "firstName": "pavan kumar",
                    "userId": "aaIK4O7q"
                }
            ]
        }

        @apiErrorExample {json} Error-Response:
        *
        * {
        *   "error": true,
        *   "message": "Failed To Find User Details",
        *   "status": 500,
        *   "data": null
        * }
    */
}
