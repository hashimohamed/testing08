let UserModel = require("../models/user.model.js");
const { use } = require("../routers/user.router.js");

//Retrieve all user details
let getUserDetails = (req, res) => {
  UserModel.find({}, (err, result) => {
    if (!err) {
      res.json(result);
    }
  });
};

let getTicketRasiedUsers = (req, res) => {
  UserModel.find({ isLocked: true, ticketRaised: true }, (err, result) => {
    if (!err) {
      res.json(result);
    }
  });
};

let getUsersWithOrders = (req, res) => {
  UserModel.find({ Orders: { $exists: true, $ne: [] } }, (err, result) => {
    if (!err) {
      res.json(result);
    }
  });
};

/* let getUserById = (req,res)=> {
    
    let pid = req.params.pid;       //passing id through path param 
    
    UserModel.find({_id:pid},(err,data)=> {
        if(!err){
            res.json(data);         // return array 
            //res.json(data[0])     // return only one object 
        }
    })
} */

let signUpUserDetails = (req, res) => {
  //let existingUserFlag = 3;
  if (UserModel.find({ email: req.body.email }).limit(1).length === 1)
    res.send("Entered email already exists");
  else {
    let user = new UserModel({
      isLocked: false,
      loginTries: 3,
      fName: req.body.fName,
      lName: req.body.lName,
      email: req.body.email,
      pWord: req.body.pWord,
      phoneNum: req.body.phoneNum,
      dob: req.body.dob,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      funds: 100,
      actNum: req.body.actNum,
      balance: 10000,
      ticketRaised: false,
      Orders: [],
      //autoGenID: req.body.fName.charAt[0] + req.body.lName + (Math.floor((Math.random() * 100) + 1)).toString(),
    });

    user.save((err, result) => {
      if (!err) {
        res.send("Record stored successfully!");
        //res.json(result);
      } else {
        res.send(err + " Record didn't store ");
      }
    });
  }
};

// Function for signing in and validating user
let signInUser = (req,res)=> {
  let uGenID = req.params.autoGenID;       //passing id through path param 
  let uPassword = req.params.pWord;

  // Looking for the user through ID
  UserModel.find({ autoGenID: uGenID }, (err, data) => {
    if (!err) {
      // If no initial err, then check if the user input ID is found
      // If not found then user does not exist, no need to lock the
      // potential user out
      if (data.length == 0) {
        let tempJSON = {
          msg: "User ID not found",
        };
        res.json(tempJSON);
        //res.send(false);
      }

      // If the id exists in the db, then proceed to check the inputed
      // password
      else {
        // Check if the user is locked out
        if (data[0].isLocked == true) {
          let tempJSON = {
            msg: "You are locked out! Raise ticket!",
          };
          res.json(tempJSON);
        }
        // If the user is not locked out then log in
        else {
          //res.send("Email found: " + data);
          // Looking for the user inputed password
          UserModel.find({ pWord: uPassword }, (errP, dataP) => {
            if (!errP) {
              // If the password is not found, then the user probably input
              // the password wrong, three trials begin for the user with the
              // correct id
              if (dataP.length == 0) {
                // Check if the user with the inputed email id is locked out if not and the
                // inputed password is incorrect, then decrement their number of tries
                // if the number of tries associated with the email id reaches 0, then lock that account
                if (data[0].isLocked == false) {
                  if (data[0].loginTries > 0) {
                    //res.send(false);
                    //res.send("Incorrect Password! " + data[0].loginTries + " tries left!");
                    let tempLoginTries = data[0].loginTries;
                    tempLoginTries--;
                    UserModel.updateOne(
                      { autoGenID: uGenID },
                      { $set: { loginTries: tempLoginTries } },
                      (err, result) => {}
                    );
                    let tempJSON = {
                      loginTries: data[0].loginTries,
                    };
                    res.json(tempJSON);
                    //res.send("Incorrect Password! " + data[0].loginTries + " tries left!");
                  } else {
                    //res.send("Your number of tries depleted. You are locked out! Raise ticket!");
                    //res.send(false);
                    UserModel.updateOne(
                      { autoGenID: uGenID },
                      { $set: { isLocked: true } },
                      (err, result) => {}
                    );
                    let tempJSON = {
                      msg:
                        "Your number of tries depleted. You are locked out! Raise ticket!",
                    };
                    res.json(tempJSON);
                    //res.send("Your number of tries depleted. You are locked out! Raise ticket!");
                  }
                } else if (data[0].isLocked == true) {
                  //res.send(false);
                  let tempJSON = {
                    msg: "You are locked out! Raise ticket!",
                  };
                  res.json(tempJSON);
                  //res.send("You are locked out! Raise ticket!");
                }
              }

              // User input correct credentials, proceed forward
              else {
                //res.send("Password correct");
                // Reset the user's number of tries, once they login correctly
                UserModel.updateMany(
                  { autoGenID: uGenID },
                  { $set: { loginTries: 3, isLocked: false } },
                  (err, result) => {
                    //res.json(result);
                  }
                );
                //dataP = JSON.parse(dataP);
                //res.send("Password correct");
                let tempJSON = {
                  msg: "Password correct",
                };
                res.json(tempJSON);
                //res.json(dataP);
              }
            } else {
              //res.send(false);
              let tempJSON = {
                msg: "Finding Password Error: " + errP,
              };
              res.json(tempJSON);
              //res.send("Finding Password Error: " + errP);
            }
          });
        }

        //res.send("Data is: " + data);
      }
    } else {
      //res.send(false);
      let tempJSON = {
        msg: "Finding Password Error: " + err,
      };
      res.json(tempJSON);
      //res.send("Finding Email Error" + err);
    }
  });
};

