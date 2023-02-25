// best to do token as a separate schema

// also do time validation on the otps


// forget password vs change password, 

// change password, you logged in, just make a put request after validating previous password

// forget password, send an email using FE link that'll get a UI, that'll now call POST endpoint to create new password

// don't use this forget password method for validating email, still let the link be a BE endpoint