const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email)
        //console.log(user);
        if(user.length == 0){
            return done(null, false, { message: 'No User with that email'})
        }

        try{
            if(await bcrypt.compare(password, user[0].password)){
                return done(null, user[0])
            } else {
                return done(null, false, { message: 'Incorrect Password'})
            }
        } catch(e){
            return done(e)
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize