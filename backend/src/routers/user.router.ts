import { Router } from "express";
import { sample_users } from "../data";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User, UserModel } from "../models/user.model";
import { HTTP_BAD_REQUEST } from "../constants/http_statuts";
import bcrypt from "bcryptjs";

const router = Router();

router.get("/seed", asyncHandler(
    async (req, res) => {
        const usersCount = await UserModel.countDocuments();
        if(usersCount > 0){
            res.send("Seed already done");
            return;
        }

        await UserModel.create(sample_users);
        res.send("Seed done");
    }
))

router.post("/login", asyncHandler(
    async (req, res) => {
        const {email, password} = req.body;
        const user = await UserModel.findOne({email});
    
        if(user && (await bcrypt.compare(password, user.password))){
            res.send(generateTokenResponse(user));
        }
        else{
            res.status(HTTP_BAD_REQUEST).send("User name or password is not valid");
        }
    })
)

router.post('/register', asyncHandler(
    async (req, res) => {
        const {name, email, password, address} = req.body;
        const user = await UserModel.findOne({email});
        if(user){
            res.send(HTTP_BAD_REQUEST)
            .send("User already exists");
            return;
        }
        
        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser:User = {
            id:'',
            name,
            email: email.toLowerCase(),
            password: encryptedPassword,
            address,
            isAdmin: false
        }

        const dbUser = await UserModel.create(newUser);
        res.send(generateTokenResponse(dbUser));
    }
))

router.put('/edit/:id', asyncHandler(
    async (req, res) => {
        const user = await UserModel.findById(req.params.id);
        if(!user){
            res.status(HTTP_BAD_REQUEST).send("User not found");
            return;
        }

        const {name, email, password, address} = req.body;
        user.name = name;
        user.email = email;
        user.address = address;
        if(password){
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.send(generateTokenResponse(user));
    }
));

router.get('/show', asyncHandler(
    async (req, res) => {
        const users = await UserModel.find();
        res.send(users);
    }
));

router.delete('/delete/:id', asyncHandler(
    async (req, res) => {
        const user = await UserModel.findById(req.params.id);
        if(!user){
            res.status(HTTP_BAD_REQUEST).send("User not found");
            return;
        }

        await user.deleteOne();
        res.send("User deleted");
    }
));

router.get('/:id', asyncHandler(
    async (req, res) => {
        const user = await UserModel.findById(req.params.id);
        if(!user){
            res.status(HTTP_BAD_REQUEST).send("User not found");
            return;
        }

        res.send(user);
    }
));

const generateTokenResponse = (user:any) => {
    const token = jwt.sign({
        id: user.id, email: user.email, isAdmin: user.isAdmin
    }, process.env.JWT_SECRET!, {
        expiresIn: '20d'
    })

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        address: user.address,
        isAdmin: user.isAdmin,
        token: token
    };
}

export default router;