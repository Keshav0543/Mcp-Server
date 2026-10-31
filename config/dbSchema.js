import mongoose from "mongoose";

const {Schema}=mongoose;

const todoSchema=new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    dueDate:{
        type:Date,
        required:true
    },
    priority:{
        type:String,
        enum:["low","medium","high"],
        required:true,
        default:"medium"
    },
    completed:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

const Todo=mongoose.model("Todo",todoSchema);
export default Todo;