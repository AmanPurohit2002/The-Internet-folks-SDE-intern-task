const {Schema,models,model}=require('mongoose');
const passwordValidator=require('password-validator');
const {Snowflake}=require('@theinternetfolks/snowflake');
const jwt = require("jsonwebtoken");

const passwordSchema=new passwordValidator();

passwordSchema
  .is().min(12) // Minimum length
  .is().max(100) // Maximum length (adjust as needed)
  .has().uppercase() // Must have uppercase letters
  .has().lowercase() // Must have lowercase letters
  .has().digits() // Must have digits
  .has().symbols() // Must have symbols
  .is().not().oneOf(['password', '123456', 'sun', 'admin']); // Not allowed to be common words or easily guessable

const userSchema=new Schema({
    id:{
        type:String,
        required:true,
        unique:true,
        default: () => Snowflake.generate().toString(),
    },
    name:{
        type:String,
        required:true,
        validate:{
            validator:function (val){
                const usernameRegex=/^[a-zA-Z0-9](?!.*[-._]{2,})(?!.*\s{2,})[a-zA-Z0-9][-._a-zA-Z0-9\s]{0,58}[a-zA-Z0-9]$/;
                return usernameRegex.test(val);
            },
            message:'Invalid username. Follow the specified criteria.',
        }
    },
    email:{
        type:String,
        required:true,
        validate:{
            validator:function(val){
                const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return val.length >=8 && emailRegex.test(val);
            },
            message: 'Email must be at least 12 characters long and have a valid format',
        }
    
    },
    password:{
        type:String,
        required:true,
        validate:{
            validator:function(val){
                return passwordSchema.validate(val);
            },
            message: 'Password must be at least 12 characters long and meet additional criteria',
        }
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
})

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: "12h" });
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.methods.getLatestToken = function () {
    const user = this;
    if (user.tokens.length > 0) {
        return user.tokens[user.tokens.length - 1].token;
    } else {
        return null;
    }
};

const User=models.User || model("User",userSchema);

module.exports=User;