let unlockUser = (req, res) => {
  let uId = req.body.id;

  UserModel.updateOne(
    { autoGenID: uId },
    { $set: { isLocked: false, loginTries: 3, ticketRaised: false } },
    (err, result) => {
      if (!err) {
        if (result.nModified > 0) {
          res.send("User unlcoked");
        } else {
          res.send("Could  ot find user");
        }
      } else {
        res.send("error", err);
      }
    }
  );
};


// Function for Raising ticket (Updating the Boolean in the User Model)
let updateTicketRaised = (req,res)=> {
    let uFName = req.body.fName;
    let uLName = req.body.lName;
    let uEmail = req.body.email;
    let uGenID = req.body.autoGenID;
    let uRaiLowTick = req.body.raiseOrLowerTicker;

    // Check if the user or employee that is requesting to raise or lower the ticket of the account is actually locked 
    userActuallyLocked = req.body.raiseOrLowerTicker;
    //res.send("User is actually locked " + typeof(userActuallyLocked) + " uRaiLowTick: " + typeof(uRaiLowTick));
    UserModel.find({$and: [{fName:uFName}, {lName:uLName}, {email:uEmail}, {autoGenID:uGenID}]}, (err,data)=>{
        if(!err){
            if(data[0].isLocked == true){
                //res.send("User is actually locked");
                userActuallyLocked = true;
            }
            else{
                //res.send("User is NOT actually locked");
                userActuallyLocked = false;
            }
        }
        else{
            res.send("Error is raised: " + err);
        }
    });
    //res.send("User is actually locked " + userActuallyLocked + " uRaiLowTick: " + uRaiLowTick);

    if(userActuallyLocked == true){
        //res.send("User is actually locked" + userActuallyLocked + "uRaiLowTick: " + uRaiLowTick);
        // User is raising the ticket
        if(uRaiLowTick == true){
            //res.send("uRaiLowTick is true");
            UserModel.updateMany({$and: [{fName:uFName}, {lName:uLName}, {email:uEmail}, {autoGenID:uGenID}]},{$set:{ticketRaised:true}},(err,result)=> {
                if(!err){
                    if(result.nModified>0){
                            res.send("Ticket Raised succesfully")
                    }else {
                            res.send("User information invalid available");
                    }
                }else {
                    res.send("Error generated "+err);
                }
            })
        }
        // Employee is raising the ticket
        else if(uRaiLowTick == false){
          UserModel.updateMany({$and: [{fName:uFName}, {lName:uLName}, {email:uEmail}, {uGenID:autoGenID}]},{$set:{ticketRaised:false}},(err,result)=> {
            if(!err){
                if(result.nModified>0){
                  res.send("Ticket Resolved succesfully")
                }else {
                  res.send("User information invalid available");
                }
            }else {
              res.send("Error generated "+err);
            }
          })
        }
    // Employee is raising the ticket
    else if (uRaiLowTick == false) {
      UserModel.updateMany(
        { $and: [{ fName: uFName }, { lName: uLName }, { email: uEmail }] },
        { $set: { ticketRaised: false } },
        (err, result) => {
          if (!err) {
            if (result.nModified > 0) {
              res.send("Ticket Resolved succesfully");
            } else {
              res.send("User information invalid available");
            }
          } else {
            res.send("Error generated " + err);
          }
        }
      );
    }
  } else if (userActuallyLocked == false) {
    res.send("Account is not locked");
  }
};

let editProfile = (req, res) => {
  let id = req.body.autoGenID;
  let phone = req.body.phoneNum;
  let password = req.body.pWord;
  let state = req.body.state;
  let city = req.body.city;
  let street = req.body.street;
  let zip = req.body.zip;
  let uEmail = req.body.email;
  let fname = req.body.fname;
  let lname = req.body.lname;
  let newString = "UPDATES: ";
  phone = phone.trim();
  password = password.trim();
  state = state.trim();
  city = city.trim();
  street = street.trim();
  uEmail = uEmail.trim();
  fname = fname.trim();
  lname = lname.trim();

  if (id != "") {
    UserModel.updateOne(
      {
        $and: [
          { fName: fname },
          { lName: lname },
          { email: uEmail },
          { pWord: password },
        ],
      },
      { $set: { autoGenID: id } },
      (err, result) => {
        if (!err) {
          if (result.nModified > 0) {
            newString += " New User ID updated! ";
            //res.send(req.body.autoGenID);
          }
        }
      }
    );
  }

  if (phone != "") {
    UserModel.updateOne(
      {$and: {autoGenID:id}},
      { $set: { phoneNum: phone } },
      (err, result) => {
        if (!err) {
          if (result.nModified > 0) {
            newString += " Phone updated! ";
          }
        }
      }
    );
  }

  if (password != "") {
    UserModel.updateOne(
      {$and: {autoGenID:id}},
      { $set: { pWord: password } },
      (err, result) => {
        if (!err) {
          if (result.nModified > 0) {
            newString += " Password updated! ";
          }
        }
      }
    );
  }

  if (state != "") {
    UserModel.updateOne(
      {$and: {autoGenID:id}},
      { $set: { state: state } },
      (err, result) => {
        if (!err) {
          if (result.nModified > 0) {
            newString += " State updated! ";
          }
        }
      }
    );
  }

  if (city != "") {
    UserModel.updateOne(
      {$and: {autoGenID:id}},
      { $set: { city: city } },
      (err, result) => {
        if (!err) {
          if (result.nModified > 0) {
            newString += " City updated! ";
          }
        }
      }
    );
  }

  if (street != "") {
    UserModel.updateOne(
      {$and: {autoGenID:id}},
      { $set: { street: street } },
      (err, result) => {
        if (!err) {
          if (result.nModified > 0) {
            newString += " Street updated! ";
          }
        }
      }
    );
  }

  if (uEmail != "") {
    UserModel.updateOne(
      {$and: {autoGenID:id}},
      { $set: { email: uEmail } },
      (err, result) => {
        if (!err) {
          if (result.nModified > 0) {
            newString += " Email updated! ";
          }
        }
      }
    );
  }

  if (lname != "") {
    UserModel.updateOne(
      {$and: {autoGenID:id}},
      { $set: { lname: lname } },
      (err, result) => {
        if (!err) {
          if (result.nModified > 0) {
            newString += " Last name updated! ";
          }
        }
      }
    );
  }

  if (fname != "") {
    UserModel.updateOne(
      {$and: {autoGenID:id}},
      { $set: { fname: fname } },
      (err, result) => {
        if (!err) {
          if (result.nModified > 0) {
            newString += " First Name updated! ";
          }
        }
      }
    );
  }

  if (zip != null) {
    UserModel.updateOne(
      {$and: {autoGenID:id}},
      { $set: { zip: zip } },
      (err, result) => {
        if (!err) {
          if (result.nModified > 0) {
            newString += " Zip updated! ";
          }
        }
      }
    );
  }

  res.send(newString);
};

let genrateUserID = (req, res) => {
  let uPWord = req.body.pWord;
  let uEmail = req.body.email;
  let uFName = req.body.fName;
  let uLName = req.body.lName;
  //res.send("In Generate ID " + uEmail + " " + req.body.fName + " " + req.body.lName + " " + uPWord);
  UserModel.updateMany({$and: [{fName:uFName}, {lName:uLName}, {email:uEmail}, {pWord:uPWord}]},
    {$set:{autoGenID: uFName + uLName + (Math.floor((Math.random() * 100) + 1)).toString()}},(err,result)=> {
    if(!err){
        /* if(result.nModified>0){
          res.send("Your New UserID: " + autoGenID);
        }else {
          res.send("ID was not generat
          ed");
        } */
    }else {
        res.send("Error generated " + err);
      }
    }
  );
};

// done before doing a checkout. make sure user has enough money to buy
// return how much money would be left
let checkProperFunds = (req, res) => {
  let id = req.body.id;
  let cost = req.body.cost;

  UserModel.find({uGenID:id}, (err, result) => {
    if (!err) {
      console.log("Result:", result);
      console.log(result.funds);
      if (result[0].funds > cost) {
        let newFunds = {};
        newFunds.fund = result[0].funds - cost;
        newFunds.approved = true;
        newFunds.error = "";
        res.json(newFunds);
      } else {
        let errorObj = { fund: 0, error: "not enough funds", approved: false };
        res.json(errorObj);
      }
    } else {
      res.send("couldnt find record in checkproper funds");
    }
  });
};

// user is checkoing out and there has already been a check to make sure there is enough money to buy
let checkout = (req, res) => {
  let userID = req.body.user;
  let newFunds = req.body.newFunds;
  let newString = "";
  let newObj = { funds: false, orders: false };

  let orderObj = {
    id: 134,
    products: req.body.products, // array of product names,
    cost: req.body.cost,
    status: "bought",
  };

  UserModel.updateOne(
    { autoGenID: userID },
    { $set: { funds: newFunds } },
    (err, result) => {
      if (!err) {
        if (result.nModified > 0) {
          console.log("updayed funds");
          newObj.funds = true;
        } else {
          res.send("record was not found in checkout");
        }
      } else {
        res.send("error occured in checkolut");
      }
    }
  );

  UserModel.updateOne(
    { autoGenID: userID },
    { $push: { Orders: orderObj } },
    (err, result) => {
      if (!err) {
        if (result.nModified > 0) {
          console.log("updated orders");
          newObj.orders = true;
          res.json(newObj);
        } else {
          res.send("record was not found in checkout");
        }
      } else {
        res.send("error occured in checkolut");
      }
    }
  );
};

let getSingleUser = (req, res) => {
  let uFName = req.params.fName;
  let uLName = req.params.lName;
  let uEmail = req.params.email;
  let uPWord = req.params.pWord;
  let uGenId = req.params.autoGenID

  UserModel.find({$and: [{fName:uFName}, {lName:uLName}, {email:uEmail}, {pWord:uPWord}, {autoGenID:uGenId}]}, (err, result) => {
    if (!err) {
      res.json(result[0]);
    } 
    else {
      let tempJSON = {
        msg: "User doesnt exits: " + err,
      };
      res.json(tempJSON);
    }
  });
};

let updateFunds = (req, res) => {
  let id = req.body.id;
  let account = req.body.account;
  let amount = req.body.amount;

  UserModel.find({ autoGenID: id, actNum: account }, (err1, result1) => {
    if (!err1) {
      // we have the right user with account
      if (result1[0].balance > amount) {
        // subtract from balance and add to funds
        let newBalance = result1[0].balance - amount;
        let newFunds = result1[0].funds + amount;
        UserModel.updateOne(
          { autoGenID: id, actNum: account },
          { $set: { balance: newBalance, funds: newFunds } },
          (err2, result2) => {
            if (!err2) {
              if (result2.nModified > 0) {
                let obj = { approved: true };
                res.json(obj);
              } else {
                res.send("couldnt find account");
              }
            } else {
              res.send("error occured in checkaccount number 2");
            }
          }
        );
      } else {
        res.send(
          "You dont have enough money in your balance to do this transfer"
        );
      }
    } else {
      res.send("The account is wrong for user");
    }
  });
};

let updateOrderStatus = (req, res) => {
  let uID = req.body.userID;
  let orderID = req.body.orderID;
  let newStatus = req.body.status;

  UserModel.updateOne(
    {
      autoGenID: uID,
      Orders: { $exits: true, $elemMatch: { id: orderID } },
    },
    {
      $set: {
        "Orders.$.status": "newStatus",
      },
    },
    (err, result) => {
      if (!err) {
        if (result.nModified > 0) {
          let newObj = {
            approved: true,
          };
          res.json(newObj);
        } else {
          let errorObj = {
            approved: false,
          };
          res.json(errorObj);
        }
      } else {
        res.send("error updating status", err);
      }
    }
  );
};

/* let deleteProductById= (req,res)=> {
    let pid = req.params.pid;
    UserModel.deleteOne({_id:pid},(err,result)=> {
        if(!err){
                if(result.deletedCount>0){
                    res.send("Record deleted successfully")
                }else {
                    res.send("Record not present");
                }
        }else {
            res.send("Error generated "+err);
        }
    })

}

let updateProductPrice= (req,res)=> {
    let pid = req.body.pid;
    let updatedPrice = req.body.price;
    UserModel.updateMany({_id:pid},{$set:{price:updatedPrice}},(err,result)=> {
        if(!err){
            if(result.nModified>0){
                    res.send("Record updated succesfully")
            }else {
                    res.send("Record is not available");
            }
        }else {
            res.send("Error generated "+err);
        }
    })

} */

//module.exports={getProductDetails,getProductById,storeProductDetails,deleteProductById,updateProductPrice}

module.exports = {
  getUserDetails,
  signUpUserDetails,
  signInUser,
  checkout,
  checkProperFunds,
  getSingleUser,
  editProfile,
  updateFunds,
  updateTicketRaised,
  getTicketRasiedUsers,
  getUsersWithOrders,
  genrateUserID,
  unlockUser,
  updateOrderStatus,
};
