const {Schema,models,model} =require('mongoose');
const {Snowflake}=require('@theinternetfolks/snowflake');



const roleSchema=new Schema({
    id:{
        type:String,
        required:true,
        unique:true,
        default: () => Snowflake.generate().toString(),
    },
    name:{
        type:String,
        required:true,
        unique:true,
        validate:{
            validator:function (val){
                const usernameRegex=/^[a-zA-Z0-9](?!.*[-._]{2,})(?!.*\s{2,})[a-zA-Z0-9][-._a-zA-Z0-9\s]{0,58}[a-zA-Z0-9]$/;
                return usernameRegex.test(val);
            },
            message:'Invalid username. Follow the specified criteria.',
        }
    },
    created_at:{
        type:Date,
        default:Date.now,
    },
    updated_at:{
        type:Date,
        default:Date.now,
    }
})

const Role=models.Role || model("Role",roleSchema);

module.exports=Role;